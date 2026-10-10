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
  Badge,
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
import { rankRangeLabel, rankAllowed } from "utils/ranks";
import { closesInLabel } from "utils/time";
import { PLATFORMS, REGIONS, VOICE, roomOptionLabels, matchesOption } from "assets/data/roomOptions";

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
  
  const [games, setGames] = useState(dummy);
  const [sessions, setSessionsData] = useState([]);

  // load games and sessions once the page mounts
  React.useEffect(() => {
    api.getGames().then(allGames => {
      setGames(allGames);
      if (allGames.length > 0) {
        setFormGame(allGames[0].id);
      }
    });
    api.getSessions([]).then(allSessions => setSessionsData(allSessions));
    if (localStorage.getItem('access_token')) {
      api.getMyRanks().then(ranks => setMyRanks(ranks));
    }

    document.body.classList.add("sessions-page");
    return function cleanup() {
      document.body.classList.remove("sessions-page");
    };
    // eslint-disable-next-line
  }, []);
  
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

  // add sessionID to web session storage and open the room
  function openRoom(session) {
    sessionStorage.setItem("sessionID", session.id);
    history.push(`/room-page?id=${session.id}`);
  }

  // update sessions list with new filtered data
  async function filter() {
    var allSessions = await api.getSessions(filterVal);

    allSessions = allSessions.filter(session =>
      matchesOption(session.platform, filterPlatform) &&
      matchesOption(session.region, filterRegion) &&
      matchesOption(session.voice, filterVoice)
    );

    // "Your rank": only rooms for that game whose rank range includes the player's rank
    const rankGame = games.find(game => game.id === rankFilterGame);
    if (rankGame && rankFilterRank) {
      allSessions = allSessions.filter(session =>
        session.gameID === rankGame.id && rankAllowed(session, rankGame.ranks, rankFilterRank)
      );
    }
    setSessionsData(allSessions);
  }

  // set state hook for the "Your rank" filter
  const [rankFilterGame, setRankFilterGame] = useState(null);
  const [rankFilterRank, setRankFilterRank] = useState("");
  const [myRanks, setMyRanks] = useState({}); // saved ranks, game id -> rank
  const [filterPlatform, setFilterPlatform] = useState("any");
  const [filterRegion, setFilterRegion] = useState("any");
  const [filterVoice, setFilterVoice] = useState("any");
  const rankFilterRanks = (games.find(game => game.id === rankFilterGame) || {}).ranks || [];

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
  const [formMinRank, setFormMinRank] = useState("");
  const [formMaxRank, setFormMaxRank] = useState("");
  const [formDuration, setFormDuration] = useState(4);
  const [formPlatform, setFormPlatform] = useState("any");
  const [formRegion, setFormRegion] = useState("any");
  const [formVoice, setFormVoice] = useState("any");
  const formRanks = (games.find(game => game.id === formGame) || {}).ranks || [];

  // ranks belong to a game, so picking another game clears the rank range
  function selectFormGame(gameID) {
    setFormGame(gameID);
    setFormMinRank("");
    setFormMaxRank("");
  }
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

    if (formMinRank && formMaxRank && formRanks.indexOf(formMinRank) > formRanks.indexOf(formMaxRank)) {
      document.getElementById("createFeedback").hidden = false;
      document.getElementById("createFeedback").innerHTML = "Minimum rank cannot be higher than maximum rank";
      return;
    }

    // remove sessionID from web session storage
    sessionStorage.removeItem("sessionID");

    // call api to create new session with form variables
    var result = await api.createSession({
      game: formGame,
      maxPlayers: formMaxPlayers,
      name: formName,
      description: formDescription,
      instructions: formHiddenDescription,
      minRank: formMinRank,
      maxRank: formMaxRank,
      durationHours: formDuration,
      platform: formPlatform,
      region: formRegion,
      voice: formVoice,
    });

    // if a sessionID is returned, save sessionID to web session storage and redirect to room-page. Otherwise, show error message.
    if (result.id){
      document.getElementById("createFeedback").hidden = true;
      sessionStorage.setItem("sessionID", result.id);
      redirect(result.id);
    } else {
      document.getElementById("createFeedback").innerText = result.error;
      document.getElementById("createFeedback").hidden = false;
    };
  }

  // redirect to rooom page
  let history = useHistory();
  const { state } = useLocation();
  function redirect(sessionID) {
    const { from } = state || { from: { pathname: `/room-page?id=${sessionID}` } };
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
                                      <Input id="gameSelect" type="select" onChange={e => selectFormGame(parseInt(e.target.value))}>
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
                              <Col md="4">
                                <label>Session Name</label>
                                <Input placeholder="Session Name" type="text" onChange={e => setFormName(e.target.value)}/>
                              </Col>
                              <Col md="2">
                                <FormGroup>
                                  <label htmlFor="durationSelect">Room open for</label>
                                  <Input id="durationSelect" type="select" value={formDuration} onChange={e => setFormDuration(parseInt(e.target.value))}>
                                    {[1, 2, 4, 8, 12, 24].map(hours => (
                                      <option key={"duration" + hours} value={hours}>{hours} {hours === 1 ? "hour" : "hours"}</option>
                                    ))}
                                  </Input>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              {[
                                ["platformSelect", "Platform", PLATFORMS, formPlatform, setFormPlatform],
                                ["regionSelect", "Region", REGIONS, formRegion, setFormRegion],
                                ["voiceSelect", "Voice chat", VOICE, formVoice, setFormVoice],
                              ].map(([id, label, options, value, setValue]) => (
                                <Col md="4" key={id}>
                                  <FormGroup>
                                    <label htmlFor={id}>{label}</label>
                                    <Input id={id} type="select" value={value} onChange={e => setValue(e.target.value)}>
                                      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                    </Input>
                                  </FormGroup>
                                </Col>
                              ))}
                            </Row>
                            {formRanks.length > 0 && (
                              <Row>
                                <Col md="3">
                                  <FormGroup>
                                    <label htmlFor="minRankSelect">Minimum Rank</label>
                                    <Input id="minRankSelect" type="select" value={formMinRank} onChange={e => setFormMinRank(e.target.value)}>
                                      <option value="">Any</option>
                                      {formRanks.map(rank => <option key={"min" + rank} value={rank}>{rank}</option>)}
                                    </Input>
                                  </FormGroup>
                                </Col>
                                <Col md="3">
                                  <FormGroup>
                                    <label htmlFor="maxRankSelect">Maximum Rank</label>
                                    <Input id="maxRankSelect" type="select" value={formMaxRank} onChange={e => setFormMaxRank(e.target.value)}>
                                      <option value="">Any</option>
                                      {formRanks.map(rank => <option key={"max" + rank} value={rank}>{rank}</option>)}
                                    </Input>
                                  </FormGroup>
                                </Col>
                                <Col md="6" className="text-left">
                                  <label>&nbsp;</label>
                                  <p className="text-muted">Optional. Leave as "Any" to welcome every rank.</p>
                                </Col>
                              </Row>
                            )}
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
                      <h3 className="text-left">Platform, region and voice</h3>
                      <Row>
                        {[
                          ["filterPlatform", PLATFORMS, filterPlatform, setFilterPlatform],
                          ["filterRegion", REGIONS, filterRegion, setFilterRegion],
                          ["filterVoice", VOICE, filterVoice, setFilterVoice],
                        ].map(([id, options, value, setValue]) => (
                          <Col md="4" key={id}>
                            <Input id={id} type="select" aria-label={id} value={value} onChange={e => setValue(e.target.value)}>
                              {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </Input>
                          </Col>
                        ))}
                      </Row>
                      <br />
                      <h3 className="text-left">Your rank</h3>
                      <Row>
                        <Col md="4">
                          <Input
                            id="rankFilterGame"
                            type="select"
                            aria-label="Game for rank filter"
                            value={rankFilterGame || ""}
                            onChange={e => { setRankFilterGame(e.target.value ? parseInt(e.target.value) : null); setRankFilterRank(myRanks[e.target.value] || ""); }}
                          >
                            <option value="">Any game</option>
                            {games.filter(game => game.ranks && game.ranks.length > 0).map(game => (
                              <option key={"rankGame" + game.id} value={game.id}>{game.gameName}</option>
                            ))}
                          </Input>
                        </Col>
                        <Col md="4">
                          <Input
                            id="rankFilterRank"
                            type="select"
                            aria-label="Your rank"
                            value={rankFilterRank}
                            disabled={!rankFilterGame}
                            onChange={e => setRankFilterRank(e.target.value)}
                          >
                            <option value="">Select your rank</option>
                            {rankFilterRanks.map(rank => <option key={"rankFilter" + rank} value={rank}>{rank}</option>)}
                          </Input>
                        </Col>
                        <Col md="4" className="text-left">
                          <p className="text-muted">Shows only rooms for this game that accept your rank.</p>
                        </Col>
                      </Row>
                      <br />
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
                      <CardImg top src={sessions[idx].gameImagePath} alt="..."/>
                      <CardHeader>{sessions[idx].sessionName}</CardHeader>
                      <CardBody>
                        <CardText>{sessions[idx].sessionDescription}</CardText>
                        <CardText>Hosted by: <b>{sessions[idx].hostUsername}</b></CardText>
                        <Badge color={sessions[idx].minRank || sessions[idx].maxRank ? "info" : "default"} pill>
                          {rankRangeLabel(sessions[idx])}
                        </Badge>
                        {" "}
                        <Badge color="default" pill>{closesInLabel(sessions[idx].expiresAt)}</Badge>
                        {roomOptionLabels(sessions[idx]).map(label => (
                          <React.Fragment key={label}>{" "}<Badge color="primary" pill>{label}</Badge></React.Fragment>
                        ))}
                      </CardBody>
                      <Button color="primary" onClick={ () => openRoom(sessions[idx]) }>Join</Button>
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
