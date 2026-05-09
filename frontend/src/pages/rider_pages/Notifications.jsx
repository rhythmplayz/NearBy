import React from 'react';
import styled from 'styled-components';
import RiderNav from '../../components/RiderNav';
import Footer from '../../components/Footer';

const Container = styled.div`
  padding: 40px;
  background-color: #f9f9f9;
  min-height: calc(100vh - 80px);
  font-family: 'Poppins', sans-serif;
`;

const RiderNotifications = () => {
    return (
        <>
            <RiderNav />
            <Container>
                <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Poppins' }}>
                    <h2>Notifications</h2>
                    <p style={{ color: '#888' }}>You are all caught up!</p>
                </div>
            </Container>
            <Footer />
        </>
    );
};

export default RiderNotifications;