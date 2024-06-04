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
  Card,
  CardBody,
  CardTitle,
  Container,
  Row,
  Col,
} from "reactstrap";

// core components
import PageNavbar from "components/Navbars/PageNavbar.js";
import PageFooter from "components/Footers/PageFooter.js";
import AboutPageHeader from "components/Headers/AboutPageHeader";
import ViewStatic from "assets/data/ViewStatic";

function AboutPage() {
  document.documentElement.classList.remove("nav-open");
  React.useEffect(() => {
    document.body.classList.add("about-page");
    return function cleanup() {
      document.body.classList.remove("about-page");
    };
  });
  return (
    <>
      <PageNavbar />
      <AboutPageHeader />
      <div className="main">
        <div className="section section-dark text-center">
          <Container>
            <h2 className="title">{ViewStatic.MEMBER_SECTION_TITLE}</h2>
            <Row>
              <Col md="3">
                <Card className="card-profile card-plain">
                  <div className="card-avatar">
                    <img
                      alt="..."
                      src={
                        ViewStatic.MEMBER1_PICTURE
                      }
                    />
                  </div>
                  <CardBody>
                    <div className="author">
                      <CardTitle tag="h4">{ViewStatic.MEMBER1_NAME}</CardTitle>
                      <h6 className="card-category">{ViewStatic.MEMBER1_ROLE}</h6>
                    </div>
                    <p className="card-description text-center">
                      {ViewStatic.MEMBER1_DESCRIPTION}
                    </p>
                  </CardBody>
                </Card>
              </Col>
              <Col md="3">
                <Card className="card-profile card-plain">
                  <div className="card-avatar">
                    <img
                      alt="..."
                      src={
                        ViewStatic.MEMBER2_PICTURE
                      }
                    />
                  </div>
                  <CardBody>
                    <div className="author">
                      <CardTitle tag="h4">{ViewStatic.MEMBER2_NAME}</CardTitle>
                      <h6 className="card-category">{ViewStatic.MEMBER2_ROLE}</h6>
                    </div>
                    <p className="card-description text-center">
                      {ViewStatic.MEMBER2_DESCRIPTION}
                    </p>
                  </CardBody>
                </Card>
              </Col>
              <Col md="3">
                <Card className="card-profile card-plain">
                  <div className="card-avatar">
                    <img
                      alt="..."
                      src={
                        ViewStatic.MEMBER3_PICTURE
                      }
                    />
                  </div>
                  <CardBody>
                    <div className="author">
                      <CardTitle tag="h4">{ViewStatic.MEMBER3_NAME}</CardTitle>
                      <h6 className="card-category">{ViewStatic.MEMBER3_ROLE}</h6>
                    </div>
                    <p className="card-description text-center">
                      {ViewStatic.MEMBER3_DESCRIPTION}
                    </p>
                  </CardBody>
                </Card>
              </Col>
              <Col md="3">
                <Card className="card-profile card-plain">
                  <div className="card-avatar">
                    <img
                      alt="..."
                      src={
                        ViewStatic.MEMBER4_PICTURE
                      }
                    />
                  </div>
                  <CardBody>
                    <div className="author">
                      <CardTitle tag="h4">{ViewStatic.MEMBER4_NAME}</CardTitle>
                      <h6 className="card-category">{ViewStatic.MEMBER4_ROLE}</h6>
                    </div>
                    <p className="card-description text-center">
                      {ViewStatic.MEMBER4_DESCRIPTION}
                    </p>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
        <div className="section text-center">
          <Container>
            <div className="info">
              <h2 className="title">{ViewStatic.QUOTE_TITLE}</h2>
              <h5 className="description">
                {ViewStatic.QUOTE_DESCRIPTION}
              </h5>
            </div>
          </Container>
        </div>
      </div>
      <PageFooter />
    </>
  );
}

export default AboutPage;
