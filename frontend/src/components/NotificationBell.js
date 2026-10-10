import React, { useState } from "react";
import { useHistory } from "react-router";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";

import API from "api/API";
import "assets/css/NotificationBell.css";

const POLL_INTERVAL_MS = 30000;

// Navbar bell with unread count; lists friend requests, accepted requests and room invites.
function NotificationBell() {
  const api = API.getApi();
  const history = useHistory();
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);

  const load = React.useCallback(async () => {
    if (document.hidden) {
      return;
    }
    const data = await api.getNotifications();
    if (data) {
      setUnread(data.unread);
      setItems(data.items);
    }
  }, [api]);

  React.useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", load);
    return function cleanup() {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", load);
    };
  }, [load]);

  async function open(item) {
    if (!item.read) {
      const data = await api.markNotificationsRead({ ids: [item.id] });
      if (data) {
        setUnread(data.unread);
        setItems(data.items);
      }
    }
    if (item.link) {
      history.push(item.link);
    }
  }

  async function markAllRead() {
    const data = await api.markNotificationsRead({ all: true });
    if (data) {
      setUnread(data.unread);
      setItems(data.items);
    }
  }

  return (
    <UncontrolledDropdown nav inNavbar className="notification-bell">
      <DropdownToggle nav aria-label={`Notifications (${unread} unread)`} onClick={load}>
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
