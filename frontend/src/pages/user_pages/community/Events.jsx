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
  max-width: 700px;
  padding: 50px;
  border-radius: 40px;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-align: center;
`;

const Events = () => {
  return (
    <>
      <UserCommunityNav />
      <PageWrapper>
        <ContentContainer>
          <GlassCard>
            <h2 style={{ fontSize: '2.5rem' }}>📅</h2>
            <h1>Upcoming Events</h1>
            <p style={{ color: '#888' }}>Find workshops, meetups, and community gatherings.</p>
            <button style={{ background: '#3CCFC4', border: 'none', padding: '12px 30px', borderRadius: '50px', color: 'white', fontWeight: '700', marginTop: '20px' }}>
              Browse Calendar
            </button>
          </GlassCard>
        </ContentContainer>
      </PageWrapper>
      <Footer />
    </>
  );
};

export default Events;