import React from 'react';
import styled from 'styled-components';
import SellerNav from '../../components/SellerNav';
import Footer from '../../components/Footer';
import NotificationsList from '../../components/NotificationsList';

const Container = styled.div`
  padding: 40px;
  background-color: #f9f9f9;
  min-height: calc(100vh - 80px);
  font-family: 'Poppins', sans-serif;
  display: flex;
  justify-content: center;
`;

const ContentCard = styled.div`
  width: 100%;
  max-width: 800px;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
`;

const SellerNotifications = () => {
    return (
        <>
            <SellerNav />
            <Container>
                <ContentCard>
                    <NotificationsList />
                </ContentCard>
            </Container>
            <Footer />
        </>
    );
};

export default SellerNotifications;