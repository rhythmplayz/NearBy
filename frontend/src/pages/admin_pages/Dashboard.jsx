import React from 'react';
import styled from 'styled-components';
import AdminNav from '../../components/AdminNav';
import Footer from '../../components/Footer';

const Container = styled.div`
  padding: 40px;
  background-color: #f9f9f9;
  min-height: calc(100vh - 80px);
  font-family: 'Poppins', sans-serif;
`;

const WelcomeCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
`;

const AdminDashboard = () => {
    return (
        <>
            <AdminNav />
            <Container>
                <WelcomeCard>
                    <h1>Welcome, Admin</h1>
                    <p>Select an option from the navigation bar to manage the platform.</p>
                </WelcomeCard>
            </Container>
            <Footer />
        </>
    );
};

export default AdminDashboard;