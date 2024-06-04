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
import { Card, Container, Row, Col } from "reactstrap";

// core components
import PageNavbar from "components/Navbars/PageNavbar.js";
import ViewStatic from "assets/data/ViewStatic";
import FooterStatic from "components/Footers/FooterStatic";

function Error404Page() {
  document.documentElement.classList.remove("nav-open");
  React.useEffect(() => {
    document.body.classList.add("error-page");
    return function cleanup() {
      document.body.classList.remove("error-page");
    };
  });
  return (
    <>
      <PageNavbar />
      <div
        className="page-header"
        style={{
          backgroundImage:
            ViewStatic.ERROR_BG
        }}
      >
        <div className="filter" />
        <Container>
          <Row>
            <Col className="ml-auto mr-auto" lg="4">
              <Card className="ml-auto mr-auto">
                <h3 className="title mx-auto text-dark">Error 404</h3>
              </Card>
            </Col>
          </Row>
        </Container>
        <FooterStatic />
      </div>
    </>
  );
}

export default Error404Page;
