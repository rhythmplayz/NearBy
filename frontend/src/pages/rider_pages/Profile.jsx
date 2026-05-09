import React from 'react';
import styled from 'styled-components';
import RiderNav from '../../components/RiderNav';
import Footer from '../../components/Footer';

const ProfileCard = styled.div`
  max-width: 500px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 20px;
  text-align: center;
  font-family: 'Poppins', sans-serif;
`;

const Container = styled.div`
  padding: 40px;
  background-color: #f9f9f9;
  min-height: calc(100vh - 80px);
  font-family: 'Poppins', sans-serif;
`;

const RiderProfile = () => {
    return (
        <>
            <RiderNav />
            <Container>
                <ProfileCard>
                    <h2>Rider Profile</h2>
                    <p>Manage your account settings and vehicle information.</p>
                </ProfileCard>
            </Container>
            <Footer />
        </>
    );
};

export default RiderProfile;