import React from 'react';
import styled from 'styled-components';
import UserCommunityNav from '../../../components/UserCommunityNav';
import Footer from '../../../components/Footer';
import NotificationsList from '../../../components/NotificationsList';

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
  max-width: 800px;
  padding: 50px;
  border-radius: 40px;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const Notifications = () => {
    return (
        <>
            <UserCommunityNav />
            <PageWrapper>
                <ContentContainer>
                    <GlassCard>
                        <NotificationsList />
                    </GlassCard>
                </ContentContainer>
            </PageWrapper>
            <Footer />
        </>
    );
};

export default Notifications;