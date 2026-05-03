import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../components/Footer';
import NearByLogo from '../../../assets/NearByLogo.png';

const slideIn = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Toast = styled.div`
  position: fixed;
  top: 20px; right: 20px;
  padding: 15px 30px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  z-index: 1000;
  animation: ${slideIn} 0.3s ease-out;
  background-color: ${props => props.type === 'success' ? '#3CCFC4' : '#ff4d4d'};
`;

const Container = styled.div`
  background: linear-gradient(135deg, #8DF2E8 0%, #f2f2f2 100%);
  min-height: 100vh;
  display: flex; justify-content: center; align-items: center;
  font-family: 'Poppins', sans-serif;
  padding: 40px 0;
`;

const SubmitBox = styled.div`
  background: #FFFFFF;
  width: 90%; max-width: 600px;
  padding: 60px; border-radius: 40px;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const StatusCard = styled.div`
  background: #f9f9f9;
  padding: 30px; border-radius: 20px;
  border: 2px solid ${props =>
        props.status === 'verified' ? '#3CCFC4' :
            props.status === 'rejected' ? '#ff4d4d' : '#f39c12'};
  margin: 20px 0;
`;

const SubmitVerification = () => {
    const [idProof, setIdProof] = useState(null);
    const [businessLicense, setBusinessLicense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [verificationData, setVerificationData] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const navigate = useNavigate();
    const API_URL = 'http://127.0.0.1:8000/api/verifications/seller-verification/';
    const token = localStorage.getItem('token');

    const fetchStatus = async () => {
        if (!token) return navigate('/seller/login');
        try {
            const res = await axios.get(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Source 3 returns a list; we take the most recent object
            if (res.data && res.data.length > 0) {
                setVerificationData(res.data[0]);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStatus(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append('id_proof', idProof);
        formData.append('business_license', businessLicense);

        try {
            // FIX: If data exists, it's an update (PATCH). Otherwise, it's a create (POST).
            // This prevents the OneToOne IntegrityError
            const method = verificationData ? 'patch' : 'post';
            const url = verificationData
                ? `http://127.0.0.1:8000/api/verifications/seller-verification/${verificationData.id}/`
                : API_URL;

            await axios({
                method: method,
                url: url,
                data: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setNotification({ show: true, message: 'Documents updated successfully!', type: 'success' });
            // Re-fetch to get new file URLs and timestamps
            await fetchStatus();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Submission failed.';
            setNotification({ show: true, message: errorMsg, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Container><h1>Loading...</h1></Container>;

    return (
        <>
            {notification.show && <Toast type={notification.type}>{notification.message}</Toast>}
            <Container>
                <SubmitBox>
                    <img style={{ width: '80px', marginBottom: '20px' }} src={NearByLogo} alt="NearBy" />

                    {verificationData && (verificationData.verification_status === 'pending' || verificationData.verification_status === 'verified') ? (
                        <>
                            <h1>Status: {verificationData.verification_status.toUpperCase()}</h1>
                            <StatusCard status={verificationData.verification_status}>
                                <p>{verificationData.verification_status === 'pending'
                                    ? "We are currently reviewing your documents."
                                    : "You are a verified seller!"}</p>
                                <small>Last updated: {new Date(verificationData.updated_at).toLocaleString()}</small>
                            </StatusCard>
                            {verificationData.verification_status === 'verified' && (
                                <button onClick={() => navigate('/seller/dashboard')} style={{ padding: '10px 30px', borderRadius: '50px', border: 'none', background: '#3CCFC4', color: '#fff', cursor: 'pointer' }}>
                                    Go to Dashboard
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <h1>{verificationData?.verification_status === 'rejected' ? 'Re-verify Account' : 'Get Verified'}</h1>
                            <p style={{ marginBottom: '30px' }}>{verificationData?.verification_status === 'rejected' ? 'Your previous documents were rejected. Please upload valid ones.' : 'Upload your IDs to unlock selling.'}</p>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                                <div style={{ textAlign: 'left', width: '100%', maxWidth: '400px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#3CCFC4' }}>ID PROOF</label>
                                    <input type="file" onChange={e => setIdProof(e.target.files[0])} required style={{ width: '100%', padding: '10px', marginTop: '5px', background: '#f2f2f2', border: 'none', borderRadius: '10px' }} />
                                </div>
                                <div style={{ textAlign: 'left', width: '100%', maxWidth: '400px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#3CCFC4' }}>BUSINESS LICENSE</label>
                                    <input type="file" onChange={e => setBusinessLicense(e.target.files[0])} required style={{ width: '100%', padding: '10px', marginTop: '5px', background: '#f2f2f2', border: 'none', borderRadius: '10px' }} />
                                </div>
                                <button type="submit" disabled={submitting} style={{ marginTop: '20px', padding: '14px 60px', borderRadius: '50px', border: 'none', background: '#3CCFC4', color: '#fff', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                                    {submitting ? 'Uploading...' : 'Submit Verification'}
                                </button>
                            </form>
                        </>
                    )}
                </SubmitBox>
            </Container>
            <Footer />
        </>
    );
};

export default SubmitVerification;