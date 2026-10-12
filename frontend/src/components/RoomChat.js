import React, { useState } from "react";
import { Button, Form, Input } from "reactstrap";

import API from "api/API";

const POLL_INTERVAL_MS = 3000;
const LIVE_POLL_INTERVAL_MS = 30000; // safety net while the WebSocket is connected
const MAX_MESSAGE_LENGTH = 500;
const MAX_RECONNECT_DELAY_MS = 30000;

// close codes from the server (fms/consumers.py)
const CLOSE_UNAUTHORIZED = 4401;
const CLOSE_FORBIDDEN = 4403;

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Squad chat for a room. New messages arrive live over a WebSocket; if that isn't available the chat
// polls the server every few seconds instead (and keeps trying to reconnect).
// onAccessLost is called when the server says the user is no longer a squad member.
function RoomChat({ sessionID, currentUser, onAccessLost }) {
  const api = API.getApi();

  const [messages, setMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [reported, setReported] = useState({}); // message id -> true
  const [live, setLive] = useState(false);

  const lastIdRef = React.useRef(null);
  const pollingRef = React.useRef(false);
  const listRef = React.useRef(null);
  const stickToBottomRef = React.useRef(true);
  const liveRef = React.useRef(false);
  const lastPollRef = React.useRef(0);

  // merge new messages in, skipping any we already have
  const addMessages = React.useCallback((incoming) => {
    if (incoming.length === 0) {
      return;
    }
    lastIdRef.current = Math.max(lastIdRef.current || 0, ...incoming.map(m => m.id));
    setMessages(previous => {
      const known = new Set(previous.map(m => m.id));
      return previous.concat(incoming.filter(m => !known.has(m.id)));
    });
  }, []);

  // skipIfHidden: background tabs don't keep polling, but the first load always runs
  const poll = React.useCallback(async (skipIfHidden) => {
    if (pollingRef.current || (skipIfHidden && document.hidden)) {
      return;
    }
    // while the WebSocket is live, polling is only a slow safety net
    if (skipIfHidden && liveRef.current && Date.now() - lastPollRef.current < LIVE_POLL_INTERVAL_MS) {
      return;
    }
    lastPollRef.current = Date.now();
    pollingRef.current = true;
    const result = await api.getChatMessages(sessionID, lastIdRef.current);
    pollingRef.current = false;

    if (result.messages) {
      addMessages(result.messages);
      setLoaded(true);
      setError(previous => (previous === "Reconnecting…" ? null : previous));
    } else if (result.status === 403 || result.status === 404) {
      onAccessLost();
    } else {
      setError("Reconnecting…");
    }
  }, [api, sessionID, addMessages, onAccessLost]);

  React.useEffect(() => {
    const pollIfVisible = () => poll(true);
    poll(false);
    const interval = setInterval(pollIfVisible, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", pollIfVisible);
    return function cleanup() {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", pollIfVisible);
    };
  }, [poll]);

  // live messages over a WebSocket, reconnecting with a growing delay if the connection drops
  React.useEffect(() => {
    let socket = null;
    let stopped = false;
    let retryTimer = null;
    let delay = 2000;
    let renewedToken = false;

    const setLiveState = value => {
      liveRef.current = value;
      setLive(value);
    };

    function scheduleReconnect() {
      if (stopped) {
        return;
      }
      retryTimer = setTimeout(connect, delay);
      delay = Math.min(delay * 2, MAX_RECONNECT_DELAY_MS);
    }

    function connect() {
      if (typeof WebSocket === "undefined") {
        return;
      }
      socket = new WebSocket(api.chatSocketUrl(sessionID));
      socket.onopen = () => socket.send(JSON.stringify({ type: "auth", token: api.getAccessToken() }));
      socket.onmessage = event => {
        const data = JSON.parse(event.data);
        if (data.type === "ready") {
          delay = 2000;
          renewedToken = false;
          setLiveState(true);
          poll(false); // catch anything sent while we were connecting
        } else if (data.type === "message") {
          addMessages([data.message]);
        }
      };
      socket.onclose = async event => {
        setLiveState(false);
        if (stopped) {
          return;
        }
        if (event.code === CLOSE_FORBIDDEN) {
          onAccessLost();
          return;
        }
        if (event.code === CLOSE_UNAUTHORIZED && !renewedToken) {
          renewedToken = true;
          if (await api.renewAccessToken()) {
            connect();
            return;
          }
        }
        scheduleReconnect();
      };
    }

    connect();
    return function cleanup() {
      stopped = true;
      clearTimeout(retryTimer);
      if (socket) {
        socket.close();
      }
    };
  }, [api, sessionID, addMessages, poll, onAccessLost]);

  // keep the newest message in view, unless the user has scrolled up to read history
  React.useEffect(() => {
    const list = listRef.current;
    if (list && stickToBottomRef.current) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messages]);

  function onScroll() {
    const list = listRef.current;
    stickToBottomRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 40;
  }

  async function send(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) {
      return;
    }
    setSending(true);
    const result = await api.sendChatMessage(sessionID, text);
    setSending(false);

    if (result.message) {
      stickToBottomRef.current = true;
      addMessages([result.message]);
      setDraft("");
      setError(null);
    } else {
      setError(result.error);
    }
  }

  async function report(message) {
    if (!window.confirm(`Report this message from ${message.username} to the moderators?`)) {
      return;
    }
    if (await api.reportChatMessage(sessionID, message.id)) {
      setReported(previous => ({ ...previous, [message.id]: true }));
    } else {
      setError("Couldn't report that message.");
    }
  }

  return (
    <div className="room-chat">
      <div className="room-chat-messages" ref={listRef} onScroll={onScroll}>
        {!loaded && <p className="room-chat-empty">Loading chat…</p>}
        {loaded && messages.length === 0 && (
          <p className="room-chat-empty">No messages yet. Say hi to your squad!</p>
        )}
        {messages.map((message, idx) => {
          const mine = message.username === currentUser;
          const showName = !mine && (idx === 0 || messages[idx - 1].username !== message.username);
          return (
            <div className={"room-chat-message" + (mine ? " mine" : "")} key={message.id}>
              {showName && <span className="room-chat-sender">{message.username}</span>}
              <div className="room-chat-bubble">{message.text}</div>
              <span className="room-chat-meta">
                {formatTime(message.createdAt)}
                {!mine && (
                  reported[message.id]
                    ? <span className="room-chat-reported">Reported</span>
                    : <button type="button" className="room-chat-report" onClick={() => report(message)}>Report</button>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {error && <p className="room-chat-error">{error}</p>}
      {live && <p className="room-chat-live" title="New messages arrive instantly">● Live</p>}

      <Form className="room-chat-form" onSubmit={send}>
        <Input
          type="text"
          placeholder="Message your squad…"
          maxLength={MAX_MESSAGE_LENGTH}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          aria-label="Chat message"
        />
        <Button className="btn-round" color="primary" type="submit" disabled={sending || !draft.trim()}>
          Send
        </Button>
      </Form>
    </div>
  );
}

export default RoomChat;
