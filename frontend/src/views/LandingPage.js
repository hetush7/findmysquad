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

// reactstrap components
import {
  Button,
  Container,
  Row,
  Col,
} from "reactstrap";

// core components
import PageNavbar from "components/Navbars/PageNavbar.js";
import LandingPageHeader from "components/Headers/LandingPageHeader.js";
import PageFooter from "components/Footers/PageFooter.js";
import ViewStatic from "assets/data/ViewStatic";

function LandingPage() {
  document.documentElement.classList.remove("nav-open");
  React.useEffect(() => {
    document.body.classList.add("landing-page");
    return function cleanup() {
      document.body.classList.remove("landing-page");
    };
  });
  return (
    <>
      <PageNavbar />
      <LandingPageHeader />
      <div className="main">
        <div className="section section-dark">
          <Container>
            <Row>
              <Col className="ml-auto mr-auto text-center" md="8">
                <h6 className="text-muted">Games</h6>
                <h2 className="title">Supported Games</h2>
                <h5 className="description">
                  Our platform supports these games right now!
                </h5>
              </Col>
            </Row>
            <br />
            <hr />
            <br />
            <Row>
              <Col>
                <img
                  alt="Apex"
                  className="gameImg"
                  src={
                    require("assets/img/GameLogo_ApexLegendsNew.png")
                      .default
                  }
                />
              </Col>
              <Col md="4">
                <img
                  alt="LoL"
                  className="gameImg"
                  src={
                    require("assets/img/GameLogo_LeagueOfLegendsNew.png")
                      .default
                  }
                />
              </Col>
              <Col md="4">
                <img
                  alt="CoD"
                  className="gameImg"
                  src={
                    require("assets/img/GameLogo_CallOfDutyNew.png")
                      .default
                  }
                />
              </Col>
            </Row>
          </Container>
        </div>
        <div className="section section-dark">
          <hr />
        </div>
        <div className="section section-dark text-center">
          <Container>
            <Row>
              <Col className="ml-auto mr-auto" md="8">
                <h2 className="title">{ViewStatic.FEATURE_TITLE}</h2>
              </Col>
            </Row>
            <br />
            <br />
            <Row>
              <Col md="4">
                <div className="info">
                  <div className="icon icon-info">
                    <i className={ViewStatic.FEATURE1_ICON} />
                  </div>
                  <div className="description">
                    <h4 className="info-title">{ViewStatic.FEATURE1_TITLE}</h4>
                    <p className="description">
                      {ViewStatic.FEATURE1_DESCRIPTION}
                    </p>
                  </div>
                </div>
              </Col>
              <Col md="4">
                <div className="info">
                  <div className="icon icon-info">
                    <i className={ViewStatic.FEATURE2_ICON} />
                  </div>
                  <div className="description">
                    <h4 className="info-title">{ViewStatic.FEATURE2_TITLE}</h4>
                    <p className="description">
                      {ViewStatic.FEATURE2_DESCRIPTION}
                    </p>
                  </div>
                </div>
              </Col>
              <Col md="4">
                <div className="info">
                  <div className="icon icon-info">
                    <i className={ViewStatic.FEATURE3_ICON} />
                  </div>
                  <div className="description">
                    <h4 className="info-title">{ViewStatic.FEATURE3_TITLE}</h4>
                    <p className="description">
                      {ViewStatic.FEATURE3_DESCRIPTION}
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
        <div className="section section-dark">
          <hr />
        </div>
        <div className="section section-dark text-left">
          <Container>
            <Row>
              <Col className="ml-auto mr-auto" md="4">
                <h2 className="title">{ViewStatic.FEATURE_IMAGE_TITLE}</h2>
                <h5 className="description">
                  {ViewStatic.FEATURE_IMAGE_DESCRIPTION}
                </h5>
              </Col>
              <br />
              <Col className="ml-auto mr-auto" md="4">
                <img
                  alt="..."
                  className="img-rounded img-responsive"
                  src={ViewStatic.FEATURE_IMAGE_SOURCE}
                />
              </Col>
            </Row>
          </Container>
        </div>
        <div className="section section-dark">
          <hr />
        </div>
        <div className="section section-dark text-center">
          <Container>
            <h2 className="title">{ViewStatic.FEATURE_HIGHLIGHT_TITLE}</h2>
              <h5 className="description">
                {ViewStatic.FEATURE_HIGHLIGHT_DESCRIPTION}
              </h5>
              <br />
              <Col className="ml-auto mr-auto" md="4">
                <Button className="btn-fill" color="danger" size="lg" href="register-page">
                  {ViewStatic.FEATURE_HIGHLIGHT_BUTTON}
                </Button>
              </Col>
          </Container>
        </div>
      </div>
      <PageFooter />
    </>
  );
}

export default LandingPage;
