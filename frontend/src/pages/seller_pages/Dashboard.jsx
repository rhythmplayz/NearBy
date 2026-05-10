import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import SellerNav from '../../components/SellerNav';
import Footer from '../../components/Footer';

const Container = styled.div`
  padding: 40px;
  background-color: #f9f9f9;
  min-height: calc(100vh - 80px);
  font-family: 'Poppins', sans-serif;
`;

const Card = styled.div`
    max-width: 900px;
    margin: 0 auto;
    background: white;
    border-radius: 28px;
    padding: 32px;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
`;

const PrimaryLink = styled(Link)`
    display: inline-flex;
    margin-top: 20px;
    background: #3CCFC4;
    color: white;
    text-decoration: none;
    padding: 14px 22px;
    border-radius: 999px;
    font-weight: 700;
`;

const SellerDashboard = () => {
    return (
        <>
            <SellerNav />
            <Container>
                                <Card>
                                        <h1>Seller Dashboard</h1>
                                        <p>Manage your business and track your sales here.</p>
                                        <PrimaryLink to="/seller/products">Manage Products</PrimaryLink>
                                </Card>
            </Container>
            <Footer />
        </>
    );
};

export default SellerDashboard;