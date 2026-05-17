import React from 'react';
import styled from 'styled-components';
import RiderNav from '../../components/RiderNav';
import Footer from '../../components/Footer';
import NotificationsList from '../../components/NotificationsList';

const PageWrap = styled.div`
  background: linear-gradient(135deg, #f8fffe 0%, #e8f8f5 50%, #f2f2f2 100%);
  min-height: calc(100vh - 80px);
  font-family: 'Poppins', sans-serif;
  padding: 28px 20px;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const ContentCard = styled.div`
  background: white;
  padding: 28px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
`;

const Title = styled.h1`
  font-size: 1.6rem;
  color: #1a1a2e;
  margin: 0 0 20px;
`;

const RiderNotifications = () => {
    return (
        <>
            <RiderNav />
            <PageWrap>
                <Container>
                    <Title>🔔 Notifications</Title>
                    <ContentCard>
                        <NotificationsList />
                    </ContentCard>
                </Container>
            </PageWrap>
            <Footer />
        </>
    );
};

export default RiderNotifications;