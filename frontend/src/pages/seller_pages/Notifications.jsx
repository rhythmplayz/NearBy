import React from 'react';
import styled from 'styled-components';
import SellerNav from '../../components/SellerNav';
import Footer from '../../components/Footer';

const Container = styled.div`
  padding: 40px;
  background-color: #f9f9f9;
  min-height: calc(100vh - 80px);
  font-family: 'Poppins', sans-serif;
`;

const SellerNotifications = () => {
    return (
        <>
            <SellerNav />
            <Container>
            <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Poppins' }}>
                <h2>Notifications</h2>
                <p style={{ color: '#888' }}>No new messages or alerts.</p>
            </div>
            </Container>
            <Footer />
        </>
    );
};

export default SellerNotifications;