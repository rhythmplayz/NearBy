import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import RiderNav from '../../components/RiderNav';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 24px 40px;
  max-width: 800px;
  margin: 0 auto;
`;

const Panel = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Heading = styled.h2`
  margin: 0 0 24px 0;
  font-size: 1.5rem;
  color: #0D0D0D;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: Poppins, sans-serif;
  font-size: 0.95rem;
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  background: #3CCFC4;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background: #2ab9b1;
  }
`;

const CancelButton = styled(Button)`
  background: #6c757d;
  margin-left: 10px;
  &:hover:not(:disabled) {
    background: #5a6268;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
`;

const ErrorMessage = styled.div`
  background: #fff3f3;
  color: #D9534F;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ffd1d1;
  margin-bottom: 16px;
`;

const SuccessMessage = styled.div`
  background: #f0f9f8;
  color: #3CCFC4;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #b3e5e2;
  margin-bottom: 16px;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
  border: 2px solid #3CCFC4;
`;

const ImageUploadLabel = styled.label`
  display: inline-block;
  background: #3CCFC4;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  &:hover {
    background: #2ab9b1;
  }
`;

const RiderProfile = () => {
  const [profile, setProfile] = useState({
    id: '',
    username: '',
    email: '',
    full_name: '',
    phone: '',
    address: '',
    profile_pic: '',
    vehicle_type: '',
    license_number: '',
    neighbourhood: '',
    rating: 0.0,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const apiHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  });

  const fetchProfile = async () => {
    try {
      if (!token) {
        navigate('/rider/login');
        return;
      }
      const res = await fetch('http://127.0.0.1:8000/api/riders/profile/', {
        headers: apiHeaders(),
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/rider/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setError(null);
      } else {
        const text = await res.text();
        setError(`Failed to load profile: ${res.status} ${text}`);
        console.error('Profile fetch error:', res.status, text);
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
      console.error('Profile fetch exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setSuccess(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_pic', file);

    setUpdating(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/riders/profile/', {
        method: 'PATCH',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setSuccess('Profile picture updated successfully!');
        setError(null);
      } else {
        const text = await res.text();
        setError(`Failed to update profile picture: ${res.status}`);
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
      if (!token) {
        navigate('/rider/login');
        return;
      }

      const res = await fetch('http://127.0.0.1:8000/api/riders/profile/', {
        method: 'PATCH',
        headers: apiHeaders(),
        body: JSON.stringify({
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          vehicle_type: profile.vehicle_type,
          license_number: profile.license_number,
          neighbourhood: profile.neighbourhood,
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/rider/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setError(null);
      } else {
        const err = await res.json();
        setError(`Failed to update profile: ${err.detail || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile();
  };

  if (loading) {
    return (
      <>
        <RiderNav />
        <Container>
          <Panel>
            <Heading>Loading profile...</Heading>
          </Panel>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <RiderNav />
      <Container>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Panel>
          <Heading>My Profile</Heading>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {profile.profile_pic && (
              <ProfileImage
                src={profile.profile_pic.startsWith('http') ? profile.profile_pic : `http://127.0.0.1:8000${profile.profile_pic}`}
                alt="Profile"
              />
            )}
            {!isEditing && (
              <div style={{ marginTop: '12px' }}>
                <ImageUploadLabel>
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={updating}
                  />
                </ImageUploadLabel>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormGroup>
              <Label>Username</Label>
              <Input type="text" value={profile.username} disabled />
            </FormGroup>

            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </FormGroup>

            <FormGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                name="full_name"
                value={profile.full_name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </FormGroup>

            <FormGroup>
              <Label>Phone</Label>
              <Input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </FormGroup>

            <FormGroup>
              <Label>Address</Label>
              <Input
                type="text"
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </FormGroup>

            <FormGroup>
              <Label>Vehicle Type</Label>
              <Input
                type="text"
                name="vehicle_type"
                value={profile.vehicle_type}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </FormGroup>

            <FormGroup>
              <Label>License Number</Label>
              <Input
                type="text"
                name="license_number"
                value={profile.license_number}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </FormGroup>

            <FormGroup>
              <Label>Neighbourhood</Label>
              <Input
                type="text"
                name="neighbourhood"
                value={profile.neighbourhood}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label>Rating</Label>
            <Input type="text" value={`${profile.rating || 0.0} / 5.0`} disabled />
          </FormGroup>

          <ButtonGroup>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            ) : (
              <>
                <Button onClick={handleSave} disabled={updating}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
                <CancelButton onClick={handleCancel} disabled={updating}>
                  Cancel
                </CancelButton>
              </>
            )}
          </ButtonGroup>
        </Panel>
      </Container>
      <Footer />
    </>
  );
};

export default RiderProfile;