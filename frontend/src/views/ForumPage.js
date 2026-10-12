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
import React, {  useState} from "react";

// reactstrap components
import { Row, Col, Card, CardTitle, CardBody, Container, Button } from 'reactstrap';

// core components
import Navbar from "components/Navbars/PageNavbar.js";
import Footer from "components/Footers/PageFooter.js";
import API from "api/API";
import { useHistory } from "react-router";

function ForumPage() {

    let api = API.getApi();

    const history = useHistory();
    const [forumList, setForumsData] = useState([]);

    React.useEffect(() => {
        api.getForums().then(allForums => setForumsData(allForums));
        document.body.classList.add("blog-posts");
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        return function cleanup() {
            document.body.classList.remove("blog-posts");
        };
        // eslint-disable-next-line
    },[]);

    return (
        <>
            <Navbar />
            <div className="wrapper">
                <div className="main">
                    {/** Title Section */}
                    <div className="section section-dark">
                        <Container>
                            <div className="motto">
                                <h1>Forums</h1>
                                <br />
                                <h3>Post game related topics to share with everyone.</h3>
                            </div>
                        </Container>
                    </div>
                    <br />
                    <div className="section">
                        <Container>
                            <Row xs={1} md={1} className="g-4">
                                {Array.from({ length: forumList.length }).map((_, idx) => (
                                    <Col key={"forum"+idx}>
                                        <Card>
                                            <CardBody>
                                                <CardTitle tag="h1">
                                                    {forumList[idx].title}
                                                </CardTitle>
                                                <br />
                                                <Button
                                                    className="btn-round"
                                                    color="warning"
                                                    onClick={() => history.push("/forum/" + forumList[idx].tag)}
                                                >
                                                Enter
                                                </Button>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Container>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ForumPage;
