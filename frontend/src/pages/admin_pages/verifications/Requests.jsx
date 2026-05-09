import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  background-color: ${(props) => (props.type === 'success' ? '#3CCFC4' : '#ff4d4d')};
`;

const Container = styled.div`
  background: linear-gradient(135deg, #8DF2E8 0%, #f2f2f2 100%);
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Poppins', sans-serif;
  padding: 60px 20px;
`;

const ContentBox = styled.div`
  background: #FFFFFF;
  width: 100%;
  max-width: 1000px;
  padding: 40px;
  border-radius: 30px;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: #0D0D0D;
  font-size: 1.8rem;
  font-weight: 800;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  text-align: left;
  padding: 15px;
  border-bottom: 2px solid #F2F2F2;
  color: #3CCFC4;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.8rem;
`;

const Td = styled.td`
  padding: 15px;
  border-bottom: 1px solid #F2F2F2;
  color: #444;
  font-size: 0.9rem;
`;

const StatusBadge = styled.span`
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  background-color: ${(props) => {
        if (props.status === 'verified') return '#3CCFC4';
        if (props.status === 'pending') return '#f39c12';
        return '#ff4d4d';
    }};
`;

const ActionButton = styled.button`
  background-color: #0D0D0D;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover { background-color: #3CCFC4; transform: scale(1.05); }
`;

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/verifications/admin/verifications/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRequests(res.data);
            } catch (err) {
                setNotification({ show: true, message: 'Failed to load requests.', type: 'error' });
            }
        };
        fetchRequests();
    }, []);

    return (
        <>
            {notification.show && <Toast type={notification.type}>{notification.message}</Toast>}
            <AdminNav />
            <Container>
                <ContentBox>
                    <Header>
                        <Title>Verification Requests</Title>
                        <img style={{ width: '80px' }} src={NearByLogo} alt="NearBy" />
                    </Header>
                    <Table>
                        <thead>
                            <tr>
                                <Th>Seller Name</Th>
                                <Th>Email</Th>
                                <Th>Date Applied</Th>
                                <Th>Status</Th>
                                <Th>Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id}>
                                    <Td><strong>{req.seller_name}</strong></Td>
                                    <Td>{req.seller_email}</Td>
                                    <Td>{new Date(req.created_at).toLocaleDateString()}</Td>
                                    <Td><StatusBadge status={req.verification_status}>{req.verification_status}</StatusBadge></Td>
                                    <Td>
                                        <ActionButton onClick={() => navigate(`/admin/verifications/review/${req.id}`, { state: { request: req } })}>
                                            Review
                                        </ActionButton>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </ContentBox>
            </Container>
            <Footer />
        </>
    );
};

export default Requests;