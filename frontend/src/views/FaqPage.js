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
  Container,
  Card,
  CardHeader,
  CardBody,
  Collapse,
} from "reactstrap";

// core components
import PageNavbar from "components/Navbars/PageNavbar.js";
import FaqPageHeader from "components/Headers/FaqPageHeader";
import PageFooter from "components/Footers/PageFooter.js";
import faqs from "./../assets/data/faq.json";

function FaqPage() {
  document.documentElement.classList.remove("nav-open");
  React.useEffect(() => {
    document.body.classList.add("faq-page");
    return function cleanup() {
      document.body.classList.remove("faq-page");
    };
  });
  const [collapses, setCollapses] = React.useState([]);
  const changeCollapse = collapse => {
    if (collapses.includes(collapse)) {
      setCollapses(collapses.filter(prop => prop !== collapse));
    } else {
      setCollapses([...collapses, collapse]);
    }
  };
  return (
    <>
      <PageNavbar />
      <FaqPageHeader />
      <div className="main">
        <div className="section section-dark text-center">
          <Container>
          <div id="acordeon">
            <div aria-multiselectable={true} id="accordion" role="tablist">
              {faqs.map((faq) => (
                <Card className="no-transition" key={faq.id}>
                  <CardHeader className="card-collapse" id={faq.headerId} role="tab">
                    <h5 className="mb-0 panel-title">
                      <a
                        aria-expanded={collapses.includes(faq.id)}
                        className="collapsed"
                        data-parent="#accordion"
                        href={faq.id}
                        id={faq.collapseId}
                        onClick={e => {
                          e.preventDefault();
                          changeCollapse(faq.id);
                        }}
                      >
                        {faq.question}{" "}
                        <i className="nc-icon nc-minimal-down" />
                      </a>
                    </h5>
                  </CardHeader>
                  <Collapse isOpen={collapses.includes(faq.id)}>
                    <CardBody>
                      <h5>{faq.answer}</h5>
                    </CardBody>
                  </Collapse>
                </Card>
              ))}
            </div>
          </div>
          </Container>
        </div>
      </div>
      <PageFooter />
    </>
  );
}

export default FaqPage;
