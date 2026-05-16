import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import UserMarketplaceNav from '../../../components/UserMarketplaceNav';
import Footer from '../../../components/Footer';

const fadeIn = keyframes`from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}`;

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #f8fffe 0%, #e8f8f5 50%, #f2f2f2 100%);
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  gap: 30px;
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  width: 100%;
  max-width: 1000px;
  padding: 50px;
  border-radius: 30px;
  box-shadow: 0 12px 40px rgba(60, 207, 196, 0.08);
  border: 1px solid rgba(60, 207, 196, 0.1);
  animation: ${fadeIn} 0.5s ease;
`;

const QuickLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const LinkCard = styled.div`
  background: linear-gradient(135deg, ${p => p.$bg || '#e8f8f5'}, white);
  border-radius: 24px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.04);
  &:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(60, 207, 196, 0.15); }
`;

const LinkIcon = styled.div`font-size: 2.5rem; margin-bottom: 12px;`;
const LinkTitle = styled.h3`color: #1a1a2e; margin: 0 0 8px; font-size: 1.1rem;`;
const LinkDesc = styled.p`color: #888; margin: 0; font-size: 0.9rem;`;

const Shops = () => {
  const navigate = useNavigate();

  return (
    <>
      <UserMarketplaceNav />
      <PageWrapper>
        <ContentContainer>
          <GlassCard>
            <h1 style={{ color: '#1a1a2e', marginBottom: 8 }}>🛒 NearBy Marketplace</h1>
            <p style={{ color: '#888', fontSize: '1.05rem' }}>Discover products from local businesses near you</p>

            <QuickLinks>
              <LinkCard $bg="#e8f8f5" onClick={() => navigate('/user/products')}>
                <LinkIcon>🛍️</LinkIcon>
                <LinkTitle>Browse Products</LinkTitle>
                <LinkDesc>Search and explore products with filters, ratings, and more</LinkDesc>
              </LinkCard>

              <LinkCard $bg="#f0e8f8" onClick={() => navigate('/user/orders')}>
                <LinkIcon>📦</LinkIcon>
                <LinkTitle>Track Orders</LinkTitle>
                <LinkDesc>View and track your delivery orders in real-time</LinkDesc>
              </LinkCard>

              <LinkCard $bg="#f8f0e8" onClick={() => navigate('/user/cart')}>
                <LinkIcon>🛒</LinkIcon>
                <LinkTitle>My Cart</LinkTitle>
                <LinkDesc>View items in your shopping cart</LinkDesc>
              </LinkCard>
            </QuickLinks>
          </GlassCard>
        </ContentContainer>
      </PageWrapper>
      <Footer />
    </>
  );
};

export default Shops;