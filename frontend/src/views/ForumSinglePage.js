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
import { useParams } from 'react-router-dom';

// reactstrap components
import {
  Button,
  Media,
  Container,
  Row,
  Col,
  Form,
  Input
} from "reactstrap";

// core components
import Navbar from "components/Navbars/PageNavbar.js";
import Footer from "components/Footers/PageFooter.js";
import { useHistory, useLocation } from "react-router";
import API from "api/API";


function ForumSinglePage() {
  let api = API.getApi();
  const { id } = useParams();
  console.log({id})
  // set state hook for session data, if there os sessionID from web storage, initialise with session of matching id
  const [forum,setForum] = useState(() => {
      let forumData = api.getForum(id);
      console.log(forumData)
      return forumData;
  })

  const [numOfPosts, setNumberofPosts] = useState(0)
  
  React.useEffect(() => {
    apiCallback()
    document.body.classList.add("blog-posts");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("blog-posts");
    };
  });

  function apiCallback(){
    if (forum.title) {
      setNumberofPosts(forum.posts.length)
      console.log(forum.title)
    } else{
      forum.then(function(result) {
        setForum(result)
        console.log(forum)
      })
    }
  }
  
  // redirect to error
  let history = useHistory();
  const { state } = useLocation();
  function redirect() {
    const { from } = state || { from: { pathname: "/error404" } };
    history.push(from.pathname)
  }

  // form hooks
  const [post, setPost] = useState("");

  // submit form values
  async function submitHandler() {
    let newPost = await api.makePost([forum.tag, post]);
    if (!newPost){
      //Error message here
    } else {
      window.location.reload()
    };
  }

  // TODO: Attach login check
  let isLoggedIn = localStorage.getItem('current_user');

  if (forum == null) {
    redirect();
    return"";
  }
  console.log(forum)
  // Render form submit
  function FormSubmit() {
    return (
      <Button className="btn-fill" color="danger" size="lg" onClick={() => submitHandler()}>
        Submit
      </Button>
    )
  }

  // Render Login button
  function FormLogin() {
    return (
      <Button block className="btn-round" color="danger" href="/login-page">
        Login to post
      </Button>
    )
  }

  // Render form button to submit or redirect button to login
  function LoginButton() {
    if (isLoggedIn) {
      return <FormSubmit />;
    } else {
      return <FormLogin />;
    }
  }

  async function reportPost(e, post) {
    e.preventDefault();
    console.log(post)
    let reportPost = await api.reportPost(post.id);
    if(reportPost){
      alert("Post has been reported.")
    }
  }

  return (
    <>
      <Navbar/>
      <div className="wrapper">
        <div className="main">
          {/** Title Section */}
          <div className="section section-dark">
            <Container>
              <Row>
                <Col className="ml-auto mr-auto text-left title" md="12">
                  <h2>{forum.title}</h2>
                  <h3>
                    <small>{forum.description}</small>
                  </h3>
                  <br />
                </Col>
              </Row>
            </Container>
          </div>
          <div className="section">
            <Container>
              {/** Form Section */}
              <Row>
                <Col className="ml-auto mr-auto" md="8">
                  <h2 className="text-center">Send a post</h2>
                  <Form className="contact-form">
                    <label>Post</label>
                    <Input
                      placeholder="Type your post here..."
                      type="textarea"
                      rows="5"
                      style={{resize: "none"}}
                      onChange={ (e) => setPost(e.target.value)}
                      disabled={!isLoggedIn}
                    />
                    <Row>
                      <Col className="ml-auto mr-auto" md="0">
                        <LoginButton />
                      </Col>
                    </Row>
                  </Form>
                </Col>
              </Row>
              <br />
              <hr />
              {/** Posts Section */}
              <Row xs={1} md={1} className="g-4">
              <Col md="12">
                {Array.from({ length: numOfPosts }).map((_, idx) => (
                  <div key={"media"+idx}>
                    <Media>
                      <Media body>
                        <Row>
                        <Col>
                          <strong className="mr-1">{forum.posts[idx].username}</strong>
                          <p>
                            {forum.posts[idx].text}
                          </p>
                        </Col>
                        <Col className="align-self-center text-right" sm="2">
                          <Button className="btn-round btn-outline-danger" size="xs" onClick={(e) => reportPost(e, forum.posts[idx])}>
                            <i className="nc-icon nc-alert-circle-i"/>{" "}Report
                          </Button>
                        </Col>
                        </Row>
                      </Media>
                    </Media>
                  <hr />
                  </div>
                ))}
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ForumSinglePage;
