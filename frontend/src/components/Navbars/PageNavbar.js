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
import API from "api/API";

import { Link } from "react-router-dom";
// nodejs library that concatenates strings
import classnames from "classnames";

// reactstrap components
import {
  Collapse,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Button,
} from "reactstrap";

function PageNavbar() {
  let api = API.getApi();
  const link = "/login-page";

  const [navbarColor, setNavbarColor] = React.useState("navbar-transparent");
  const [navbarCollapse, setNavbarCollapse] = React.useState(false);
  const [hrefLink,setLink] = React.useState(link);

  const toggleNavbarCollapse = () => {
    setNavbarCollapse(!navbarCollapse);
    document.documentElement.classList.toggle("nav-open");
  };

  React.useEffect(() => {

    async function updateIcon(){
      let result = await api.currentUserCheck();
      localStorage.setItem('current_user', result)
      if (!result){
        setLink("/login-page")
      } else{
        setLink("/profile-page")
      }
    }

    updateIcon();

    const updateNavbarColor = () => {
      if (
        document.documentElement.scrollTop > 299 ||
        document.body.scrollTop > 299
      ) {
        setNavbarColor("");
      } else if (
        document.documentElement.scrollTop < 300 ||
        document.body.scrollTop < 300
      ) {
        setNavbarColor("navbar-transparent");
      }
    };

    window.addEventListener("scroll", updateNavbarColor);

    return function cleanup() {
      window.removeEventListener("scroll", updateNavbarColor);
    };
  });


  return (
    <Navbar
      className={classnames("fixed-top", navbarColor)}
      color-on-scroll="300"
      expand="lg"
    >
      <Container>
        <div className="navbar-translate">
          <NavbarBrand
            data-placement="bottom"
            to="/index"
            title="Home"
            tag={Link}
          >
            Find My Squad
          </NavbarBrand>
          <button
            aria-expanded={navbarCollapse}
            className={classnames("navbar-toggler navbar-toggler", {
              toggled: navbarCollapse,
            })}
            onClick={toggleNavbarCollapse}
          >
            <span className="navbar-toggler-bar bar1" />
            <span className="navbar-toggler-bar bar2" />
            <span className="navbar-toggler-bar bar3" />
          </button>
        </div>
        <Collapse
          className="justify-content-end"
          navbar
          isOpen={navbarCollapse}
        >
          <Nav navbar>
            <NavItem>
              <NavLink to="/landing-page" tag={Link}>
                Home
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/about-page" tag={Link}>
                About Us
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/faq-page" tag={Link}>
                FAQs
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/privacy-page" tag={Link}>
                Privacy
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/sessions-page" tag={Link}>
                Find a Party
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/forum-page" tag={Link}>
                Forums
              </NavLink>
            </NavItem>
            <NavItem>
              <Button
                className="btn-round"
                color="danger"
                href={hrefLink} 
              >
                <i className="nc-icon nc-single-02"></i>
              </Button>
            </NavItem>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
}

export default PageNavbar;
