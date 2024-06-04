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
import { useHistory, useLocation } from "react-router";
import placeholder from "../assets/img/faces/Portrait_Placeholder.png"

// reactstrap components
import {
  Button,
  NavItem,
  NavLink,
  Nav,
  TabContent,
  TabPane,
  Container,
  Row,
  Col,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Form,
  FormGroup
} from "reactstrap";

// core components
import Navbar from "components/Navbars/PageNavbar";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import Footer from "components/Footers/PageFooter.js";

import "assets/css/demo.css"
import API from "api/API";

function ProfilePage() {

  let api = API.getApi();

  // Menu Tabs
  const [activeTab, setActiveTab] = React.useState("1");

  const [friendList, setFriendList] = useState({'username': 'dummy'}); // Friend List
  const [friendRequest, setFriendRequest] = useState(""); // Friend Request Input
  const [RequestData, setRequestData] = useState({'username': 'dummy'}); // Friend request list
  const [bio, setBio] = useState(""); // Bio
  const [count, setCount] = useState(300); // Bio limit
  const [newPassword1, setNewPassword1] = useState(""); // Password Input
  const [newPassword2, setNewPassword2] = useState(""); // Confirmation password input
  const [imageURL, setImageURL] = useState(placeholder); // preview image URL
  const [profilePic, setProfilePic] = useState(placeholder) // Profile Pic Image URL
  const current_user = localStorage.getItem('current_user') // current user

  function fetchFriendRequests() {
    api.getFriendRequests().then(data => {
      setRequestData(data, () => {
        console.log(RequestData);
      })
    })
  }

  function fetchFriends() {
    api.getFriends().then(data => {
      setFriendList(data, () => {
        console.log(friendList)
      })
    })
  }

  function fetchBio() {
      api.getUserBio().then(data => {
        setBio(data.bio, () => {
          console.log(bio)
        })
      })
  }

  function fetchImage() {
    api.getUserImage().then(data => {
      if (data.image_url === "IMAGE_URL") {
        console.log('placeholder')
      } else {
        setProfilePic(data.image_url)
      }
    })
}

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  function removeFriend(e, username) {
    e.preventDefault();
    api.removeFriend(username).then(data => {
      if (data) {
          console.log(true)
          fetchFriends()        
          fetchFriendRequests()
          setFriendList(friendList.filter(item => item.name !== username))
      } else {
        console.log(false)
      }
    }) 
  }

  function acceptFriend(e, username) {
    e.preventDefault();
    api.acceptFriendRequest(username).then(data => {
      if (data) {
          console.log(true)
          fetchFriends()
          fetchFriendRequests()
          
          setRequestData(RequestData.filter(item => item.name !== username))
          setFriendList(oldArray => [...oldArray, username])
      } else {
        console.log(false)
      }
    })
  }

  function ignoreFriend(e, username) {
    e.preventDefault();
    api.declineFriendRequest(username).then(data => {
      if (data) {
        console.log(true)
        fetchFriends()        
        fetchFriendRequests()
        
        setRequestData(RequestData.filter(item => item.name !== username))
      } else {
        console.log(false)
      }
    }) 
  }

  function sendFriendRequest(e) {
    e.preventDefault();
    if (friendRequest === localStorage.getItem('current_user')) {
      document.getElementById("sendReqFeedback").innerHTML = "You can't send a request to yourself.";
      document.getElementById("sendReqFeedback").hidden = false;
    } else {
      api.sendFriendRequest(friendRequest).then(data =>{
        if (data) {
          document.getElementById("sendReqFeedback").innerHTML = "Request Sent!";
          document.getElementById("sendReqFeedback").hidden = false;
        } else {
          document.getElementById("sendReqFeedback").innerHTML = "Error occured";
          document.getElementById("sendReqFeedback").hidden = false;
        }
      })
    }
  }

  function updateBio(e) {
    e.preventDefault();
    api.updateUserBio(bio).then(data => {
      document.getElementById("updateBioFeedback").hidden = false;
      if (data) {
        document.getElementById("updateBioFeedback").value = 'Updated Bio';
      } else {
        document.getElementById("updateBioFeedback").value = 'Error';
      }
    })
  }

  function updatePassword(e) {
    e.preventDefault();

    document.getElementById("updatePasswordFeedback").hidden = false;
    if (newPassword1 === newPassword2) {
      console.log(newPassword1)
      api.updatePassword(newPassword1).then(data => {
        if (data) {
          document.getElementById("updatePasswordFeedback").innerHTML = "Password Updated!";
        } else {
          document.getElementById("updatePasswordFeedback").innerHTML = "Error";
        }
      })
    } else {
      document.getElementById("updatePasswordFeedback").innerHTML = "Passwords don't match";
    }
  }

  // Check empty image, if empty, replace with placeholder, otherwise, display
  function setImage(e) {
    if (e === "") {
      setImageURL(placeholder);
    } else {
      setImageURL(e);
    }
  }

  // Update image to API
  function updateImage(e) {
    e.preventDefault();
    // ADD REGEX HERE BEFORE MAKING API CALL 
    api.updateUserImage(imageURL).then(data => {
      if (data) {
        setProfilePic(imageURL)
        // Feedback to say image updated
      } else {
        // Feedback to say image update failed 
      }
    })
    console.log("Update Image: " + imageURL);
  }

  // Log current user out
  function logout(e) {
    api.logoutUser()
    redirect()
  }

  // redirect to home page
  let history = useHistory();
  const { state } = useLocation();
  function redirect() {
      const { from } = state || { from: { pathname: "/landing-page" } };
      history.push(from.pathname)
  }

  document.documentElement.classList.remove("nav-open");
  React.useEffect(() => {
      fetchFriends()
      fetchFriendRequests()
      fetchBio()
      fetchImage()

      document.body.classList.add("profile-page");
      return function cleanup() {
          document.body.classList.remove("profile-page");
      };
      // eslint-disable-next-line
  }, []);

  return (
    <>
      <Navbar />
      <ProfilePageHeader />
      <div className="section profile-content">
        <Container>
          <div className="owner">
            <div className="avatar">
              <img
                alt="..."
                className="img-circle img-no-padding img-responsive"
                src={profilePic}
              />
            </div>
            <div className="name">
              <h4 className="title">
                {current_user}
              </h4>
            </div>
          </div>
          <Row>
            <Col className="ml-auto mr-auto text-center" md="6">
              <p>
                {bio}
              </p>
            </Col>
          </Row>
          <Row>
            <Col className="ml-auto mr-auto text-center" md="6">
              <Button className="btn-round" color="danger" outline onClick={e => logout(e)}>
                <i className="nc-icon nc-button-power" /> Logout
              </Button>
            </Col>
          </Row>
          <br />
          {/* Nav menu */}
          <div className="nav-tabs-navigation">
            <div className="nav-tabs-wrapper">
              <Nav role="tablist" tabs>
                <NavItem>
                  <NavLink
                    className={activeTab === "1" ? "active" : ""}
                    onClick={() => {
                      toggle("1");
                    }}
                  >
                    Friends
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === "2" ? "active" : ""}
                    onClick={() => {
                      toggle("2");
                    }}
                  >
                    Requests
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === "3" ? "active" : ""}
                    onClick={() => {
                      toggle("3");
                    }}
                  >
                    Add
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === "4" ? "active" : ""}
                    onClick={() => {
                      toggle("4");
                    }}
                  >
                    Bio
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === "5" ? "active" : ""}
                    onClick={() => {
                      toggle("5");
                    }}
                  >
                    Password
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === "6" ? "active" : ""}
                    onClick={() => {
                      toggle("6");
                    }}
                  >
                    Picture
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
          </div>
          {/* Tab panes */}
          <TabContent className="text-left" activeTab={activeTab}>
            {/* Friends */}
            <TabPane tabId="1" id="friends">
              <Row>
                <Col className="ml-auto mr-auto" md="6">
                  <ul className="list-unstyled follows">
                  {friendList.length !== 0 ? (
                    <>
                      {Array.from({ length: friendList.length }).map((_, idx) => {
                        return (
                          <div key={"friend"+idx}>
                            <li>
                              <Row>
                                <Col className="ml-auto mr-auto" lg="2" md="4" xs="4">
                                  <img
                                    alt="..."
                                    className="img-circle img-no-padding img-responsive"
                                    src={
                                      placeholder
                                    }
                                  />
                                </Col>
                                <Col className="ml-auto mr-auto" lg="7" md="4" xs="4">
                                  <h6>
                                    {friendList[idx].username}
                                  </h6>
                                </Col>
                                <Col className="ml-auto mr-auto" lg="3" md="4" xs="4">
                                  <Button className="btn-round mr-1" color="danger" type="button" onClick={e => removeFriend(e, friendList[idx].username)}>
                                    Remove
                                  </Button>
                                </Col>
                              </Row>
                            </li>
                            <hr />
                          </div>
                        )
                      })}
                    </>
                    ) : <h4 style={{ fontWeight: '400' }}>{"No friends"}</h4>}
                  </ul>
                </Col>
              </Row>
            </TabPane>
            {/* Friend Request */}
            <TabPane className="text-left" tabId="2" id="request">
              <Row>
                <Col className="ml-auto mr-auto text-center" md="4">
                  <h2 className="title">Friend requests</h2>
                </Col>
              </Row>
              <br />
              <Row>
                <Col className="ml-auto mr-auto" md="6">
                  <ul className="list-unstyled follows">
                  {RequestData.length !== 0 ? (
                    <>
                      {Array.from({ length: RequestData.length }).map((_, idx) => {
                        return (
                          <div key={"pending"+idx}>
                            <li>
                              <Row>
                                <Col className="ml-auto mr-auto" lg="2" md="4" xs="4">
                                  <img
                                    alt="..."
                                    className="img-circle img-no-padding img-responsive"
                                    src={
                                      placeholder
                                    }
                                  />
                                </Col>
                                <Col className="ml-auto mr-auto" lg="8" md="4" xs="4">
                                  <h6>
                                    {RequestData[idx].username}
                                  </h6>
                                </Col>
                                <Col className="ml-auto mr-auto" lg="2" md="4" xs="4">
                                  <Row>
                                    <Button className="btn-round mr-1" color="success" type="button" onClick={e => acceptFriend(e, RequestData[idx].username)} >
                                      Accept
                                    </Button>
                                  </Row>
                                  <Row>
                                    <Button className="btn-round mr-1" color="danger" type="button" onClick={e => ignoreFriend(e, RequestData[idx].username)} >
                                      Ignore
                                    </Button>
                                  </Row>
                                </Col>
                              </Row>
                            </li>
                            <hr />
                          </div>
                        )
                      })}
                    </>
                  ) : <h4 style={{ fontWeight: '400' }}>{"No friend requests"}</h4>}
                  </ul>
                </Col>
              </Row>
            </TabPane>
            {/* Send Friend Request */}
            <TabPane className="text-left" tabId="3" id="add">
              <Row>
                <Col className="ml-auto mr-auto text-center" md="4">
                  <h2 className="title">Add a new friend</h2>
                  <InputGroup>
                    <Input placeholder="Username" type="text" onChange={e => {setFriendRequest(e.target.value)}} />
                    <InputGroupAddon addonType="append">
                      <InputGroupText>
                        <i aria-hidden={true} className="fa fa-group" />
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </Col>
              </Row>
              <br />
              <Row>
                <Col className="ml-auto mr-auto text-center" md="4">
                  <Button className="btn-round mr-1" color="info" type="button" onClick={e => sendFriendRequest(e)}>
                    Send
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col className="ml-auto mr-auto text-center" md="4">
                  <h6 id="sendReqFeedback" hidden={true}>Error</h6>
                </Col>
              </Row>
            </TabPane>
            {/* Update Bio */}
            <TabPane className="text-left" tabId="4" id="bio">
              <Row>
                <Col className="ml-auto mr-auto text-center" md="8">
                  <h2 className="title">Update bio</h2>
                  <Input
                    className="textarea-limited"
                    id="desc"
                    maxLength="300"
                    placeholder="Update your bio here"
                    rows="5"
                    type="textarea"
                    onChange={e => {setCount(300 - e.target.value.length); setBio(e.target.value)}}
                    style={{resize: "none"}}
                  />
                  <h5>
                    <small>
                      <span className="pull-right" id="textarea-limited-message">
                        {count} characters left
                      </span>
                    </small>
                  </h5>
                </Col>
              </Row>
              <Row>
                <Col className="ml-auto mr-auto text-center" md="6">
                  <Button className="btn-round" color="default" onClick={e => updateBio(e)}>
                    Update
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col className="ml-auto mr-auto text-center" md="6">
                  <h6 id="updateBioFeedback" hidden={true}>Updated Bio!</h6>
                </Col>
              </Row>
            </TabPane>
            {/* Change Password */}
            <TabPane className="text-left" tabId="5" id="password">
              <Row>
                <Col className="ml-auto mr-auto text-center" md="6">
                  <h2 className="title">Change password</h2>
                </Col>
              </Row>
              <Row>
                <Col className="ml-auto mr-auto text-center" md="4">
                  <Form>
                    <br />
                    <Input 
                      placeholder="New Password" 
                      type="password" 
                      name="newPassword1"
                      onChange={e => setNewPassword1(e.target.value)}
                    />
                    <br />
                    <Input 
                      placeholder="Confirm Password" 
                      type="password" 
                      name="newPassword2"
                      onChange={e => setNewPassword2(e.target.value)}
                    />
                  </Form>        
                </Col>
              </Row>
              <Row>
                <Col className="ml-auto mr-auto text-center" md="6">
                  <Button className="btn-round" color="danger" onClick={e => updatePassword(e)}>
                    Update
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col className="ml-auto mr-auto text-center" md="6">
                  <h6 id="updatePasswordFeedback" hidden={true}>Password Saved!</h6>
                </Col>
              </Row>
            </TabPane>
            {/* Update Profile Picture */}
            <TabPane className="text-left" tabId="6" id="picture">
              <Row>
                <Col className="ml-auto mr-auto text-center" md="6">
                  <h2 className="title">Update profile picture</h2>
                </Col>
              </Row>
              <Row>
                <Col className="ml-auto mr-auto text-center" md="4">
                  <div className="avatar">
                    <img
                      alt="..."
                      className="img-circle img-no-padding img-responsive"
                      src={imageURL}
                    />
                  </div>
                </Col>
              </Row>
              <Row>
                <Col className="ml-auto mr-auto text-center" md="4">
                  <FormGroup>
                    <Input type="text" placeholder="Paste image URL" onChange={e => setImage(e.target.value)} />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col className="ml-auto mr-auto text-center" md="6">
                  <Button className="btn-round" color="danger" onClick={ e => updateImage(e)} >
                    Update
                  </Button>
                </Col>
              </Row>
            </TabPane>
          </TabContent>
        </Container>
      </div>
      <Footer />
    </>
  );
}

export default ProfilePage;
