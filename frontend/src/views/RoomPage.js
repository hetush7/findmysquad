/*!

=========================================================
* Paper Kit React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/paper-kit-react

* Copyright 2021 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/paper-kit-react/blob/main/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useState } from "react";

// reactstrap components
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Progress,
  Row
} from "reactstrap";

// core components
import Navbar from "components/Navbars/PageNavbar.js";
import PageFooter from "components/Footers/PageFooter";
import API from "api/API";
import RoomChat from "components/RoomChat";
import platforms from "assets/data/platforms";
import { rankRangeLabel } from "utils/ranks";
import { useHistory, useLocation } from "react-router";

import "assets/css/RoomPage.css";

// colour an avatar consistently from the username
const AVATAR_COLORS = ["#51cbce", "#6bd098", "#51bcda", "#fbc658", "#f5593d", "#9368e9"];
function avatarColor(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash];
}

function Avatar({ username }) {
  return (
    <span className="room-avatar" style={{ backgroundColor: avatarColor(username) }}>
      {username.charAt(0).toUpperCase()}
    </span>
  );
}

// the platforms a player has added gamer tags for, e.g. "PSN · PlayerOne"
function GamerTags({ tags }) {
  const filled = platforms.filter(platform => tags && tags[platform.key]);
  if (filled.length === 0) {
    return null;
  }
  return (
    <div className="room-player-tags">
      {filled.map(platform => (
        <span className="room-tag" key={platform.key} title={platform.label}>
          <b>{platform.short}</b> {tags[platform.key]}
        </span>
      ))}
    </div>
  );
}

// TODO: Privacy on data for hidden sections
function RoomPage() {
  document.documentElement.classList.remove("nav-open");

  const api = API.getApi();
  const history = useHistory();
  const { search } = useLocation();

  // the room id comes from the URL (?id=), falling back to the one stored by the sessions page
  const sessionID = new URLSearchParams(search).get("id") || sessionStorage.getItem("sessionID");
  const currentUser = localStorage.getItem("current_user");

  const [session, setSession] = useState(null);
  const [game, setGame] = useState(null);
  const [notice, setNotice] = useState(null); // { color, text }
  const [busy, setBusy] = useState(false);

  const hasLoadedRef = React.useRef(false);

  // fetch the latest session data; if it no longer exists, leave the page
  const refreshSession = React.useCallback(async () => {
    const data = await api.getSession(sessionID);
    if (!data) {
      // a room that was open here has since been closed by its host
      history.push(hasLoadedRef.current ? "/sessions-page" : "/error-404");
      return null;
    }
    hasLoadedRef.current = true;
    setSession(data);
    return data;
  }, [api, sessionID, history]);

  // fetch the session, then the game it belongs to
  const loadSession = React.useCallback(async () => {
    const data = await refreshSession();
    if (data) {
      setGame(await api.getGame(data.gameID));
    }
  }, [api, refreshSession]);

  React.useEffect(() => {
    document.body.classList.add("room-page");
    return function cleanup() {
      document.body.classList.remove("room-page");
    };
  }, []);

  React.useEffect(() => {
    // no sessionID happens when entering this page manually instead of from the sessions page
    if (sessionID == null) {
      history.push("/error-404");
      return;
    }
    sessionStorage.setItem("sessionID", sessionID);
    loadSession();
  }, [sessionID, history, loadSession]);

  // keep the squad list up to date while the page is open (players joining, leaving, being removed)
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        refreshSession();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshSession]);

  if (session === null) {
    return (
      <>
        <Navbar />
        <div className="room-hero section-dark room-loading">Loading room…</div>
      </>
    );
  }

  const isHost = session.hostUsername === currentUser;
  const isMember = isHost || session.players.some(player => player.username === currentUser);
  const playerCount = session.players.length;
  const openSlots = Math.max(session.maxPlayers - playerCount, 0);
  const inviteLink = `${window.location.origin}/room-page?id=${session.id}`;

  async function join() {
    setBusy(true);
    const joined = await api.joinSession(session.id);
    setBusy(false);
    if (joined) {
      setNotice({ color: "success", text: "You're in! Check the join details and say hi in the chat." });
      refreshSession();
    } else {
      setNotice({ color: "danger", text: "Unable to join. You may already be in another room, or this one just filled up." });
    }
  }

  async function leave() {
    if (isHost && !window.confirm("Leaving will close this room for everyone. Continue?")) {
      return;
    }
    setBusy(true);
    await api.leaveSession(session.id);
    history.push("/sessions-page");
  }

  async function kickUser(player) {
    if (!window.confirm(`Remove ${player.username} from the room?`)) {
      return;
    }
    if (await api.removePlayerFromSession(player.userID, session.id)) {
      setNotice({ color: "info", text: `${player.username} has been removed.` });
      refreshSession();
    } else {
      setNotice({ color: "danger", text: `Couldn't remove ${player.username}.` });
    }
  }

  async function copy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice({ color: "info", text: `${label} copied to clipboard.` });
    } catch {
      // clipboard access can be blocked (e.g. insecure origin); show the text so it can be copied by hand
      setNotice({ color: "warning", text: `Couldn't copy automatically. ${label}: ${text}` });
    }
  }

  return (
    <>
      <Navbar />
      <div className="wrapper">
        <div className="room-hero section-dark">
          <Container>
            <Row className="align-items-center">
              <Col md="3" className="text-center">
                <img
                  alt={game ? game.gameName : ""}
                  className="room-hero-logo"
                  src={process.env.PUBLIC_URL + session.gameImagePath}
                />
              </Col>
              <Col md="9">
                <p className="room-hero-game">{game ? game.gameName : session.gameShortName}</p>
                <h1 className="room-hero-title">{session.sessionName}</h1>
                <div className="room-hero-meta">
                  <span>Hosted by <b>{session.hostUsername}</b></span>
                  <Badge color={session.full ? "danger" : "success"} pill>
                    {session.full ? "Full" : `${openSlots} slot${openSlots === 1 ? "" : "s"} open`}
                  </Badge>
                  <Badge color="info" pill>{rankRangeLabel(session)}</Badge>
                  {isHost && <Badge color="warning" pill>You're the host</Badge>}
                </div>
              </Col>
            </Row>
          </Container>
        </div>

        <div className="section room-body">
          <Container>
            {notice && (
              <Alert color={notice.color} isOpen toggle={() => setNotice(null)}>
                {notice.text}
              </Alert>
            )}
            <Row>
              <Col lg="7">
                <Card className="room-card">
                  <CardHeader className="room-card-header">
                    <h4>Squad</h4>
                    <span className="room-count">{playerCount}/{session.maxPlayers} players</span>
                  </CardHeader>
                  <CardBody>
                    <Progress
                      className="room-progress"
                      color={session.full ? "danger" : "success"}
                      value={(playerCount / session.maxPlayers) * 100}
                    />
                    <ul className="room-players">
                      <li className="room-player">
                        <Avatar username={session.hostUsername} />
                        <div className="room-player-info">
                          <div className="room-player-line">
                            <span className="room-player-name">{session.hostUsername}</span>
                            <Badge color="warning" pill>Host</Badge>
                            {isHost && <Badge color="default" pill>You</Badge>}
                          </div>
                          <GamerTags tags={session.hostGamerTags} />
                        </div>
                      </li>
                      {session.players.map(player => (
                        <li className="room-player" key={player.userID}>
                          <Avatar username={player.username} />
                          <div className="room-player-info">
                            <div className="room-player-line">
                              <span className="room-player-name">{player.username}</span>
                              {player.username === currentUser && <Badge color="default" pill>You</Badge>}
                            </div>
                            <GamerTags tags={player.gamerTags} />
                          </div>
                          {isHost && (
                            <Button
                              className="btn-round room-kick"
                              color="danger"
                              outline
                              size="sm"
                              onClick={() => kickUser(player)}
                            >
                              Remove
                            </Button>
                          )}
                        </li>
                      ))}
                      {Array.from({ length: openSlots }).map((_, idx) => (
                        <li className="room-player room-player-empty" key={"slot" + idx}>
                          <span className="room-avatar room-avatar-empty">+</span>
                          <span className="room-player-name">Open slot</span>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>

                {isMember && (
                  <Card className="room-card">
                    <CardHeader className="room-card-header">
                      <h4>Squad chat</h4>
                    </CardHeader>
                    <CardBody>
                      <RoomChat sessionID={session.id} currentUser={currentUser} onAccessLost={refreshSession} />
                    </CardBody>
                  </Card>
                )}
              </Col>

              <Col lg="5">
                <Card className="room-card">
                  <CardBody>
                    <h4 className="room-section-title">About this room</h4>
                    <p className="room-description">{session.sessionDescription}</p>

                    {!isMember && (
                      <>
                        <Button
                          block
                          className="btn-round"
                          color="primary"
                          size="lg"
                          disabled={session.full || busy}
                          onClick={join}
                        >
                          {session.full ? "Room is full" : "Join squad"}
                        </Button>
                        <p className="room-hint">Join details are shared with squad members only.</p>
                      </>
                    )}

                    {isMember && (
                      <>
                        <div className="room-join-info">
                          <div className="room-join-info-header">
                            <h5>How to join</h5>
                            <Button color="link" size="sm" onClick={() => copy(session.joinDescription, "Join details")}>
                              Copy
                            </Button>
                          </div>
                          <p>{session.joinDescription}</p>
                        </div>
                        <Button block className="btn-round" color="info" outline onClick={() => copy(inviteLink, "Invite link")}>
                          Copy invite link
                        </Button>
                        <Button block className="btn-round" color="danger" outline disabled={busy} onClick={leave}>
                          {isHost ? "Close room" : "Leave room"}
                        </Button>
                      </>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
      <PageFooter />
    </>
  );
}

export default RoomPage;
