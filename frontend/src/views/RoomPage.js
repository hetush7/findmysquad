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
import React, {useState} from "react";

// reactstrap components
import { 
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Button,
  Container
} from "reactstrap";

// core components
import Navbar from "components/Navbars/PageNavbar.js";
import PageFooter from "components/Footers/PageFooter";
import API from "api/API";
import { useHistory, useLocation } from "react-router";

// TODO: Privacy on data for hidden sections
function RoomPage() {
  document.documentElement.classList.remove("nav-open");
  
  // get sessionID from web session storage
  let sessionID = sessionStorage.getItem("sessionID")

  // get api and game
  let api  = API.getApi();

  let gameID = sessionStorage.getItem("gameID")
  let game;
  if (gameID) {
    game = api.getGame(gameID);
  } else {
    game = {
      "id": 1,
      "gameShortName": "",
      "gameName": "",
      "gameDescription": "",
      "imagePath": "../assets/img/loading.jpeg"
    }
  }

  // set state hook for session data, if there os sessionID from web storage, initialise with session of matching id
  const [session, setSession] = useState(() => {
    if (sessionID != null) {
      return api.getSession(sessionID)
    }
  });
  
  const [numOfPlayers, setNumOfPlayers] = useState(0)
  const [host,setHost] = useState(false)

  React.useEffect(() => {
    apiCallback()
    document.body.classList.add("room-page");
    return function cleanup() {
      document.body.classList.remove("room-page");
    };
    // eslint-disable-next-line
  }, [session]);
  
  function apiCallback() {

    if (session.sessionName) {
      setNumOfPlayers(session.players.length)
      updateJoinButton()
      console.log(session.sessionName)
      sessionStorage.setItem("gameID", session.gameID);
    } else {
      session.then(function(result) {
        setSession(result)
        console.log(session)
      })
    }

    if (gameID){;} 
    else { window.location.reload() }
  }

  // redirect to 404 page
  let history = useHistory();
  const { state } = useLocation();
  function redirect() {
    const { from } = state || { from: { pathname: "/error-404" } };
    history.push(from.pathname)
  }

  // if there is no sessionID from web session storage (happen when entering this page manually instead of redirect from sessions page, redirect to error-404 page
  if (sessionID == null) {
    sessionID = "";
    redirect();
    return "";
  }

  function updateJoinButton() {
    var current_username = localStorage.getItem('current_user');
    var userInSession = false;

    // Check if current user is already in session 
    console.log(current_username)
    console.log("PLAYER USERNAMES")
    for (var i = 0; i < session.players.length; i++) {
      var player_username = session.players[i].username
      console.log(player_username)
      if (player_username.localeCompare(current_username) === 0) {
        userInSession = true;
      }
    }

    if (userInSession) {
      document.getElementById("playerList").hidden = false;
      document.getElementById("joinButton").hidden = true;
      document.getElementById("leaveButton").hidden = false;
      document.getElementById("inviteButton").hidden = false;
      document.getElementById("joinFeedback").hidden = true;
      setHost(false)

    } else if(session.hostUsername.localeCompare(current_username) === 0){
      document.getElementById("playerList").hidden = false;
      document.getElementById("joinButton").hidden = true;
      document.getElementById("leaveButton").hidden = false;
      document.getElementById("inviteButton").hidden = false;
      document.getElementById("joinFeedback").hidden = true;
      setHost(true)
    }
  }

  async function join(e) {
    e.preventDefault();

    var joined = await api.joinSession(session.id)
    
    if (joined) {

      // update session data
      // setSession(api.getSession(sessionID));

      // update elements visibility
      document.getElementById("playerList").hidden = false;
      document.getElementById("joinButton").hidden = true;
      document.getElementById("leaveButton").hidden = false;
      document.getElementById("inviteButton").hidden = false;
      document.getElementById("joinFeedback").hidden = true;

      window.location.reload();
    } else {

      // show join error feedback
      document.getElementById("joinFeedback").hidden = false;
    }
  }

  async function leave(e) {
    e.preventDefault();

    // TODO: Add userid to api call
    await api.leaveSession(sessionID);

    // update session data
    // setSession(api.getSession(sessionID));

    // update elements visibility
    document.getElementById("playerList").hidden = true;
    document.getElementById("joinButton").hidden = false;
    document.getElementById("leaveButton").hidden = true;
    document.getElementById("inviteButton").hidden = true;
    document.getElementById("inviteTab").hidden = true;

    const { from } = state || { from: { pathname: "/sessions-page" } };
    history.push(from.pathname)
  }

  // show invite tab
  function invite(e) {
    e.preventDefault();
    document.getElementById("inviteTab").hidden = false;
  }

  // invite a player
  function invitePlayer(e) {
    e.preventDefault();

    // if succesfully invited, remove invite tab. Otherwise, show error feedback
    if(api.invite(document.getElementById("username").value, sessionID)){
      document.getElementById("inviteTab").hidden = true;
      document.getElementById("inviteFeedback").hidden = true;
    } else {
      document.getElementById("inviteFeedback").hidden = false;
    }
  }

  async function kickUser(e,id){
    e.preventDefault();
    let result = api.removePlayerFromSession(id,sessionID)
    if(result){
      alert("User has been removed.")
      window.location.reload();
    }
  }

  return (
    <>
      <Navbar />
      <div className="wrapper">
        <div className="main">
          <div className="section section-dark">
            <Container>
              <Row>
                <Col className="ml-auto mr-auto text-center title" md="12">
                  <img
                    alt="..."
                    className="img-rounded img-responsive"
                    src={process.env.PUBLIC_URL + session.gameImagePath}
                  />
                  <h2>{game.gameName}</h2>
                  <h3>
                    <small>{game.gameDescription}</small>
                  </h3>
                  <br />
                </Col>
              </Row>
          </Container>
          </div>
          <div className="section">
            <Container>
              <Row  id="lobbyInfo">
                <Col className="ml-5 mr-auto" md="4">
                  <Row>
                  <h2 className="title text-dark">{session.sessionName}</h2>
                  </Row>
                  <Row>
                  <h5 className="description">
                    {session.sessionDescription}
                  </h5>
                  </Row>
                  <br />
                  <Row>
                    <h6 className="text-danger" id="joinFeedback" hidden={true}>Unable to join.</h6>
                  </Row>
                  <Row>
                    <Button id="joinButton" onClick= { e => join(e) } >Join</Button>
                    <Button id="leaveButton" onClick= { e => leave(e) } hidden={true}>Leave</Button>
                    <Button id="inviteButton" onClick= { e => invite(e) } hidden={true}>Invite</Button>
                  </Row>
                  <Row>
                    Hosted by: {session.hostUsername}
                  </Row>
                  <Row>
                    {numOfPlayers}/{session.maxPlayers} Players
                  </Row>
                </Col>
                <Col className="ml-5 mr-auto" md="4" id="playerList" hidden={true}>
                  <Row>
                  <h2 className="title text-dark">Players</h2>
                  </Row>
                  {Array.from({ length: numOfPlayers }).map((_, idx) => (
                    <Row key={idx}>
                      <Col md = "1">
                        <p><b>{idx+1}.</b></p>
                      </Col>
                      <Col>
                      <p>{session.players[idx].username}</p>
                      </Col>
                      <Col>
                      <Button className="btn-kick" hidden = {!host} size="xs" onClick={(e) => kickUser(e, session.players[idx].userID)}>
                        Kick
                      </Button>
                      </Col>
                    </Row>
                  ))}
                  <br />
                  <Row>
                    <h3>Join Information</h3>
                  </Row>
                  <Row>
                    <p>{session.joinDescription}</p>
                  </Row>
                </Col>
              </Row>
              <hr />
              <Row className="bg-dark text-white" id="inviteTab" hidden={true}>
                <Col className="ml-auto mr-auto" md="4">
                  <form>
                    <h3>Invite a User</h3>
                    <FormGroup>
                      <Label for="usernameInvite">Username</Label>
                      <Input
                        type="text"
                        name="username"
                        id="username"
                        placeholder="Enter username"
                      />
                    </FormGroup>
                    <h6 className="text-danger" id="inviteFeedback" hidden={true}>Failed to invite.</h6>
                    <Button color="primary" onClick={e => invitePlayer(e)}>
                      Submit
                    </Button>
                    <br />
                  </form>
                  <br />
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </div>
      <PageFooter />
    </>
  );
}

export default RoomPage;
