import React from 'react';
import styled from 'styled-components';
import SellerNav from '../../components/SellerNav';
import Footer from '../../components/Footer';

const ProfileWrapper = styled.div`
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  font-family: 'Poppins', sans-serif;
`;

const Container = styled.div`
  padding: 40px;
  background-color: #f9f9f9;
  min-height: calc(100vh - 80px);
  font-family: 'Poppins', sans-serif;
`;

const SellerProfile = () => {
    return (
        <>
            <SellerNav />
            <Container>
            <ProfileWrapper>
                <h2>Business Profile</h2>
                <hr />
                <p><strong>Business Name:</strong> Loading...</p>
                <p><strong>Email:</strong> Loading...</p>
            </ProfileWrapper>
            </Container>
            <Footer />
        </>
    );
};

export default SellerProfile;