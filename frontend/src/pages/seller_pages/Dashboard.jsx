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

const SellerDashboard = () => {
    return (
        <>
            <SellerNav />
            <Container>
                <h1>Seller Dashboard</h1>
                <p>Manage your business and track your sales here.</p>
            </Container>
            <Footer />
        </>
    );
};

export default SellerDashboard;