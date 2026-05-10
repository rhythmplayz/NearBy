import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import UserCommunityNav from '../../../components/UserCommunityNav';
import Footer from '../../../components/Footer';

const slideIn = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #f2f2f2 0%, #8DF2E8 100%);
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  padding-bottom: 50px;
`;

const ContentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const ActionCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  margin-bottom: 40px;
  animation: ${slideIn} 0.4s ease-out;
`;

const PostCard = styled(ActionCard)`
  margin-bottom: 25px;
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  border-radius: 15px;
  border: 1px solid #eee;
  margin-bottom: 15px;
  outline: none;
  &:focus { border-color: #3CCFC4; }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 15px;
  border-radius: 15px;
  border: 1px solid #eee;
  min-height: 100px;
  margin-bottom: 15px;
  font-family: inherit;
  outline: none;
  &:focus { border-color: #3CCFC4; }
`;

const Select = styled.select`
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #eee;
  margin-right: 10px;
`;

const Button = styled.button`
  background: #3CCFC4;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  &:hover { background: #1F8F87; transform: translateY(-2px); }
`;

const IconButton = styled.button`
  background: ${props => props.color || '#eee'};
  color: ${props => props.textColor || '#333'};
  border: none;
  padding: 8px 15px;
  border-radius: 10px;
  margin-left: 10px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  justify-content: space-between;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
  span { font-weight: 700; color: #333; }
`;

const Badge = styled.span`
  background: #e0f7f6;
  color: #3CCFC4;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
`;

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // Will be populated via API

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', post_type: 'general', cover_pic: null });
  const fileInputRef = useRef(null);

  useEffect(() => {
    // 1. Fetch posts and the current user's profile info simultaneously
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchPosts(), fetchUserProfile()]);
      setLoading(false);
    };

    initializeData();
  }, []);

  // NEW: Fetch user profile because it's not in localStorage
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Replace this URL with your actual "profile" or "me" endpoint
      const res = await axios.get('http://127.0.0.1:8000/api/users/profile/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Current User Loaded:", res.data);
      setCurrentUser(res.data); // Expecting an object with a 'username' field
    } catch (err) {
      console.error("Could not load user profile:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:8000/api/posts/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (err) {
      console.error("Fetch error details:", err.response);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('post_type', formData.post_type);
    if (formData.cover_pic instanceof File) data.append('cover_pic', formData.cover_pic);

    try {
      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/api/posts/${editingId}/`, data, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('http://127.0.0.1:8000/api/posts/', data, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }
      setFormData({ title: '', description: '', post_type: 'general', cover_pic: null });
      setEditingId(null);
      fetchPosts();
    } catch (err) {
      alert("Error saving post");
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      description: post.description,
      post_type: post.post_type,
      cover_pic: null
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/api/posts/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <>
      <UserCommunityNav />
      <PageWrapper>
        <ContentContainer>
          {/* CREATE / EDIT FORM */}
          <ActionCard>
            <h2 style={{ marginBottom: '20px' }}>{editingId ? 'Edit Post' : 'Share something...'}</h2>
            <form onSubmit={handleSubmit}>
              <Input
                placeholder="Post Title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <TextArea
                placeholder="What's on your mind?"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Select
                    value={formData.post_type}
                    onChange={e => setFormData({ ...formData, post_type: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="event">Event</option>
                    <option value="announcement">Announcement</option>
                  </Select>
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={e => setFormData({ ...formData, cover_pic: e.target.files[0] })}
                  />
                  <IconButton type="button" onClick={() => fileInputRef.current.click()}>
                    🖼️ {formData.cover_pic ? 'Image Selected' : 'Add Image'}
                  </IconButton>
                </div>
                <div>
                  {editingId && <IconButton type="button" onClick={() => { setEditingId(null); setFormData({ title: '', description: '', post_type: 'general', cover_pic: null }) }}>Cancel</IconButton>}
                  <Button type="submit">{editingId ? 'Update Post' : 'Post Now'}</Button>
                </div>
              </div>
            </form>
          </ActionCard>

          {/* FEED LIST */}
          {loading ? (
            <p>Loading feed...</p>
          ) : (
            posts.map(post => (
              <PostCard key={post.id}>
                <PostHeader>
                  <AuthorInfo>
                    <img src={post.author_profile_pic || 'https://via.placeholder.com/40'} alt="author" />
                    <div>
                      <span>{post.author_full_name}</span>
                      <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>@{post.author_username}</p>
                    </div>
                  </AuthorInfo>
                  <div>
                    <Badge>{post.post_type}</Badge>

                    {/* FIXED LOGIC: Compare against fetched currentUser */}
                    {currentUser && currentUser.username === post.author_username && (
                      <>
                        <IconButton onClick={() => handleEdit(post)}>Edit</IconButton>
                        <IconButton
                          color="#ff4d4d"
                          textColor="white"
                          onClick={() => handleDelete(post.id)}
                        >
                          Delete
                        </IconButton>
                      </>
                    )}
                  </div>
                </PostHeader>

                {/* ... (rest of the post display logic) ... */}
                <h3 style={{ margin: '10px 0' }}>{post.title}</h3>
                <p style={{ color: '#444', lineHeight: '1.6' }}>{post.description}</p>
                {post.cover_pic && <img src={post.cover_pic} alt="cover" style={{ width: '100%', borderRadius: '20px', marginTop: '15px' }} />}
              </PostCard>
            ))
          )}
        </ContentContainer>
      </PageWrapper>
      <Footer />
    </>
  );
};

export default Home;