import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../../components/Footer';
import NearByLogo from '../../assets/NearByLogo.png';

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

const Container = styled.div`
  background: linear-gradient(135deg, #8DF2E8 0%, #f2f2f2 100%);
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Poppins', sans-serif;
`;

const LoginBox = styled.div`
  background: #FFFFFF;
  width: 90%;
  max-width: 600px;
  padding: 60px;
  border-radius: 40px;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const Title = styled.h1`
  color: #0D0D0D;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 10px;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 40px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 16px 24px;
  background-color: #F2F2F2;
  border: 1px solid #eeeeee;
  border-radius: 15px;
  outline: none;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  transition: all 0.2s;

  &::placeholder { color: #CCCCCC; }
  &:focus { border-color: #3CCFC4; background-color: #fff; }
`;

const Button = styled.button`
  background-color: #3CCFC4;
  border: none;
  padding: 14px 40px;
  border-radius: 50px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.2s ease-in-out;
  
  &:hover { background-color: #1F8F87; transform: translateY(-2px); }
  &:active { background-color: #0F4F4A; transform: translateY(0); }
`;

const StyledLink = styled(Link)`
  color: #3CCFC4;
  text-decoration: none;
  font-weight: 600;
  &:hover { color: #1F8F87; text-decoration: underline; }
`;

const Login = () => {
    const [data, setData] = useState({ username: '', password: '' });
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const navigate = useNavigate();

    // --- AUTH REDIRECT LOGIC ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // If token exists, they are already logged in
            navigate('/user/home');
        }
    }, [navigate]);
    // ---------------------------

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/users/login/', data);
            localStorage.setItem('token', res.data.access);

            setNotification({ show: true, message: 'Login Success! Redirecting...', type: 'success' });

            setTimeout(() => navigate('/user/home'), 1500);
        } catch (err) {
            setNotification({ show: true, message: 'Login failed! Please check your credentials.', type: 'error' });
            console.error(err);
        }
    };

    return (
        <>
            {notification.show && (
                <Toast type={notification.type}>
                    {notification.message}
                </Toast>
            )}

            <Container>
                <LoginBox>
                    <img style={{ width: '120px', marginBottom: '30px' }} src={NearByLogo} alt="NearBy" />

                    <Title>Welcome back.</Title>
                    <Subtitle>Enter your details to access your neighborhood.</Subtitle>

                    <Form onSubmit={handleLogin}>
                        <Input
                            type="text"
                            placeholder="User Name"
                            value={data.username}
                            onChange={e => setData({ ...data, username: e.target.value })}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Enter Your Password"
                            value={data.password}
                            onChange={e => setData({ ...data, password: e.target.value })}
                            required
                        />
                        <Button type="submit">Get Started</Button>
                    </Form>

                    <p style={{ marginTop: '30px', fontSize: '14px', color: '#0D0D0D' }}>
                        If you don't have an account, <StyledLink to="/user/register">create one here</StyledLink>
                    </p>
                </LoginBox>
            </Container>
            <Footer />
        </>
    );
};

export default Login;