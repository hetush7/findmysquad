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
import React, { useState } from 'react';
import { useHistory, useLocation } from "react-router";

// reactstrap components
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardText,
  CardImg,
  CustomInput
} from "reactstrap";

// core components
import Navbar from "components/Navbars/PageNavbar.js";
import SessionsPageHeader from "components/Headers/SessionsPageHeader";
import Footer from "components/Footers/PageFooter.js";
import API from "api/API";

// json
import filters from "assets/data/filters.json";

function SessionsPage() {
  let api = API.getApi();
  let dummy = [{
    "id": 1,
    "gameShortName": "",
    "gameName": "",
    "gameDescription": "",
    "imagePath": "../assets/img/cod.jpg"
  }]

  document.documentElement.classList.remove("nav-open");
  
  const [games,setGames] = useState(() => {
    if(sessionStorage.getItem("games")) {
      return sessionStorage.getItem("games")
    } else {
      fetchGames();
      return dummy;
    }
  });

  const [sessions, setSessionsData] = useState(() => {
    if (sessionStorage.getItem("gameSessions")) {
      return sessionStorage.getItem("gameSessions")
    } else {
      fetchSessions();
      return [{}]
    }
  });

  async function fetchGames() {   
    var allGames = await api.getGames()
    sessionStorage.setItem("games", JSON.stringify(allGames));
  }

  async function fetchSessions() {
    var allSessions = await api.getSessions([])
    console.log(allSessions);
    sessionStorage.setItem("gameSessions", JSON.stringify(allSessions));
  }
  
  React.useEffect(() => {
    fetchGames()
    gamesAPICallback();

    fetchSessions()
    sessionsAPICallback()

    document.body.classList.add("sessions-page");
    return function cleanup() {
      document.body.classList.remove("sessions-page");
    };
    // eslint-disable-next-line
  }, []);

  function gamesAPICallback() {
    var getGames = sessionStorage.getItem("games");
    if(getGames) {
      var jsonGames = JSON.parse(sessionStorage.getItem("games"))
      setGames(jsonGames)
      setFormGame(jsonGames[0].id)
    } else { 
        window.location.reload();
    }
  }

  function sessionsAPICallback() {
    var getSessions = sessionStorage.getItem("gameSessions");
    if (getSessions) {
      var jsonSessions = JSON.parse(sessionStorage.getItem("gameSessions"))
      setSessionsData(jsonSessions)
    } else {
      window.location.reload();
    }
  }
  
  // set state hook for filter values
  const [filterVal, setFilterVal] = useState([]);

  // show filter box
  function filterBox(e) {
    if (e.target.checked) {
      document.getElementById("filterBox").hidden = false;
    } else {
      document.getElementById("filterBox").hidden = true;
    }
  }

  // add sessionID to web session storage
  function roomDetails(session) {
    sessionStorage.setItem("sessionID", session.id);
  }

  // update sessions list with new filtered data
  async function filter() {
    var allSessions = await api.getSessions(filterVal);
    setSessionsData(allSessions);
  }

  // handle all filter selection
  function handleOnChange(value) {
    let list = filterVal;

    // if filter does not already exist, add to list, otherwise remove from list
    if (!list.includes(value)) {
      list.push(value);
      setFilterVal(list);
    } else {
      list.splice(filterVal.indexOf(value), 1);
      setFilterVal(list);
    }
  }

  // set state hook to form variables
  const [formGame, setFormGame] = useState();
  const [formMaxPlayers, setFormMaxPlayers] = useState(0);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formHiddenDescription, setFormHiddenDescription] = useState("");
  const [count1, setCount1] = useState(300);
  const [count2, setCount2] = useState(300);

  // show form box
  function showForm(e) {
    e.preventDefault();
    document.getElementById("form").hidden = false;
    document.getElementById("create").hidden = true;
  }

  // create a new session
  async function create(e) {
    e.preventDefault();

    // input validation
    if (formMaxPlayers === 0) {
      document.getElementById("createFeedback").hidden = false;
      document.getElementById("createFeedback").innerHTML = "Enter Player Limit";
      return;
    }

    if (formName === "") {
      document.getElementById("createFeedback").hidden = false;
      document.getElementById("createFeedback").innerHTML = "Enter Session Name";
      return;
    }

    if (formDescription === "") {
      document.getElementById("createFeedback").hidden = false;
      document.getElementById("createFeedback").innerHTML = "Enter Description";
      return;
    }

    if (formHiddenDescription === "") {
      document.getElementById("createFeedback").hidden = false;
      document.getElementById("createFeedback").innerHTML = "Enter Join Instructions";
      return;
    }

    // remove sessionID from web session storage
    sessionStorage.removeItem("sessionID");

    // call api to create new session with form variables
    var newSession = await api.createSession([formGame, formMaxPlayers, formName, formDescription, formHiddenDescription]);

    // if a sessionID is returned, save sessionID to web session storage and redirect to room-page. Otherwise, show error message.
    if ( newSession > 0){
      document.getElementById("createFeedback").hidden = true;
      sessionStorage.setItem("sessionID", newSession);
      redirect();
    } else {
      document.getElementById("createFeedback").innerHTML = "Error creating session";
      document.getElementById("createFeedback").hidden = false;
    };
  }

  // redirect to rooom page
  let history = useHistory();
  const { state } = useLocation();
  function redirect() {
    const { from } = state || { from: { pathname: "/room-page" } };
    history.push(from.pathname)
  }
  
  return (
    <>
      <Navbar />
      <SessionsPageHeader />
      <div className="main">
        <div className="section text-center">
          <Container>
            <Row>
              <Col>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Button id="create" hidden={false} onClick={e => showForm(e)}>Create a Session</Button>
                </div>
                <br />
                <Container id="form" hidden={true}>
                  <Row>
                    <Col className="ml-auto mr-auto" lg="12">
                      <Card className="ml-auto mr-auto">
                        <CardHeader>
                          <h3>Create a Session</h3>
                        </CardHeader>
                        <CardBody>
                          <Form className="contact-form">
                            <Row>
                              <Col md="6">
                                <Row>
                                  <Col md="8">
                                    <FormGroup>
                                      <label htmlFor="gameCategory">Game</label>
                                      <Input id="gameSelect" type="select" onChange={e => setFormGame(parseInt(e.target.value))}>
                                        {Array.from({ length: games.length }).map((_, idx) => (
                                          <option key={"select"+idx} value={games[idx].id}>{games[idx].gameName}</option>
                                        ))}
                                      </Input>
                                    </FormGroup>
                                  </Col>
                                  <Col md="4">
                                    <FormGroup>
                                      <label htmlFor="gameCategory">Max Players</label>
                                      <Input 
                                        id="maxPlayersInput"
                                        placeholder="# of Slots" 
                                        type="text" 
                                        onKeyPress={(e) => {
                                          if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                          }
                                        }} 
                                        onChange={
                                          e => setFormMaxPlayers(parseInt(e.target.value))
                                          }
                                        />
                                    </FormGroup>
                                  </Col>
                                </Row>
                              </Col>
                              <Col md="6">
                                <label>Session Name</label>
                                <Input placeholder="Session Name" type="text" onChange={e => setFormName(e.target.value)}/>
                              </Col>
                            </Row>
                            <Row>
                              <Col md="6">
                                <label>Description</label>
                                <Input
                                  className="textarea-limited"
                                  id="desc"
                                  maxLength="300"
                                  placeholder="Description for your session"
                                  rows="5"
                                  type="textarea"
                                  onChange={e => {setCount1(300 - e.target.value.length); setFormDescription(e.target.value)}}
                                  style={{resize: "none"}}
                                />
                                <h5>
                                  <small>
                                    <span className="pull-right" id="textarea-limited-message">
                                      {count1} characters left
                                    </span>
                                  </small>
                                </h5>
                              </Col>
                              <Col md="6">
                                <label>Join Instructions</label>
                                <Input
                                  className="textarea-limited"
                                  id="desc"
                                  maxLength="300"
                                  placeholder="Join description for your session visible only to those that joined."
                                  rows="5"
                                  type="textarea"
                                  onChange={e => {setCount2(300 - e.target.value.length); setFormHiddenDescription(e.target.value)}}
                                  style={{resize: "none"}}
                                />
                                <h5>
                                  <small>
                                    <span className="pull-right" id="textarea-limited-message">
                                      {count2} characters left
                                    </span>
                                  </small>
                                </h5>
                              </Col>
                            </Row>
                            <Row>
                              <Col className="offset-md-4" md="4">
                                <Button className="btn-fill" color="default" size="lg" onClick={ e => create(e)}>
                                  Create
                                </Button>
                                <div className="text-danger">
                                  <h6 id="createFeedback" hidden={true}>Error</h6>
                                </div>
                              </Col>
                            </Row>
                            <br />
                          </Form>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </Container>
              </Col>
            </Row>
            <Row>
              <Col>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CustomInput type="switch" id="showFilter" name="customSwitch" label="Filter" onChange={e => filterBox(e)} />
                </div>
                <br />
                <Card className="text-center" hidden={true} id="filterBox">
                  <CardHeader>
                    <h3>Filter</h3>
                  </CardHeader>
                  <CardBody>
                    <form>
                      <h3 className="text-left">Games</h3>
                      <FormGroup check>
                        <Row xs={1} md={5} className="g-4">
                          {Array.from({ length: games.length }).map((_, idx) => (
                            <Col key={"gameFilter" + idx}>
                              <Label className="form-check-label">
                                <Input className="form-check-input" type="checkbox" value={games[idx].gameShortName} onChange={() => handleOnChange(games[idx].gameShortName)} />
                                {games[idx].gameName}
                                <span className="form-check-sign">
                                  <span className="check"></span>
                                </span>
                              </Label>
                            </Col>
                          ))}
                        </Row>
                      </FormGroup>
                      <h3 className="text-left">Types</h3>
                      <FormGroup check>
                        <Row xs={1} md={5} className="g-4">
                          {Array.from({ length: filters.length }).map((_, idx) => (
                            <Col key={"otherFilter" + idx}>
                              <Label className="form-check-label">
                                <Input className="form-check-input" type="checkbox" value={filters[idx].filterValue} onChange={() => handleOnChange(filters[idx].filterValue)} />
                                {filters[idx].filterText}
                                <span className="form-check-sign">
                                  <span className="check"></span>
                                </span>
                              </Label>
                            </Col>
                          ))}
                        </Row>
                      </FormGroup>
                      <Button onClick={() => filter()} color="primary">Filter</Button>
                    </form>
                  </CardBody>
                </Card>
                <br />
                <hr />
              </Col>
            </Row>
            <Row xs={1} md={3} className="g-4">
                {Array.from({ length: sessions.length }).map((_, idx) => (
                  <Col key={"sessions"+idx}>
                    <Card className="bg-white text-dark">
                      <CardImg top src={process.env.PUBLIC_URL + sessions[idx].gameImagePath} alt="..."/>
                      <CardHeader>{sessions[idx].sessionName}</CardHeader>
                      <CardBody>
                        <CardText>{sessions[idx].sessionDescription}</CardText>
                        <CardText>Hosted by: <b>{sessions[idx].hostUsername}</b></CardText>
                      </CardBody>
                      <Button color="primary" onClick={ () => roomDetails(sessions[idx]) } href="/room-page" >Join</Button>
                    </Card>
                  </Col>
                ))}
            </Row>
          </Container>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SessionsPage;
