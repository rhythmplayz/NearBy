import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
  background-color: #0d0d0d; /* Rich Black */
  color: #F2F2F2; /* Off White for general text */
  padding: 40px 20px;
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  border-top: 1px solid #1F8F87; /* Subtle Deep Teal border */
`;

const FooterNav = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 10px;

  @media (max-width: 600px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const FooterLink = styled.a`
  color: #8DF2E8; /* Light Aqua */
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #3CCFC4; /* Medium Aqua */
  }

  &:active {
    color: #1F8F87; /* Deep Teal */
  }
`;

const CopyrightText = styled.p`
  font-size: 12px;
  color: #CCCCCC; /* Silver Gray */
  margin: 0;
  letter-spacing: 0.5px;
`;

const Highlight = styled.span`
  color: #F2E205; /* Bright Yellow accent */
  font-weight: 600;
`;

const Footer = () => {
    return (
        <FooterContainer>

            <CopyrightText>
                © {new Date().getFullYear()} <Highlight>NearBy</Highlight>.
                A smarter way to connect with your neighborhood.
            </CopyrightText>
        </FooterContainer>
    );
};

export default Footer;