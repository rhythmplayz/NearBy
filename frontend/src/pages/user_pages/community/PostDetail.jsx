import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import UserCommunityNav from '../../../components/UserCommunityNav';
import Footer from '../../../components/Footer';

const DetailWrapper = styled.div`
  background: linear-gradient(135deg, #f2f2f2 0%, #8DF2E8 100%);
  min-height: 100vh;
  padding: 40px 20px;
  font-family: 'Poppins', sans-serif;
`;

const DetailCard = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
`;

const PostImage = styled.img`
  width: 100%;
  max-height: 500px;
  object-fit: cover;
`;

const PostContent = styled.div`
  padding: 40px;
  h1 { font-size: 2.5rem; margin-bottom: 20px; color: #333; }
  p { line-height: 1.8; color: #444; font-size: 1.1rem; white-space: pre-wrap; }
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  justify-content: space-between;
  
  .author-flex { display: flex; align-items: center; gap: 15px; }
  img { width: 50px; height: 50px; border-radius: 50%; }
  .author-name { font-weight: 700; color: #333; }
  .post-date { color: #888; font-size: 0.9rem; }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  font-family: 'Poppins', sans-serif;
  background: ${props => props.bg || '#eee'};
  color: ${props => props.color || '#333'};

  &:hover { opacity: 0.8; transform: translateY(-1px); }
`;

const BackButton = styled.button`
  background: white;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: 0.3s;
  &:hover { transform: translateX(-5px); background: #3CCFC4; color: white; }
`;

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/user/login');
                    return;
                }

                // Fetch Post and User Profile simultaneously
                const [postRes, userRes] = await Promise.all([
                    axios.get(`http://127.0.0.1:8000/api/posts/${id}/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://127.0.0.1:8000/api/users/profile/', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setPost(postRes.data);
                setCurrentUser(userRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:8000/api/posts/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Navigates back to the actual home route defined in App.js
            navigate('/user/home');
        } catch (err) {
            alert("Failed to delete post");
        }
    };

    const handleEdit = () => {
        // Navigates to the actual home route and passes the post data to the form
        navigate('/user/home', { state: { editPost: post } });
    };

    if (loading) return <DetailWrapper><p>Loading post...</p></DetailWrapper>;
    if (!post) return <DetailWrapper><p>Post not found.</p></DetailWrapper>;

    const isAuthor = currentUser && currentUser.username === post.author_username;

    return (
        <>
            <UserCommunityNav />
            <DetailWrapper>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <BackButton onClick={() => navigate(-1)}>← Back to Feed</BackButton>
                </div>
                <DetailCard>
                    {post.cover_pic && <PostImage src={post.cover_pic} alt="cover" />}
                    <PostContent>
                        <MetaInfo>
                            <div className="author-flex">
                                <img src={post.author_profile_pic || 'https://via.placeholder.com/50'} alt="author" />
                                <div>
                                    <div className="author-name">{post.author_full_name} (@{post.author_username})</div>
                                    <div className="post-date">Posted on {new Date(post.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {isAuthor && (
                                <ActionButtons>
                                    <Button onClick={handleEdit} bg="#3CCFC4" color="white">Edit</Button>
                                    <Button onClick={handleDelete} bg="#ff4d4d" color="white">Delete</Button>
                                </ActionButtons>
                            )}
                        </MetaInfo>

                        <div style={{ marginBottom: '15px' }}>
                            <span style={{
                                background: '#e0f7f6',
                                color: '#3CCFC4',
                                padding: '5px 15px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}>
                                {post.post_type}
                            </span>
                        </div>

                        <h1>{post.title}</h1>
                        <p>{post.description}</p>
                    </PostContent>
                </DetailCard>
            </DetailWrapper>
            <Footer />
        </>
    );
};

export default PostDetail;