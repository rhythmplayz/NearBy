import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import UserMarketplaceNav from '../../../components/UserMarketplaceNav';
import Footer from '../../../components/Footer';

const API = 'http://127.0.0.1:8000/api';
const fadeIn = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;

const Wrap = styled.div`background:linear-gradient(135deg,#f8fffe,#e8f8f5,#f2f2f2);min-height:100vh;font-family:'Poppins',sans-serif;`;
const Box = styled.div`max-width:1100px;margin:0 auto;padding:30px 20px;animation:${fadeIn} .5s ease;`;
const Back = styled.button`background:none;border:none;color:#3CCFC4;font-weight:600;cursor:pointer;font-size:.95rem;margin-bottom:20px;font-family:inherit;&:hover{text-decoration:underline}`;
const Card = styled.div`background:white;border-radius:24px;padding:0;box-shadow:0 8px 32px rgba(0,0,0,.06);overflow:hidden;display:flex;@media(max-width:768px){flex-direction:column}`;
const ImgSection = styled.div`flex:1;min-height:400px;background:#f0faf8;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;img{width:100%;height:100%;object-fit:cover}`;
const InfoSection = styled.div`flex:1;padding:36px;`;
const Cat = styled.span`font-size:.8rem;color:#3CCFC4;font-weight:600;text-transform:uppercase;letter-spacing:.5px;`;
const Name = styled.h1`font-size:1.6rem;color:#1a1a2e;margin:8px 0;`;
const Seller = styled.p`color:#999;font-size:.85rem;margin:0 0 16px;`;
const Pr = styled.div`font-size:1.8rem;font-weight:700;color:#1a1a2e;margin:16px 0;`;
const Desc = styled.p`color:#666;line-height:1.7;margin:16px 0 24px;`;
const Badge = styled.span`display:inline-block;padding:6px 16px;border-radius:20px;font-size:.8rem;font-weight:600;background:${p=>p.$ok?'rgba(60,207,196,.12)':'rgba(255,99,99,.12)'};color:${p=>p.$ok?'#2ba89e':'#c44'};`;
const Stars = styled.div`display:flex;align-items:center;gap:8px;margin:12px 0;font-size:1.1rem;color:#f5a623;`;

