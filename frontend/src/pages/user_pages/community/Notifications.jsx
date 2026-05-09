import React from 'react';
import styled from 'styled-components';
import UserCommunityNav from '../../../components/UserCommunityNav';
import Footer from '../../../components/Footer';

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #f2f2f2 0%, #8DF2E8 100%);
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
`;

const ContentContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px 20px;
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 600px;
  padding: 50px;
  border-radius: 40px;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const NotificationItem = styled.div`
  padding: 20px;
  border-bottom: 1px solid #EEE;
  text-align: left;
  &:last-child { border-bottom: none; }
`;

const Notifications = () => {
    return (
        <>
            <UserCommunityNav />
            <PageWrapper>
                <ContentContainer>
                    <GlassCard>
                        <h1 style={{ marginBottom: '20px' }}>Notifications</h1>
                        <NotificationItem>
                            <p style={{ fontWeight: '600', margin: 0 }}>Welcome to NearBy!</p>
                            <small style={{ color: '#888' }}>Start exploring your community.</small>
                        </NotificationItem>
                    </GlassCard>
                </ContentContainer>
            </PageWrapper>
            <Footer />
        </>
    );
};

export default Notifications;