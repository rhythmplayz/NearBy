import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import UserCommunityNav from '../../../components/UserCommunityNav';
import Footer from '../../../components/Footer';

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
  padding-bottom: 50px;
`;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  gap: 40px;
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
  background-color: #F2E205;
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

const MyPostsSection = styled.div`
  max-width: 600px;
  width: 100%;
`;

const PostCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 25px;
  margin-bottom: 20px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.03);
  text-align: left;
  border-left: 6px solid #3CCFC4;
  transition: transform 0.2s;

  &:hover { transform: scale(1.01); }
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  
  .type-badge {
    background: #e0f7f6;
    color: #3CCFC4;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
  }
  
  .date { font-size: 11px; color: #aaa; }
`;

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [userPosts, setUserPosts] = useState([]);

  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    email: '',
    address: '',
    phone: '',
    profile_pic: null
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/user/login');
        return;
      }

      try {
        const profileRes = await axios.get('http://127.0.0.1:8000/api/users/profile/', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = profileRes.data;
        setProfile({
          full_name: userData.full_name || '',
          username: userData.username || '',
          email: userData.email || '',
          address: userData.address || '',
          phone: userData.phone || '',
          profile_pic: userData.profile_pic || null
        });
        setPreview(userData.profile_pic);

        const postsRes = await axios.get('http://127.0.0.1:8000/api/posts/', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const filtered = postsRes.data.filter(post => post.author_username === userData.username);
        setUserPosts(filtered);

      } catch (err) {
        console.error("Initialization error:", err);
        if (err.response?.status === 401) navigate('/user/login');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
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
      await axios.put('http://127.0.0.1:8000/api/users/profile/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setNotification({ show: true, message: 'Profile updated!', type: 'success' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    } catch (err) {
      setNotification({ show: true, message: 'Update failed.', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  if (loading) return <PageWrapper><UserCommunityNav /><p style={{ textAlign: 'center', marginTop: '50px' }}>Loading Profile...</p></PageWrapper>;

  return (
    <>
      {notification.show && <Toast type={notification.type}>{notification.message}</Toast>}
      <UserCommunityNav />
      <PageWrapper>
        <ProfileContainer>

          {/* TOP: PROFILE EDITING CARD */}
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
              {!preview && "👤"}
            </ProfileImage>

            <h2 style={{ marginBottom: '5px' }}>{profile.full_name || 'My Profile'}</h2>
            <p style={{ color: '#888', marginBottom: '30px' }}>@{profile.username || 'username'}</p>

            <form onSubmit={handleUpdate}>
              <InputGroup>
                <label>Email Address</label>
                <StyledInput value={profile.email} disabled />
              </InputGroup>

              <InputGroup>
                <label>Full Name</label>
                <StyledInput
                  value={profile.full_name}
                  onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </InputGroup>

              <InputGroup>
                <label>Phone Number</label>
                <StyledInput
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </InputGroup>

              <InputGroup>
                <label>Residential Address</label>
                <StyledInput
                  value={profile.address}
                  onChange={e => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Enter address"
                />
              </InputGroup>

              <SaveButton type="submit">Save Changes</SaveButton>
            </form>
          </ProfileCard>

          {/* BOTTOM: USER'S POST FEED */}
          <MyPostsSection>
            <h3 style={{ marginBottom: '25px', textAlign: 'center', color: '#333' }}>
              My Activity Feed ({userPosts.length})
            </h3>

            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <PostCard key={post.id}>
                  <PostMeta>
                    <span className="type-badge">{post.post_type}</span>
                    <span className="date">{new Date(post.created_at).toLocaleDateString()}</span>
                  </PostMeta>

                  <Link to={`/user/post/${post.id}`} style={{ textDecoration: 'none' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{post.title}</h4>
                  </Link>

                  <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                    {post.description.substring(0, 120)}...
                  </p>
                </PostCard>
              ))
            ) : (
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.5)', padding: '40px', borderRadius: '20px' }}>
                <p style={{ color: '#888' }}>You haven't shared any posts yet.</p>
              </div>
            )}
          </MyPostsSection>

        </ProfileContainer>
      </PageWrapper>
      <Footer />
    </>
  );
};

export default Profile;