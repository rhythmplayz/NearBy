import React from 'react';
import styled from 'styled-components';
import UserCommunityNav from '../../../components/UserCommunityNav';

const PageWrapper = styled.div`
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const ProfileCard = styled.div`
  margin: 50px auto;
  width: 350px;
  background: white;
  border: 2px solid #57cfff;
  padding: 30px;
  border-radius: 20px;
  text-align: center;
`;

const Profile = () => (
    <PageWrapper>
        <UserCommunityNav />
        <ProfileCard>
            <div style={{ fontSize: '50px' }}>👤</div>
            <h3>User Profile</h3>
            <p style={{ color: '#888' }}>Full Name: ---</p>
            <p style={{ color: '#888' }}>Address: ---</p>
        </ProfileCard>
    </PageWrapper>
);

export default Profile;