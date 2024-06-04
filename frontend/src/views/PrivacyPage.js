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
} from "reactstrap";

// core components
import Navbar from "components/Navbars/PageNavbar.js";
import PrivactPageHeader from "components/Headers/PrivacyPageHeader";
import Footer from "components/Footers/PageFooter.js";

function PrivacyPage() {
  document.documentElement.classList.remove("nav-open");
  React.useEffect(() => {
    document.body.classList.add("privacy-page");
    return function cleanup() {
      document.body.classList.remove("privacy-page");
    };
  });
  return (
    <>
      <Navbar />
      <PrivactPageHeader />
      <div className="main">
        <div className="section text-justify">
          <Container>
            <h6>Updated September, 2021</h6>
            <h5>
                This following document sets forth the Privacy Policy for the 
                FindMySquad website, http://www.FindMySquad.com.<br />
                FindMySquad is committed to providing you with the best possible 
                customer service experience. 
                FindMySquad is bound by the Privacy Act 1988 (Cth), 
                which sets out a number of principles concerning the privacy 
                of individuals.
            </h5>
            <br />
            <br />
            <h2 className="title">Collection of your personal information</h2>
            <h5 className="description">
              There are many aspects of the site which can be viewed without 
              providing personal information, however, for access to future 
              FindMySquad customer support features you are required to submit personally 
              identifiable information. This may include but not limited to a 
              unique username and password, or provide sensitive information in 
              the recovery of your lost password.
            </h5>
            <br />
            <br />
            <h2 className="title">Sharing of your personal information</h2>
            <h5 className="description">
              We may occasionally hire other companies to provide services 
              on our behalf, including but not limited to handling customer 
              support enquiries, processing transactions or customer freight 
              shipping. Those companies will be permitted to obtain only the 
              personal information they need to deliver the service. FindMySquad 
              takes reasonable steps to ensure that these organisations are 
              bound by confidentiality and privacy obligations in relation 
              to the protection of your personal information.
            </h5>
            <br />
            <br />
            <h2 className="title">Use of your personal information</h2>
            <h5 className="description">
              For each visitor to reach the site, we expressively collect 
              the following non-personally identifiable information, including 
              but not limited to browser type, version and language, operating 
              system, pages viewed while browsing the Site, page access times 
              and referring website address. This collected information is 
              used solely internally for the purpose of gauging visitor traffic, 
              trends and delivering personalized content to you while you are 
              at this Site. <br />
              From time to time, we may use customer information for new, 
              unanticipated uses not previously disclosed in our privacy notice. 
              If our information practices change at some time in the future we 
              will use for these new purposes only, data collected from the time 
              of the policy change forward will adhere to our updated practices.
            </h5>
            <br />
            <br />
            <h2 className="title">Changes to this Privacy Policy</h2>
            <h5 className="description">
              FindMySquad reserves the right to make amendments to this Privacy 
              Policy at any time. If you have objections to the Privacy Policy, 
              you should not access or use the Site.
            </h5>
            <br />
            <br />
            <h2 className="title">Accessing Your Personal Information</h2>
            <h5 className="description">
              You have a right to access your personal information, 
              subject to exceptions allowed by law. If you would like to do 
              so, please let us know. You may be required to put your request 
              in writing for security reasons. FindMySquad reserves the right to 
              charge a fee for searching for, and providing access to, your 
              information on a per request basis.
            </h5>
            <br />
            <br />
            <h2 className="title">Contacting us</h2>
            <h5 className="description">
              FindMySquad welcomes your comments regarding this Privacy Policy. 
              If you have any questions about this Privacy Policy and would 
              like further information, please contact us.<br /><br />
              E-mail: privacy-policy@F15_Group3.com
            </h5>
          </Container>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PrivacyPage;
