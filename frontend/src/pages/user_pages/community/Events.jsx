import React from 'react';
import styled from 'styled-components';
import UserCommunityNav from '../../../components/UserCommunityNav';

const PageWrapper = styled.div`
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const CalendarBox = styled.div`
  margin: 40px auto;
  width: 90%;
  max-width: 800px;
  height: 400px;
  background: #e0e0e0;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed #999;
`;

const Events = () => (
    <PageWrapper>
        <UserCommunityNav />
        <CalendarBox>
            <h3 style={{ color: '#777' }}>Events Calendar Placeholder</h3>
        </CalendarBox>
    </PageWrapper>
);

export default Events;