import React from 'react';
import styled from 'styled-components';
import UserCommunityNav from '../../../components/UserCommunityNav';

const PageWrapper = styled.div`
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Content = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
`;

const Home = () => (
    <PageWrapper>
        <UserCommunityNav />
        <Content>
            <h2>Community Feed</h2>
            <p>Local updates and posts will appear here.</p>
        </Content>
    </PageWrapper>
);

export default Home;