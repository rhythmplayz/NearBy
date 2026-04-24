import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import NearByLogo from '../../assets/NearByLogo.png';
import Footer from '../../components/Footer';

const slideIn = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Toast = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 30px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  z-index: 1000;
  animation: ${slideIn} 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  background-color: ${props => props.type === 'success' ? '#3CCFC4' : '#ff4d4d'};
`;

const RegContainer = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8DF2E8 0%, #f2f2f2 100%);
  font-family: 'Poppins', sans-serif;
  padding: 40px 20px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  width: 100%;
  max-width: 1100px;
  gap: 30px;
  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
  }
`;

const LogoCard = styled.div`
  background-color: #FFFFFF;
  padding: 50px;
  border-radius: 40px;
  flex: 1;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(141, 242, 232, 0.3);
`;

const FormCard = styled.div`
  background-color: #FFFFFF;
  padding: 50px;
  border-radius: 40px;
  flex: 1;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.08);
`;

const Tagline = styled.p`
  font-size: 1.4rem;
  font-weight: 600;
  color: #0D0D0D;
  margin: 20px 0;
`;

const ProfileCircle = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background-color: #F2E205; 
  background-image: ${props => props.preview ? `url(${props.preview})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  color: #0D0D0D;
  margin-bottom: 5px;
  cursor: pointer;
  border: 4px solid #fff;
  box-shadow: 0px 4px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  overflow: hidden;
  &:hover { transform: scale(1.05); }
`;

const RegInput = styled.input`
  width: 100%;
  padding: 14px 20px;
  margin: 8px 0;
  border-radius: 15px;
  border: 1px solid #eeeeee;
  background-color: #F2F2F2;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  outline: none;
  &::placeholder { color: #CCCCCC; }
  &:focus { border-color: #3CCFC4; background-color: #fff; }
`;

const SubmitButton = styled.button`
  background-color: #3CCFC4;
  border: none;
  padding: 14px 60px;
  border-radius: 50px;
  color: white;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  margin-top: 25px;
  transition: all 0.2s ease-in-out;
  box-shadow: 0px 4px 15px rgba(60, 207, 196, 0.3);
  &:hover {
    background-color: #1F8F87;
    transform: translateY(-2px);
  }
`;

const StyledLink = styled(Link)`
  color: #3CCFC4;
  text-decoration: none;
  font-weight: 600;
  &:hover { color: #1F8F87; text-decoration: underline; }
`;

const SellerRegister = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const [seller, setSeller] = useState({
        full_name: '',
        business_name: '',
        username: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        neighbourhood: '',
        profile_pic: null
    });

    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/seller/dashboard');
        }
    }, [navigate]);

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSeller({ ...seller, profile_pic: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleReg = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(seller).forEach(key => {
            if (seller[key] !== null && seller[key] !== '') {
                formData.append(key, seller[key]);
            }
        });

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/sellers/register/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setNotification({
                show: true,
                message: response.data.message || 'Business registered successfully!',
                type: 'success'
            });

            setTimeout(() => navigate('/seller/login'), 2000);
        } catch (err) {
            let errorMsg = 'Registration failed. Please check your inputs.';

            if (err.response && err.response.data) {
                const firstError = Object.values(err.response.data)[0];
                errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
            }

            setNotification({
                show: true,
                message: errorMsg,
                type: 'error'
            });
            console.error(err.response?.data);
        }
    };

    return (
        <>
            {notification.show && (
                <Toast type={notification.type}>
                    {notification.message}
                </Toast>
            )}
            <RegContainer>
                <ContentWrapper>
                    <LogoCard>
                        <img style={{ width: '100%', maxWidth: '250px' }} src={NearByLogo} alt="NearBy" />
                        <Tagline>Empower Your Business.</Tagline>
                        <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            Join our community of local sellers.
                            Reach nearby neighbors, build trust, and grow your local trade.
                        </p>
                        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f2f2f2', width: '100%' }}>
                            <p style={{ fontSize: '0.95rem', color: '#0D0D0D' }}>
                                Already a Seller? <br />
                                <StyledLink to="/seller/login">Access Seller Portal</StyledLink>
                            </p>
                        </div>
                    </LogoCard>

                    <FormCard as="form" onSubmit={handleReg}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <ProfileCircle
                            preview={preview}
                            onClick={() => fileInputRef.current.click()}
                        >
                            {!preview && "+"}
                        </ProfileCircle>
                        <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>Upload Business Logo</p>

                        <RegInput placeholder="Business Name" onChange={e => setSeller({ ...seller, business_name: e.target.value })} required />
                        <RegInput placeholder="Owner's Full Name" onChange={e => setSeller({ ...seller, full_name: e.target.value })} required />
                        <RegInput placeholder="Business Username" onChange={e => setSeller({ ...seller, username: e.target.value })} required />
                        <RegInput placeholder="Business Email" type="email" onChange={e => setSeller({ ...seller, email: e.target.value })} required />
                        <RegInput type="password" placeholder="Password" onChange={e => setSeller({ ...seller, password: e.target.value })} required />
                        <RegInput placeholder="Serving Neighbourhood" onChange={e => setSeller({ ...seller, neighbourhood: e.target.value })} />
                        <RegInput placeholder="Business Phone No." onChange={e => setSeller({ ...seller, phone: e.target.value })} />
                        <RegInput placeholder="Business Address" onChange={e => setSeller({ ...seller, address: e.target.value })} />

                        <SubmitButton type="submit">Register Business</SubmitButton>
                    </FormCard>
                </ContentWrapper>
            </RegContainer>
            <Footer />
        </>
    );
};

export default SellerRegister;