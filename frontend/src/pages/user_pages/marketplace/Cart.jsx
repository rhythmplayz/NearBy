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
  max-width: 600px;
  padding: 50px;
  border-radius: 40px;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-align: center;
`;

const Cart = () => {
    return (
        <>
            <UserMarketplaceNav />
            <PageWrapper>
                <ContentContainer>
                    <GlassCard>
                        <h1 style={{ fontSize: '3rem' }}>🛒</h1>
                        <h2>Your Cart</h2>
                        <p style={{ color: '#888' }}>Your shopping cart is currently empty.</p>
                        <button style={{ background: '#3CCFC4', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '50px', fontWeight: '700', marginTop: '20px', cursor: 'pointer' }}>
                            Continue Shopping
                        </button>
                    </GlassCard>
                </ContentContainer>
            </PageWrapper>
            <Footer />
        </>
    );
};

export default Cart;