// Review section
const RevSection = styled.div`max-width:1100px;margin:30px auto;padding:0 20px;animation:${fadeIn} .5s ease .2s both;`;
const RevCard = styled.div`background:white;border-radius:20px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,.04);margin-bottom:16px;border:1px solid rgba(0,0,0,.04);`;
const RevHeader = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;`;
const RevUser = styled.span`font-weight:600;color:#333;`;
const RevDate = styled.span`font-size:.8rem;color:#aaa;`;
const RevStars = styled.span`color:#f5a623;font-size:.95rem;`;
const RevComment = styled.p`color:#666;margin:8px 0 0;line-height:1.6;`;
const VerifiedBadge = styled.span`font-size:.75rem;color:#3CCFC4;font-weight:600;margin-left:8px;`;
const FormCard = styled.div`background:white;border-radius:20px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,.04);margin-bottom:30px;`;
const Input = styled.input`width:100%;padding:12px 16px;border:2px solid #e8f0ef;border-radius:12px;font-family:inherit;font-size:.9rem;margin-bottom:12px;outline:none;&:focus{border-color:#3CCFC4}`;
const Textarea = styled.textarea`width:100%;padding:12px 16px;border:2px solid #e8f0ef;border-radius:12px;font-family:inherit;font-size:.9rem;margin-bottom:12px;outline:none;resize:vertical;min-height:80px;&:focus{border-color:#3CCFC4}`;
const Btn = styled.button`background:#3CCFC4;color:white;border:none;padding:12px 28px;border-radius:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;&:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(60,207,196,.3)}&:disabled{opacity:.5;cursor:not-allowed}`;
const StarPicker = styled.div`display:flex;gap:4px;margin-bottom:12px;span{font-size:1.6rem;cursor:pointer;transition:transform .15s;&:hover{transform:scale(1.2)}}`;
const SmallBtn = styled.button`background:none;border:1px solid #ddd;padding:4px 12px;border-radius:8px;font-size:.78rem;cursor:pointer;color:#888;margin-left:8px;&:hover{border-color:#3CCFC4;color:#3CCFC4}`;
const ErrMsg = styled.div`background:#fff0f0;color:#c00;padding:12px;border-radius:10px;margin-bottom:12px;font-size:.9rem;`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [revPage, setRevPage] = useState(1);
  const [revTotal, setRevTotal] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [revError, setRevError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/products/browse/${id}/`, { headers }).then(r => setProduct(r.data)).catch(() => setProduct(null)).finally(() => setLoading(false));
    fetchReviews();
    axios.get(`${API}/reviews/product-stats/${id}/`).then(r => setReviewStats(r.data)).catch(() => {});
  }, [id]);

  const fetchReviews = (page = 1) => {
    axios.get(`${API}/reviews/?product=${id}&page=${page}`, { headers }).then(r => {
      setReviews(r.data.results || r.data || []);
      setRevTotal(r.data.count || 0);
    }).catch(() => {});
  };

  const submitReview = async () => {
    if (!newRating) { setRevError('Please select a rating'); return; }
    setSubmitting(true); setRevError('');
    try {
      if (editingId) {
        await axios.patch(`${API}/reviews/${editingId}/`, { rating: newRating, title: newTitle, comment: newComment }, { headers });
      } else {
        await axios.post(`${API}/reviews/`, { product: parseInt(id), rating: newRating, title: newTitle, comment: newComment }, { headers });
      }
      setNewRating(0); setNewTitle(''); setNewComment(''); setEditingId(null);
      fetchReviews();
      axios.get(`${API}/reviews/product-stats/${id}/`).then(r => setReviewStats(r.data));
    } catch (e) {
      setRevError(e.response?.data?.detail || e.response?.data?.non_field_errors?.[0] || JSON.stringify(e.response?.data) || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  const deleteReview = async (rid) => {
    if (!window.confirm('Delete this review?')) return;
    try { await axios.delete(`${API}/reviews/${rid}/`, { headers }); fetchReviews(); } catch {}
  };

  const startEdit = (rev) => { setEditingId(rev.id); setNewRating(rev.rating); setNewTitle(rev.title); setNewComment(rev.comment); };

  if (loading) return <><UserMarketplaceNav /><Wrap><Box><p>Loading...</p></Box></Wrap><Footer /></>;
  if (!product) return <><UserMarketplaceNav /><Wrap><Box><p>Product not found.</p><Back onClick={() => navigate(-1)}>← Go Back</Back></Box></Wrap><Footer /></>;

  return (
    <>
      <UserMarketplaceNav />
      <Wrap>
        <Box>
          <Back onClick={() => navigate(-1)}>← Back to Products</Back>
          <Card>
            <ImgSection>
              {product.images?.length > 0 ? <img src={product.images[0].url} alt={product.name} /> : <div style={{fontSize:'4rem',color:'#c8e6e3'}}>📦</div>}
            </ImgSection>
            <InfoSection>
              <Cat>{product.category}</Cat>
              <Name>{product.name}</Name>
              <Seller>by {product.seller_name}</Seller>
              <Stars>
                <span>{reviewStats ? '★'.repeat(Math.round(reviewStats.average_rating)) + '☆'.repeat(5 - Math.round(reviewStats.average_rating)) : '☆☆☆☆☆'}</span>
                <span style={{color:'#888',fontSize:'.85rem'}}>{reviewStats?.average_rating || 0} ({reviewStats?.total_reviews || 0} reviews)</span>
              </Stars>
              <Pr>৳{parseFloat(product.price).toLocaleString()}</Pr>
              <Badge $ok={product.is_in_stock}>{product.is_in_stock ? `${product.stock} In Stock` : 'Out of Stock'}</Badge>
              <Desc>{product.description}</Desc>
            </InfoSection>
          </Card>
        </Box>

        {/* Reviews */}
        <RevSection>
          <h2 style={{marginBottom:20,color:'#1a1a2e'}}>Customer Reviews</h2>

          {/* Review Stats */}
          {reviewStats && reviewStats.total_reviews > 0 && (
            <RevCard>
              <div style={{display:'flex',alignItems:'center',gap:24,flexWrap:'wrap'}}>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:'2.5rem',fontWeight:700,color:'#f5a623'}}>{reviewStats.average_rating}</div>
                  <div style={{color:'#f5a623'}}>{'★'.repeat(Math.round(reviewStats.average_rating))}</div>
                  <div style={{color:'#999',fontSize:'.85rem'}}>{reviewStats.total_reviews} reviews</div>
                </div>
                <div style={{flex:1,minWidth:200}}>
                  {[5,4,3,2,1].map(s => (
                    <div key={s} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                      <span style={{width:20,fontSize:'.85rem'}}>{s}★</span>
                      <div style={{flex:1,height:8,background:'#f0f0f0',borderRadius:4,overflow:'hidden'}}>
                        <div style={{width:`${(reviewStats[['','one','two','three','four','five'][s]+'_star']/reviewStats.total_reviews)*100}%`,height:'100%',background:'#f5a623',borderRadius:4,transition:'width .5s ease'}}/>
                      </div>
                      <span style={{width:24,fontSize:'.8rem',color:'#999'}}>{reviewStats[['','one','two','three','four','five'][s]+'_star']}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevCard>
          )}

          {/* Write Review Form */}
          {token && (
            <FormCard>
              <h3 style={{marginBottom:16}}>{editingId ? 'Edit Review' : 'Write a Review'}</h3>
              {revError && <ErrMsg>{revError}</ErrMsg>}
              <StarPicker>
                {[1,2,3,4,5].map(s => (
                  <span key={s} onClick={() => setNewRating(s)} style={{color: s <= newRating ? '#f5a623' : '#ddd'}} role="button" aria-label={`${s} star`}>{s <= newRating ? '★' : '☆'}</span>
                ))}
              </StarPicker>
              <Input placeholder="Review title (optional)" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              <Textarea placeholder="Share your experience..." value={newComment} onChange={e => setNewComment(e.target.value)} />
              <div style={{display:'flex',gap:8}}>
                <Btn onClick={submitReview} disabled={submitting}>{submitting ? 'Submitting...' : editingId ? 'Update Review' : 'Submit Review'}</Btn>
                {editingId && <Btn style={{background:'#999'}} onClick={() => {setEditingId(null);setNewRating(0);setNewTitle('');setNewComment('')}}>Cancel</Btn>}
              </div>
            </FormCard>
          )}

          {/* Review List */}
          {reviews.length === 0 && <RevCard><p style={{color:'#888',textAlign:'center'}}>No reviews yet. Be the first to review!</p></RevCard>}
          {reviews.map(rev => (
            <RevCard key={rev.id}>
              <RevHeader>
                <div>
                  <RevUser>{rev.user_full_name || rev.username}</RevUser>
                  {rev.is_verified_purchase && <VerifiedBadge>✓ Verified Purchase</VerifiedBadge>}
                </div>
                <RevDate>{new Date(rev.created_at).toLocaleDateString()}</RevDate>
              </RevHeader>
              <RevStars>{'★'.repeat(rev.rating)}{'☆'.repeat(5-rev.rating)}</RevStars>
              {rev.title && <div style={{fontWeight:600,margin:'6px 0'}}>{rev.title}</div>}
              <RevComment>{rev.comment}</RevComment>
              {token && (
                <div style={{marginTop:8}}>
                  <SmallBtn onClick={() => startEdit(rev)}>Edit</SmallBtn>
                  <SmallBtn onClick={() => deleteReview(rev.id)} style={{color:'#c44'}}>Delete</SmallBtn>
                </div>
              )}
            </RevCard>
          ))}
        </RevSection>
      </Wrap>
      <Footer />
    </>
  );
};

export default ProductDetail;
