import React from 'react';
import styled from 'styled-components';
import UserMarketplaceNav from '../../../components/UserMarketplaceNav';
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
  max-width: 1000px;
  padding: 50px;
  border-radius: 40px;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const Shops = () => {
    return (
        <>
            <UserMarketplaceNav />
            <PageWrapper>
                <ContentContainer>
                    <GlassCard>
                        <h1 style={{ color: '#0D0D0D' }}>Nearby Shops</h1>
                        <p style={{ color: '#666' }}>Browse local businesses and start shopping.</p>
                        <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{ height: '200px', background: '#F8F8F8', borderRadius: '20px', border: '1px solid #EEE' }} />
                            ))}
                        </div>
                    </GlassCard>
                </ContentContainer>
            </PageWrapper>
            <Footer />
        </>
    );
};

export default Shops;