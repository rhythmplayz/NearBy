import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import RiderNav from '../../components/RiderNav';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';

const API = 'http://127.0.0.1:8000/api/riders/profile/';

const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;

const PageWrap = styled.div`
  background: linear-gradient(135deg, #f8fffe 0%, #e8f8f5 50%, #f2f2f2 100%);
  min-height: calc(100vh - 80px);
  font-family: 'Poppins', sans-serif;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 28px 20px;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  color: #1a1a2e;
  margin: 0 0 6px;
  animation: ${fadeIn} 0.4s ease;
`;

const Sub = styled.p`
  color: #888;
  margin: 0 0 28px;
  animation: ${fadeIn} 0.4s ease 0.05s both;
`;

const Panel = styled.div`
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
  animation: ${fadeIn} 0.4s ease 0.1s both;
`;

const PanelTitle = styled.h3`
  font-size: 1.15rem;
  color: #1a1a2e;
  margin: 0 0 24px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;
  position: relative;
`;

const Avatar = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #3CCFC4;
  box-shadow: 0 4px 20px rgba(60, 207, 196, 0.2);
  margin-bottom: 12px;
  background: linear-gradient(135deg, #e8f8f5, #f0faf8);
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarPlaceholder = styled.div`
  font-size: 2.5rem;
  color: #3CCFC4;
`;

const ChangePhotoBtn = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: linear-gradient(135deg, #3CCFC4, #2ba89e);
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.82rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(60, 207, 196, 0.3);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(60, 207, 196, 0.4);
  }
  input { display: none; }
`;

const UserName = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-top: 8px;
`;

const UserTag = styled.div`
  font-size: 0.85rem;
  color: #999;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #444;
  font-size: 0.85rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${p => p.disabled ? '#f0f0f0' : '#e8f0ef'};
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  color: ${p => p.disabled ? '#999' : '#333'};
  background: ${p => p.disabled ? '#f8f8f8' : '#fafcfb'};
  outline: none;
  transition: all 0.2s ease;
  cursor: ${p => p.disabled ? 'not-allowed' : 'text'};
  &:focus:not(:disabled) {
    border-color: #3CCFC4;
    background: white;
    box-shadow: 0 0 0 4px rgba(60, 207, 196, 0.08);
  }
`;

const RatingDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #fff9e6, #fffdf5);
  border-radius: 14px;
  border: 2px solid #f5e6b8;
`;

const RatingStars = styled.span`
  font-size: 1.3rem;
  color: #f5a623;
`;

const RatingValue = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: #f5a623;
`;

const RatingLabel = styled.span`
  font-size: 0.85rem;
  color: #c4960e;
`;

const BtnGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 24px;
`;

const Btn = styled.button`
  background: ${p => p.$bg || 'linear-gradient(135deg, #3CCFC4, #2ba89e)'};
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(60, 207, 196, 0.3);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelBtn = styled(Btn)`
  background: #6c757d;
  &:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(108, 117, 125, 0.3);
  }
`;

const SuccessBanner = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 14px 20px;
  border-radius: 14px;
  margin-bottom: 16px;
  animation: ${fadeIn} 0.3s ease;
`;

const ErrBanner = styled.div`
  background: #fff0f0;
  border: 1px solid #ffd0d0;
  color: #c00;
  padding: 14px 20px;
  border-radius: 14px;
  margin-bottom: 16px;
  animation: ${fadeIn} 0.3s ease;
`;

const InfoCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: #f8faf9;
  border-radius: 14px;
  margin-bottom: 12px;
  border: 1px solid rgba(0, 0, 0, 0.04);
`;

const InfoIcon = styled.span`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 0.78rem;
  color: #999;
  font-weight: 500;
`;

const InfoValue = styled.div`
  font-size: 0.95rem;
  color: #333;
  font-weight: 600;
`;

const Loader = styled.div`
  text-align: center;
  padding: 50px;
  color: #999;
`;

const RiderProfile = () => {
  const [profile, setProfile] = useState({
    id: '', username: '', email: '', full_name: '', phone: '', address: '',
    profile_pic: '', vehicle_type: '', license_number: '', neighbourhood: '', rating: 0.0,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => { fetchProfile(); }, []);

  const apiHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  });

  const fetchProfile = async () => {
    try {
      if (!token) { navigate('/rider/login'); return; }
      const res = await fetch(API, { headers: apiHeaders() });
      if (res.status === 401) { localStorage.removeItem('token'); navigate('/rider/login'); return; }
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setError(null);
      } else {
        const text = await res.text();
        setError(`Failed to load profile: ${res.status}`);
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    setSuccess(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profile_pic', file);
    setUpdating(true);
    try {
      const res = await fetch(API, {
        method: 'PATCH',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setSuccess('Profile picture updated!');
        setError(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update profile picture');
      }
    } catch (err) {
      setError(`Upload error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleSave = async () => {
    setUpdating(true);
    try {
      if (!token) { navigate('/rider/login'); return; }
      const res = await fetch(API, {
        method: 'PATCH',
        headers: apiHeaders(),
        body: JSON.stringify({
          email: profile.email, full_name: profile.full_name, phone: profile.phone,
          address: profile.address, vehicle_type: profile.vehicle_type,
          license_number: profile.license_number, neighbourhood: profile.neighbourhood,
        }),
      });
      if (res.status === 401) { localStorage.removeItem('token'); navigate('/rider/login'); return; }
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setError(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to update profile');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => { setIsEditing(false); fetchProfile(); };

  const picUrl = profile.profile_pic
    ? (profile.profile_pic.startsWith('http') ? profile.profile_pic : `http://127.0.0.1:8000${profile.profile_pic}`)
    : null;

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  if (loading) return (
    <><RiderNav /><PageWrap><Container><Loader>Loading profile...</Loader></Container></PageWrap><Footer /></>
  );

  return (
    <>
      <RiderNav />
      <PageWrap>
        <Container>
          <Title>👤 My Profile</Title>
          <Sub>Manage your account information</Sub>

          {error && <ErrBanner>{error} <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', float: 'right', fontSize: '1.1rem' }}>✕</button></ErrBanner>}
          {success && <SuccessBanner>{success}</SuccessBanner>}

          {/* Avatar & Quick Info */}
          <Panel>
            <AvatarSection>
              <Avatar>
                {picUrl ? <img src={picUrl} alt="Profile" /> : <AvatarPlaceholder>🏍️</AvatarPlaceholder>}
              </Avatar>
              {!isEditing && (
                <ChangePhotoBtn>
                  📷 Change Photo
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={updating} />
                </ChangePhotoBtn>
              )}
              <UserName>{profile.full_name || profile.username}</UserName>
              <UserTag>@{profile.username} · Rider</UserTag>
            </AvatarSection>

            {/* Rating */}
            <RatingDisplay>
              <RatingStars>{renderStars(profile.rating || 0)}</RatingStars>
              <RatingValue>{(profile.rating || 0).toFixed(1)}</RatingValue>
              <RatingLabel>/ 5.0 Rating</RatingLabel>
            </RatingDisplay>
          </Panel>

          {/* Quick Stats (Read-only view) */}
          {!isEditing && (
            <Panel style={{ animationDelay: '0.15s' }}>
              <PanelTitle>📋 Quick Info</PanelTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <InfoCard>
                  <InfoIcon>📧</InfoIcon>
                  <InfoContent><InfoLabel>Email</InfoLabel><InfoValue>{profile.email || '—'}</InfoValue></InfoContent>
                </InfoCard>
                <InfoCard>
                  <InfoIcon>📱</InfoIcon>
                  <InfoContent><InfoLabel>Phone</InfoLabel><InfoValue>{profile.phone || '—'}</InfoValue></InfoContent>
                </InfoCard>
                <InfoCard>
                  <InfoIcon>📍</InfoIcon>
                  <InfoContent><InfoLabel>Address</InfoLabel><InfoValue>{profile.address || '—'}</InfoValue></InfoContent>
                </InfoCard>
                <InfoCard>
                  <InfoIcon>🏘️</InfoIcon>
                  <InfoContent><InfoLabel>Neighbourhood</InfoLabel><InfoValue>{profile.neighbourhood || '—'}</InfoValue></InfoContent>
                </InfoCard>
                <InfoCard>
                  <InfoIcon>🏍️</InfoIcon>
                  <InfoContent><InfoLabel>Vehicle</InfoLabel><InfoValue>{profile.vehicle_type || '—'}</InfoValue></InfoContent>
                </InfoCard>
                <InfoCard>
                  <InfoIcon>🪪</InfoIcon>
                  <InfoContent><InfoLabel>License</InfoLabel><InfoValue>{profile.license_number || '—'}</InfoValue></InfoContent>
                </InfoCard>
              </div>
              <BtnGroup>
                <Btn onClick={() => setIsEditing(true)}>✏️ Edit Profile</Btn>
              </BtnGroup>
            </Panel>
          )}

          {/* Edit Form */}
          {isEditing && (
            <Panel style={{ animationDelay: '0.15s' }}>
              <PanelTitle>✏️ Edit Profile</PanelTitle>

              <FormGrid>
                <FormGroup>
                  <Label>Username</Label>
                  <Input type="text" value={profile.username} disabled />
                </FormGroup>
                <FormGroup>
                  <Label>Email</Label>
                  <Input type="email" name="email" value={profile.email} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Full Name</Label>
                  <Input type="text" name="full_name" value={profile.full_name} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Phone</Label>
                  <Input type="tel" name="phone" value={profile.phone} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Address</Label>
                  <Input type="text" name="address" value={profile.address} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Neighbourhood</Label>
                  <Input type="text" name="neighbourhood" value={profile.neighbourhood} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Vehicle Type</Label>
                  <Input type="text" name="vehicle_type" value={profile.vehicle_type} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label>License Number</Label>
                  <Input type="text" name="license_number" value={profile.license_number} onChange={handleInputChange} />
                </FormGroup>
              </FormGrid>

              <BtnGroup>
                <Btn onClick={handleSave} disabled={updating}>
                  {updating ? 'Saving...' : '💾 Save Changes'}
                </Btn>
                <CancelBtn onClick={handleCancel} disabled={updating}>Cancel</CancelBtn>
              </BtnGroup>
            </Panel>
          )}
        </Container>
      </PageWrap>
      <Footer />
    </>
  );
};

export default RiderProfile;