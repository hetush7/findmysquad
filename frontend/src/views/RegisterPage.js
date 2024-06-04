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
import React, {useState} from "react";
import API from "api/API";

// reactstrap components
import { Button, Card, Form, Input, Container, Row, Col } from "reactstrap";

// core components
import PageNavbar from "components/Navbars/PageNavbar.js";
import ViewStatic from "assets/data/ViewStatic";
import FooterStatic from "components/Footers/FooterStatic";


function RegisterPage() {
  let api = API.getApi();

  document.documentElement.classList.remove("nav-open");
  React.useEffect(() => {
    document.body.classList.add("register-page");
    return function cleanup() {
      document.body.classList.remove("register-page");
    };
  });

  const [inputField , setInputField] = useState({
    username: '',
    email:    '',
    password: ''
  });

  const inputsHandler = e => {
    const {name, value} = e.target;
    setInputField(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const submitButton = async (e) => {
    e.preventDefault();
    if (inputField.username && 
        inputField.email &&
        inputField.password) {
        
        // Register User 
        await api.registerUser(inputField.username, inputField.email, inputField.password);

        // Login User 
        const data = await api.loginUser(inputField.username, inputField.password);
        localStorage.setItem('access_token', data.access)

        let result = await api.currentUserCheck();
        localStorage.setItem('current_user', result)

        // Redirect to Sessions Page:
        window.location.replace('http://localhost:3000/sessions-page')
    } else {
      alert("Some fields are missing.");
    }
  }

  return (
    <>
      <PageNavbar />
      <div
        className="page-header"
        style={{
          backgroundImage:
            ViewStatic.LOGIN_REGISTER_BG
        }}
      >
        <div className="filter" />
        <Container>
          <Row>
            <Col className="ml-auto mr-auto" lg="4">
              <Card className="card-register ml-auto mr-auto">
                <h3 className="title mx-auto">Welcome</h3>
                <Form className="register-form" onSubmit={submitButton}>
                  <label>Username</label>
                  <Input 
                    placeholder="Username" 
                    type="text" 
                    name="username"
                    onChange={inputsHandler}
                    value={inputField.username} 
                  />
                  <label>Email</label>
                  <Input 
                    placeholder="Email" 
                    type="text" 
                    name="email"
                    onChange={inputsHandler}
                    value={inputField.email} 
                  />
                  <label>Password</label>
                  <Input 
                    placeholder="Password" 
                    type="password" 
                    name="password"
                    onChange={inputsHandler}
                    value={inputField.password} 
                  />
                  <Button 
                    block className="btn-round" 
                    color="danger"
                    type="submit"
                  >
                    Register
                  </Button>
                </Form>
                <div className="forgot">
                  <Button
                    className="btn-link"
                    color="danger"
                    href="/login-page"
                  >
                    Have an account? Login
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
        <FooterStatic />
      </div>
    </>
  );
}

export default RegisterPage;
