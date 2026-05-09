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

const RiderDashboard = () => {
    return (
        <>
            <RiderNav />
            <Container>
                <h1>Rider Dashboard</h1>
                <p>Track your active deliveries and pending tasks here.</p>
            </Container>
            <Footer />
        </>
    );
};

export default RiderDashboard;