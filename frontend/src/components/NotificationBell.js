import React, { useState } from "react";
import { useHistory } from "react-router";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";

import API from "api/API";
import "assets/css/NotificationBell.css";

const POLL_INTERVAL_MS = 30000;

// Notification data for the navbar: polls every 30s while the tab is visible.
// Shared by the desktop and mobile bells so the server is only polled once.
export function useNotifications(enabled) {
  const api = API.getApi();
  const history = useHistory();
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);

  const apply = data => {
    if (data) {
      setUnread(data.unread);
      setItems(data.items);
    }
  };

  // skipIfHidden: background tabs don't keep polling, but the first load always runs
  const load = React.useCallback(async (skipIfHidden = false) => {
    if (!enabled || (skipIfHidden && document.hidden)) {
      return;
    }
    apply(await api.getNotifications());
  }, [api, enabled]);

  React.useEffect(() => {
    const loadIfVisible = () => load(true);
    load();
    const interval = setInterval(loadIfVisible, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", loadIfVisible);
    return function cleanup() {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", loadIfVisible);
    };
  }, [load]);

  async function open(item) {
    if (!item.read) {
      apply(await api.markNotificationsRead({ ids: [item.id] }));
    }
    if (item.link) {
      history.push(item.link);
    }
  }

  async function markAllRead() {
    apply(await api.markNotificationsRead({ all: true }));
  }

  return { unread, items, load, open, markAllRead };
}

// Bell with unread count and a dropdown of notifications.
// inNav: rendered inside the navbar's <Nav> (desktop); otherwise next to the mobile menu button.
function NotificationBell({ notifications, inNav = true, className = "" }) {
  const { unread, items, load, open, markAllRead } = notifications;

  return (
    <UncontrolledDropdown nav={inNav} inNavbar={inNav} className={"notification-bell " + className}>
      <DropdownToggle nav={inNav} color="link" aria-label={`Notifications (${unread} unread)`} onClick={() => load()}>
        <i className="nc-icon nc-bell-55" />
        {unread > 0 && <span className="notification-count">{unread > 9 ? "9+" : unread}</span>}
      </DropdownToggle>
      <DropdownMenu right className="notification-menu">
        <div className="notification-menu-header">
          <span>Notifications</span>
          {unread > 0 && (
            <button type="button" className="notification-mark-all" onClick={markAllRead}>Mark all read</button>
          )}
        </div>
        {items.length === 0 && <p className="notification-empty">You're all caught up.</p>}
        {items.map(item => (
          <DropdownItem key={item.id} className={item.read ? "" : "notification-unread"} onClick={() => open(item)}>
            {item.text}
            <small>{new Date(item.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</small>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

export default NotificationBell;
