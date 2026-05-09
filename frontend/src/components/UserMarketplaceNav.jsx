import React from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';

import homeIcon from '../assets/nav_icons/user_marketplace/home.png';
import cartIcon from '../assets/nav_icons/user_marketplace/cart.png';
import communityIcon from '../assets/nav_icons/user_marketplace/community.png';
import notificationsIcon from '../assets/nav_icons/user_marketplace/notifications.png';
import profileIcon from '../assets/nav_icons/user_marketplace/profile.png';

const NavContainer = styled.nav`
  width: 100%;
  height: 80px;
  background-color: #3CCFC4;
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
`;

const IconGroup = styled.div`
  display: flex;
  gap: 60px;
  align-items: center;
  @media (max-width: 600px) { gap: 30px; }
`;

const StyledNavLink = styled(NavLink)`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  position: relative;
  padding: 10px;

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    width: 0;
    height: 4px;
    background-color: white;
    border-radius: 10px;
    transition: width 0.3s ease;
  }

  &:hover { transform: translateY(-3px); }
  &.active {
    &::after { width: 25px; }
    filter: drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.6));
  }
`;

const IconImage = styled.img`
  width: 38px;
  height: 38px;
  object-fit: contain;
  filter: brightness(0) invert(1); 
`;

const LogoutButton = styled.button`
  position: absolute;
  right: 40px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid white;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: white; color: #3CCFC4; }
  @media (max-width: 850px) { position: static; margin-left: 20px; }
`;

const UserMarketplaceNav = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/user/login');
    };

    return (
        <NavContainer>
            <IconGroup>
                <StyledNavLink to="/user/home">
                    <IconImage src={communityIcon} alt="Community" title="Back to Community" />
                </StyledNavLink>
                <StyledNavLink to="/user/shops">
                    <IconImage src={homeIcon} alt="Marketplace" title="Shops" />
                </StyledNavLink>
                <StyledNavLink to="/user/cart">
                    <IconImage src={cartIcon} alt="Cart" />
                </StyledNavLink>
                <StyledNavLink to="/user/notifications">
                    <IconImage src={notificationsIcon} alt="Notifications" />
                </StyledNavLink>
                <StyledNavLink to="/user/profile">
                    <IconImage src={profileIcon} alt="Profile" />
                </StyledNavLink>
            </IconGroup>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </NavContainer>
    );
};

export default UserMarketplaceNav;