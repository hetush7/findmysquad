import React, { useState } from "react";
import { Button, Card, Col, Container, Row } from "reactstrap";
import { useHistory, useLocation } from "react-router";

import PageNavbar from "components/Navbars/PageNavbar.js";
import API from "api/API";
import ViewStatic from "assets/data/ViewStatic";

// Discord sends the browser back here after the user approves (or cancels) signing in.
function DiscordCallbackPage() {
  const api = API.getApi();
  const history = useHistory();
  const { search } = useLocation();
  const [error, setError] = useState(null);
  const finished = React.useRef(false);

  React.useEffect(() => {
    // the authorization code can only be used once, so never send it twice
    if (finished.current) {
      return;
    }
    finished.current = true;

    const params = new URLSearchParams(search);
    if (params.get("error")) {
      setError("Discord sign-in was cancelled.");
      return;
    }
    api.finishDiscordLogin(params.get("code"), params.get("state")).then(result => {
      if (result.error) {
        setError(result.error);
      } else {
        history.replace(result.mode === "link" ? "/profile-page" : "/sessions-page");
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <PageNavbar />
      <div className="page-header" style={{ backgroundImage: ViewStatic.LOGIN_REGISTER_BG }}>
        <div className="filter" />
        <Container>
          <Row>
            <Col className="ml-auto mr-auto" lg="4">
              <Card className="card-register ml-auto mr-auto text-center">
                <h3 className="title mx-auto">Discord</h3>
                {error ? (
                  <>
                    <p>{error}</p>
                    <Button className="btn-round" color="danger" onClick={() => history.push("/login-page")}>
                      Back to login
                    </Button>
                  </>
                ) : (
                  <p>Signing you in…</p>
                )}
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default DiscordCallbackPage;
