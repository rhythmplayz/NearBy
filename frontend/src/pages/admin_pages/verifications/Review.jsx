import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Footer from '../../../components/Footer';
import AdminNav from '../../../components/AdminNav';
import NearByLogo from '../../../assets/NearByLogo.png';

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
  background-color: ${(props) => (props.type === 'success' ? '#3CCFC4' : '#ff4d4d')};
`;

const Container = styled.div`
  background: linear-gradient(135deg, #8DF2E8 0%, #f2f2f2 100%);
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  font-family: 'Poppins', sans-serif;
`;

const ReviewBox = styled.div`
  background: #FFFFFF;
  width: 90%;
  max-width: 800px;
  padding: 50px;
  border-radius: 40px;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.05);
`;

const DocGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 30px 0;
`;

const DocCard = styled.div`
  text-align: left;
  p { font-weight: 700; color: #3CCFC4; margin-bottom: 10px; font-size: 0.8rem; }
  iframe, img { 
    width: 100%; 
    height: 300px; 
    border-radius: 15px; 
    border: 1px solid #EEE;
    object-fit: cover;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 40px;
`;

const ActionBtn = styled.button`
  padding: 14px 40px;
  border-radius: 50px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  color: white;
  background-color: ${(props) => (props.variant === 'approve' ? '#3CCFC4' : '#ff4d4d')};
  
  &:hover { opacity: 0.8; transform: translateY(-2px); }
`;

const Review = () => {
    const { pk } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const request = state?.request;
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const getFileUrl = (path) => {
        // If the path is relative, prepend the backend URL
        if (path && !path.startsWith('http')) {
            return `http://127.0.0.1:8000${path}`;
        }
        return path;
    };

    const isPDF = (url) => url?.toLowerCase().split(/[?#]/)[0].endsWith('.pdf');

    const handleUpdate = async (status) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`http://127.0.0.1:8000/api/verifications/admin/verifications/${pk}/review/`,
                { verification_status: status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotification({ show: true, message: `Seller ${status}!`, type: 'success' });
            setTimeout(() => navigate('/admin/verifications/requests'), 1500);
        } catch (err) {
            setNotification({ show: true, message: 'Action failed.', type: 'error' });
        }
    };

    if (!request) return <Container>Invalid Access</Container>;

    return (
        <>
            {notification.show && <Toast type={notification.type}>{notification.message}</Toast>}
            <AdminNav />
            <Container>
                <ReviewBox>
                    <img style={{ width: '60px' }} src={NearByLogo} alt="NearBy" />
                    <h2 style={{ margin: '20px 0 5px' }}>Review: {request.seller_name}</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Review documents carefully before making a decision.</p>

                    <DocGrid>
                        <DocCard>
                            <p>ID PROOF</p>
                            {isPDF(request.id_proof) ? (
                                <iframe src={getFileUrl(request.id_proof)} title="id_proof" />
                            ) : (
                                <img src={getFileUrl(request.id_proof)} alt="ID" />
                            )}
                        </DocCard>
                        <DocCard>
                            <p>BUSINESS LICENSE</p>
                            {isPDF(request.business_license) ? (
                                <iframe src={getFileUrl(request.business_license)} title="license" />
                            ) : (
                                <img src={getFileUrl(request.business_license)} alt="License" />
                            )}
                        </DocCard>
                    </DocGrid>

                    <ButtonGroup>
                        <ActionBtn variant="approve" onClick={() => handleUpdate('verified')}>Approve Seller</ActionBtn>
                        <ActionBtn variant="reject" onClick={() => handleUpdate('rejected')}>Reject Application</ActionBtn>
                    </ButtonGroup>
                </ReviewBox>
            </Container>
            <Footer />
        </>
    );
};

export default Review;