import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNav from '../../components/AdminNav';
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
  z-index: 2000;
  animation: ${slideIn} 0.3s ease-out;
  background-color: ${props => props.type === 'success' ? '#3CCFC4' : '#ff4d4d'};
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #f2f2f2 0%, #8DF2E8 100%);
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
`;

const ProfileContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px 20px;
`;

const ProfileCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 500px;
  padding: 50px;
  border-radius: 40px;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.05);
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #3CCFC4;
  background-image: ${props => props.img ? `url(${props.img})` : 'none'};
  background-size: cover;
  background-position: center;
  margin: 0 auto 20px;
  border: 5px solid #fff;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover::after {
    content: 'Edit';
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.3);
    color: white;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const AdminBadge = styled.div`
  background-color: #000;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const InputGroup = styled.div`
  text-align: left;
  margin-bottom: 20px;
  width: 100%;

  label {
    font-size: 11px;
    font-weight: 700;
    color: #3CCFC4;
    margin-left: 5px;
    text-transform: uppercase;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 14px 20px;
  margin-top: 5px;
  border-radius: 15px;
  border: 1px solid #eeeeee;
  background-color: #F8F8F8;
  font-family: 'Poppins', sans-serif;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #3CCFC4;
    background-color: #fff;
  }

  &:disabled {
    background-color: #f2f2f2;
    color: #888;
    cursor: not-allowed;
  }
`;

const SaveButton = styled.button`
  background-color: #3CCFC4;
  border: none;
  padding: 14px 50px;
  border-radius: 50px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.2s;

  &:hover {
    background-color: #1F8F87;
    transform: translateY(-2px);
  }
`;

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const [profile, setProfile] = useState({
        full_name: '',
        username: '',
        email: '',
        address: '',
        phone: '',
        profile_pic: null,
        status: ''
    });

    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            try {
                const res = await axios.get('http://127.0.0.1:8000/api/admins/profile/', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log("ADMIN DATA RECEIVED:", res.data);

                setProfile({
                    full_name: res.data.full_name || '',
                    username: res.data.username || '',
                    email: res.data.email || '',
                    address: res.data.address || '',
                    phone: res.data.phone || '',
                    profile_pic: res.data.profile_pic || null,
                    status: res.data.status || ''
                });

                setPreview(res.data.profile_pic);
                setLoading(false);
            } catch (err) {
                console.error("Fetch error:", err);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/admin/login');
                }
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();

        formData.append('full_name', profile.full_name);
        formData.append('address', profile.address);
        formData.append('phone', profile.phone);

        if (profile.profile_pic instanceof File) {
            formData.append('profile_pic', profile.profile_pic);
        }

        try {
            await axios.put('http://127.0.0.1:8000/api/admins/profile/', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setNotification({ show: true, message: 'Admin profile updated!', type: 'success' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        } catch (err) {
            setNotification({ show: true, message: 'Update failed.', type: 'error' });
        }
    };

    if (loading) return <PageWrapper><AdminNav /></PageWrapper>;

    return (
        <>
            {notification.show && <Toast type={notification.type}>{notification.message}</Toast>}
            <AdminNav />
            <PageWrapper>
                <ProfileContainer>
                    <ProfileCard>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setProfile({ ...profile, profile_pic: file });
                                    setPreview(URL.createObjectURL(file));
                                }
                            }}
                        />

                        <ProfileImage img={preview} onClick={() => fileInputRef.current.click()}>
                            {!preview && "🛡️"}
                        </ProfileImage>

                        <AdminBadge>Platform Administrator</AdminBadge>
                        <h2 style={{ marginBottom: '5px' }}>{profile.full_name || 'System Admin'}</h2>
                        <p style={{ color: '#888', marginBottom: '30px' }}>@{profile.username || 'admin'}</p>

                        <form onSubmit={handleUpdate}>
                            <InputGroup>
                                <label>Admin Email</label>
                                <StyledInput value={profile.email} disabled />
                            </InputGroup>

                            <InputGroup>
                                <label>Display Name</label>
                                <StyledInput
                                    value={profile.full_name}
                                    onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                    placeholder="Enter full name"
                                />
                            </InputGroup>

                            <InputGroup>
                                <label>Contact Phone</label>
                                <StyledInput
                                    value={profile.phone}
                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                />
                            </InputGroup>

                            <InputGroup>
                                <label>Office/Base Address</label>
                                <StyledInput
                                    value={profile.address}
                                    onChange={e => setProfile({ ...profile, address: e.target.value })}
                                    placeholder="Enter address"
                                />
                            </InputGroup>

                            <SaveButton type="submit">Update Records</SaveButton>
                        </form>
                    </ProfileCard>
                </ProfileContainer>
            </PageWrapper>
            <Footer />
        </>
    );
};

export default Profile;