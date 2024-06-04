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
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";

// styles
import "bootstrap/scss/bootstrap.scss";
import "assets/scss/paper-kit.scss?v=1.3.0";
import "index.css";

// pages
import LandingPage from "views/LandingPage.js";
import RegisterPage from "views/RegisterPage.js";
import AboutPage from "views/AboutPage.js";
import FaqPage from "views/FaqPage.js";
import LoginPage from "views/LoginPage";
import PrivacyPage from "views/PrivacyPage";
import SessionsPage from "views/SessionsPage";
import RoomPage from "views/RoomPage";
import API from "api/API";
import Error404Page from "views/Error404Page";
import ForumPage from "views/ForumPage";
import ForumSinglePage from "views/ForumSinglePage";
import ProfilePage from "views/ProfilePage";

// others
API.init();

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route
        path="/landing-page"
        render={(props) => <LandingPage {...props} />}
      />
      <Route
        path="/sessions-page"
        render={(props) => <SessionsPage {...props} />}
      />
      <Route
        path="/room-page"
        render={(props) => <RoomPage {...props} />}
      />
      <Route
        path="/about-page"
        render={(props) => <AboutPage {...props} />}
      />
      <Route
        path="/privacy-page"
        render={(props) => <PrivacyPage {...props} />}
      />
      <Route
        path="/faq-page"
        render={(props) => <FaqPage {...props} />}
      />
      <Route
        path="/forum-page"
        render={(props) => <ForumPage {...props} />}
      />
      <Route
        exact path="/forum/:id"
        render={(props) => <ForumSinglePage {...props} />}
      />
      <Route
        path="/login-page"
        render={(props) => <LoginPage {...props} />}
      />
      <Route
        path="/register-page"
        render={(props) => <RegisterPage {...props} />}
      />
      <Route
        path="/error-404"
        render={(props) => <Error404Page {...props} />}
      />
      <Route
        path="/profile-page"
        render={(props) => <ProfilePage {...props} />}
      />
      <Redirect to="/landing-page" />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);
