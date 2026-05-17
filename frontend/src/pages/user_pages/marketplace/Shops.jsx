import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserMarketplaceNav from '../../../components/UserMarketplaceNav';
import Footer from '../../../components/Footer';

const API = 'http://localhost:8000';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const PageWrapper = styled.div`
  background: linear-gradient(160deg, #f0faf8 0%, #e6f9f5 30%, #f2f2f2 70%, #e8fcf9 100%);
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
`;

const ContentContainer = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 40px 24px 80px;
`;

const PageHeader = styled.div`
  margin-bottom: 36px;
  animation: ${fadeIn} 0.6s ease;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #0D0D0D 0%, #1F8F87 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1rem;
  margin: 0;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  animation: ${fadeIn} 0.7s ease;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 260px;
  padding: 14px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  font-size: 0.95rem;
  font-family: 'Poppins', sans-serif;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #3CCFC4;
    box-shadow: 0 0 0 4px rgba(60, 207, 196, 0.1);
  }
  &::placeholder { color: #aaa; }
`;

const CategoryPill = styled.button`
  padding: 10px 22px;
  border-radius: 50px;
  border: 2px solid ${p => p.$active ? '#3CCFC4' : '#e0e0e0'};
  background: ${p => p.$active ? 'linear-gradient(135deg, #3CCFC4, #1F8F87)' : 'rgba(255,255,255,0.9)'};
  color: ${p => p.$active ? '#fff' : '#555'};
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  &:hover {
    border-color: #3CCFC4;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(60, 207, 196, 0.2);
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeIn} 0.5s ease forwards;
  animation-delay: ${p => p.$delay || '0s'};
  opacity: 0;
  cursor: pointer;
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(31, 143, 135, 0.12);
    border-color: rgba(60, 207, 196, 0.3);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 200px;
  background: ${p => p.$bg ? `url(${p.$bg}) center/cover no-repeat` : 'linear-gradient(135deg, #e8fcf9, #d5f5f0)'};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NoImageIcon = styled.span`
  font-size: 3.5rem;
  opacity: 0.3;
`;

const StockBadge = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  ${p => p.$inStock ? css`
    background: rgba(16, 185, 129, 0.15);
    color: #059669;
    border: 1px solid rgba(16, 185, 129, 0.3);
  ` : css`
    background: rgba(239, 68, 68, 0.15);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.3);
  `}
`;

const SellerBadge = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  background: rgba(0,0,0,0.6);
  color: #fff;
  backdrop-filter: blur(8px);
`;

const CardBody = styled.div`
  padding: 20px;
`;

const ProductName = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductDesc = styled.p`
  font-size: 0.82rem;
  color: #888;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Price = styled.span`
  font-size: 1.25rem;
  font-weight: 800;
  color: #1F8F87;
`;

const AddButton = styled.button`
  padding: 10px 20px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #3CCFC4, #1F8F87);
  color: #fff;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(60, 207, 196, 0.35);
  }
  &:active { transform: scale(0.96); }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CartFloating = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #3CCFC4, #1F8F87);
  color: #fff;
  font-size: 1.6rem;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(31, 143, 135, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 999;
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 40px rgba(31, 143, 135, 0.5);
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #F2E205;
  color: #0D0D0D;
  font-size: 0.72rem;
  font-weight: 800;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 0.5s ease;
`;

const Toast = styled.div`
  position: fixed;
  bottom: 110px;
  right: 30px;
  background: linear-gradient(135deg, #1F8F87, #3CCFC4);
  color: #fff;
  padding: 14px 24px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 8px 30px rgba(31, 143, 135, 0.3);
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  animation: ${fadeIn} 0.6s ease;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
`;

const Skeleton = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${p => p.$radius || '12px'};
  height: ${p => p.$h || '20px'};
  width: ${p => p.$w || '100%'};
`;

const CategoryRow = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
`;

const Shops = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [cart, setCart] = useState(() => {
        try { return JSON.parse(localStorage.getItem('nearby_cart') || '[]'); }
        catch { return []; }
    });
    const [toast, setToast] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (category) params.category = category;
            const { data } = await axios.get(`${API}/api/products/browse/`, { headers, params });
            setProducts(data.results || []);
            // Extract unique categories
            const cats = [...new Set((data.results || []).map(p => p.category).filter(Boolean))];
            if (cats.length > 0 && categories.length === 0) setCategories(cats);
        } catch (err) {
            console.error('Failed to load products', err);
            setProducts([]);
        }
        setLoading(false);
    }, [search, category]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    useEffect(() => {
        localStorage.setItem('nearby_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
                        : item
                );
            }
            return [...prev, {
                product_id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: product.images?.[0]?.url || null,
                stock: product.stock,
                seller_name: product.seller_name,
                quantity: 1,
            }];
        });
        setToast(`✓ ${product.name} added to cart`);
        setTimeout(() => setToast(''), 2500);
    };

    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const getProductImage = (p) => {
        if (p.images && p.images.length > 0) return p.images[0].url;
        return null;
    };

    return (
        <>
            <UserMarketplaceNav />
            <PageWrapper>
                <ContentContainer>
                    <PageHeader>
                        <Title>🛍️ Marketplace</Title>
                        <Subtitle>Discover products from verified local sellers near you</Subtitle>
                    </PageHeader>

                    <SearchBar>
                        <SearchInput
                            id="shop-search-input"
                            placeholder="Search products, sellers..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </SearchBar>

                    {categories.length > 0 && (
                        <CategoryRow style={{ marginBottom: '28px' }}>
                            <CategoryPill
                                $active={category === ''}
                                onClick={() => setCategory('')}
                            >
                                All
                            </CategoryPill>
                            {categories.map(cat => (
                                <CategoryPill
                                    key={cat}
                                    $active={category === cat}
                                    onClick={() => setCategory(category === cat ? '' : cat)}
                                >
                                    {cat}
                                </CategoryPill>
                            ))}
                        </CategoryRow>
                    )}

                    {loading ? (
                        <ProductGrid>
                            {[1,2,3,4,5,6].map(i => (
                                <ProductCard key={i} style={{ opacity: 1 }}>
                                    <Skeleton $h="200px" $radius="0" />
                                    <CardBody>
                                        <Skeleton $h="18px" $w="70%" style={{ marginBottom: 10 }} />
                                        <Skeleton $h="14px" $w="100%" style={{ marginBottom: 6 }} />
                                        <Skeleton $h="14px" $w="60%" style={{ marginBottom: 16 }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Skeleton $h="28px" $w="80px" $radius="8px" />
                                            <Skeleton $h="40px" $w="100px" $radius="14px" />
                                        </div>
                                    </CardBody>
                                </ProductCard>
                            ))}
                        </ProductGrid>
                    ) : products.length === 0 ? (
                        <EmptyState>
                            <EmptyIcon>🏪</EmptyIcon>
                            <h2 style={{ color: '#333', margin: '0 0 8px 0' }}>No products found</h2>
                            <p style={{ color: '#888' }}>Try adjusting your search or check back later</p>
                        </EmptyState>
                    ) : (
                        <ProductGrid>
                            {products.map((product, index) => {
                                const img = getProductImage(product);
                                const inCart = cart.find(c => c.product_id === product.id);
                                return (
                                    <ProductCard
                                        key={product.id}
                                        $delay={`${index * 0.06}s`}
                                    >
                                        <ProductImage $bg={img}>
                                            {!img && <NoImageIcon>📦</NoImageIcon>}
                                            <StockBadge $inStock={product.is_in_stock}>
                                                {product.is_in_stock ? `${product.stock} in stock` : 'Out of stock'}
                                            </StockBadge>
                                            <SellerBadge>{product.seller_name}</SellerBadge>
                                        </ProductImage>
                                        <CardBody>
                                            <ProductName>{product.name}</ProductName>
                                            <ProductDesc>{product.description}</ProductDesc>
                                            <CardFooter>
                                                <Price>৳{parseFloat(product.price).toFixed(2)}</Price>
                                                <AddButton
                                                    id={`add-to-cart-${product.id}`}
                                                    disabled={!product.is_in_stock}
                                                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                >
                                                    {inCart ? `In Cart (${inCart.quantity})` : '+ Add'}
                                                </AddButton>
                                            </CardFooter>
                                        </CardBody>
                                    </ProductCard>
                                );
                            })}
                        </ProductGrid>
                    )}
                </ContentContainer>

                {totalCartItems > 0 && (
                    <CartFloating id="floating-cart-btn" onClick={() => navigate('/user/cart')}>
                        🛒
                        <CartBadge>{totalCartItems}</CartBadge>
                    </CartFloating>
                )}

                {toast && <Toast>{toast}</Toast>}
            </PageWrapper>
            <Footer />
        </>
    );
};

export default Shops;