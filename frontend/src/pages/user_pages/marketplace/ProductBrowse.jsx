import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserMarketplaceNav from '../../../components/UserMarketplaceNav';
import Footer from '../../../components/Footer';

const API_BASE = 'http://127.0.0.1:8000/api';

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// --- Styled Components ---
const PageWrapper = styled.div`
  background: linear-gradient(135deg, #f8fffe 0%, #e8f8f5 50%, #f2f2f2 100%);
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
`;

const SearchSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 28px 32px;
  margin-bottom: 28px;
  box-shadow: 0 8px 32px rgba(60, 207, 196, 0.08);
  border: 1px solid rgba(60, 207, 196, 0.12);
  animation: ${fadeIn} 0.5s ease;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f7faf9;
  border-radius: 16px;
  padding: 4px 6px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  &:focus-within {
    border-color: #3CCFC4;
    background: white;
    box-shadow: 0 0 0 4px rgba(60, 207, 196, 0.1);
  }
`;

const SearchIcon = styled.span`
  font-size: 1.3rem;
  padding: 0 12px;
  color: #999;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  padding: 14px 8px;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  color: #333;
  outline: none;
  &::placeholder { color: #aaa; }
`;

const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 10px 16px;
  border: 2px solid #e8f0ef;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  color: #444;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  &:focus { border-color: #3CCFC4; }
  &:hover { border-color: #b8e8e3; }
`;

const FilterInput = styled.input`
  padding: 10px 16px;
  border: 2px solid #e8f0ef;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  width: 110px;
  color: #444;
  background: white;
  outline: none;
  transition: all 0.2s ease;
  &:focus { border-color: #3CCFC4; }
  &::placeholder { color: #bbb; }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 4px;
  margin-left: auto;
  background: #f0f5f4;
  border-radius: 12px;
  padding: 4px;
`;

const ViewBtn = styled.button`
  padding: 8px 14px;
  border: none;
  border-radius: 10px;
  background: ${p => p.$active ? '#3CCFC4' : 'transparent'};
  color: ${p => p.$active ? 'white' : '#888'};
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: ${p => p.$active ? '#3CCFC4' : '#e0edeb'}; }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  animation: ${fadeIn} 0.5s ease 0.1s both;
`;

const ResultCount = styled.span`
  color: #777;
  font-size: 0.95rem;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${p => p.$view === 'list' ? '100%' : '280px'}, 1fr));
  gap: 20px;
  animation: ${fadeIn} 0.5s ease 0.2s both;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
  display: ${p => p.$view === 'list' ? 'flex' : 'block'};
  animation: ${fadeIn} 0.4s ease both;
  animation-delay: ${p => p.$index * 0.05}s;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(60, 207, 196, 0.15);
    border-color: rgba(60, 207, 196, 0.2);
  }
`;

const ProductImage = styled.div`
  width: ${p => p.$view === 'list' ? '200px' : '100%'};
  height: ${p => p.$view === 'list' ? '160px' : '200px'};
  min-width: ${p => p.$view === 'list' ? '200px' : 'auto'};
  background: linear-gradient(135deg, #e8f8f5 0%, #f0faf8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  ${ProductCard}:hover & img {
    transform: scale(1.08);
  }
`;

const PlaceholderIcon = styled.div`
  font-size: 3rem;
  color: #c8e6e3;
`;

const StockBadge = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${p => p.$inStock ? 'rgba(60, 207, 196, 0.9)' : 'rgba(255, 99, 99, 0.9)'};
  color: white;
  backdrop-filter: blur(4px);
`;

const ProductInfo = styled.div`
  padding: 18px 20px;
  flex: 1;
`;

const ProductName = styled.h3`
  font-size: 1.05rem;
  font-weight: 600;
  color: #222;
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductCategory = styled.span`
  font-size: 0.8rem;
  color: #3CCFC4;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const Price = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
`;

const RatingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: #f5a623;
  font-weight: 600;
`;

const SellerName = styled.div`
  font-size: 0.8rem;
  color: #999;
  margin-top: 6px;
`;

const StockText = styled.div`
  font-size: 0.78rem;
  color: ${p => p.$inStock ? '#3CCFC4' : '#ff6363'};
  margin-top: 4px;
  font-weight: 500;
`;

// Loading skeleton
const SkeletonCard = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
`;

const SkeletonImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const SkeletonLine = styled.div`
  height: ${p => p.$h || '14px'};
  width: ${p => p.$w || '100%'};
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 8px;
  margin: ${p => p.$m || '8px 20px'};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
  animation: ${fadeIn} 0.5s ease 0.3s both;
`;

const PageBtn = styled.button`
  padding: 10px 18px;
  border: 2px solid ${p => p.$active ? '#3CCFC4' : '#e0e0e0'};
  border-radius: 12px;
  background: ${p => p.$active ? '#3CCFC4' : 'white'};
  color: ${p => p.$active ? 'white' : '#666'};
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover:not(:disabled) {
    border-color: #3CCFC4;
    color: ${p => p.$active ? 'white' : '#3CCFC4'};
  }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  animation: ${fadeIn} 0.5s ease;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
`;

const ErrorBanner = styled.div`
  background: #fff0f0;
  border: 1px solid #ffd0d0;
  color: #c00;
  padding: 16px 24px;
  border-radius: 14px;
  margin-bottom: 20px;
  text-align: center;
  animation: ${fadeIn} 0.3s ease;
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
`;

const FilterChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(60, 207, 196, 0.1);
  color: #2ba89e;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: rgba(60, 207, 196, 0.2); }
`;

// --- Helper ---
const renderStars = (rating) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  for (let i = 0; i < full; i++) stars.push('★');
  if (half) stars.push('½');
  while (stars.length < 5) stars.push('☆');
  return stars.join('');
};

// --- Component ---
const ProductBrowse = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [availability, setAvailability] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const searchTimeout = useRef(null);

  // Fetch categories
  useEffect(() => {
    axios.get(`${API_BASE}/products/categories/`)
      .then(res => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // Fetch products (debounced for search)
  const fetchProducts = useCallback((page = 1) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set('page', page);
    params.set('page_size', 12);
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sortBy) params.set('sort', sortBy);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (minRating) params.set('min_rating', minRating);
    if (availability) params.set('availability', availability);

    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    axios.get(`${API_BASE}/products/browse/?${params.toString()}`, { headers })
      .then(res => {
        setProducts(res.data.results || []);
        setTotalPages(res.data.total_pages || 1);
        setCurrentPage(res.data.current_page || 1);
        setTotalCount(res.data.count || 0);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load products. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [search, category, sortBy, minPrice, maxPrice, minRating, availability]);

  // Debounce search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchProducts(1);
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [fetchProducts]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setAvailability('');
  };

  const hasActiveFilters = search || category || minPrice || maxPrice || minRating || availability || sortBy !== 'newest';

  return (
    <>
      <UserMarketplaceNav />
      <PageWrapper>
        <Container>
          {/* Search & Filters */}
          <SearchSection>
            <SearchBar>
              <SearchIcon>🔍</SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search products, shops, categories..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search products"
                id="product-search"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '8px', color: '#999' }}
                  aria-label="Clear search"
                >✕</button>
              )}
            </SearchBar>

            <FiltersRow>
              <FilterSelect
                value={category}
                onChange={e => setCategory(e.target.value)}
                aria-label="Filter by category"
                id="filter-category"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} ({cat.product_count})
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="Sort by"
                id="sort-by"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </FilterSelect>

              <FilterInput
                type="number"
                placeholder="Min ৳"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                aria-label="Minimum price"
                id="min-price"
              />
              <FilterInput
                type="number"
                placeholder="Max ৳"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                aria-label="Maximum price"
                id="max-price"
              />

              <FilterSelect
                value={minRating}
                onChange={e => setMinRating(e.target.value)}
                aria-label="Minimum rating"
                id="filter-rating"
              >
                <option value="">Any Rating</option>
                <option value="4">4★ & Up</option>
                <option value="3">3★ & Up</option>
                <option value="2">2★ & Up</option>
                <option value="1">1★ & Up</option>
              </FilterSelect>

              <FilterSelect
                value={availability}
                onChange={e => setAvailability(e.target.value)}
                aria-label="Availability filter"
                id="filter-availability"
              >
                <option value="">All</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </FilterSelect>

              <ViewToggle>
                <ViewBtn $active={viewMode === 'grid'} onClick={() => setViewMode('grid')} aria-label="Grid view">▦</ViewBtn>
                <ViewBtn $active={viewMode === 'list'} onClick={() => setViewMode('list')} aria-label="List view">☰</ViewBtn>
              </ViewToggle>
            </FiltersRow>

            {hasActiveFilters && (
              <ActiveFilters>
                {search && <FilterChip onClick={() => setSearch('')}>Search: "{search}" ✕</FilterChip>}
                {category && <FilterChip onClick={() => setCategory('')}>{category} ✕</FilterChip>}
                {minPrice && <FilterChip onClick={() => setMinPrice('')}>Min: ৳{minPrice} ✕</FilterChip>}
                {maxPrice && <FilterChip onClick={() => setMaxPrice('')}>Max: ৳{maxPrice} ✕</FilterChip>}
                {minRating && <FilterChip onClick={() => setMinRating('')}>{minRating}★+ ✕</FilterChip>}
                {availability && <FilterChip onClick={() => setAvailability('')}>{availability === 'in_stock' ? 'In Stock' : 'Out of Stock'} ✕</FilterChip>}
                <FilterChip onClick={clearFilters} style={{ background: 'rgba(255,99,99,0.1)', color: '#c44' }}>Clear All ✕</FilterChip>
              </ActiveFilters>
            )}
          </SearchSection>

          {error && <ErrorBanner>{error}</ErrorBanner>}

          {/* Results Header */}
          <ResultsHeader>
            <ResultCount>
              {loading ? 'Loading...' : `${totalCount} product${totalCount !== 1 ? 's' : ''} found`}
            </ResultCount>
          </ResultsHeader>

          {/* Loading Skeleton */}
          {loading && (
            <ProductGrid $view={viewMode}>
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i}>
                  <SkeletonImage />
                  <SkeletonLine $w="70%" $m="16px 20px 0" />
                  <SkeletonLine $w="50%" />
                  <SkeletonLine $w="40%" $h="20px" $m="12px 20px 20px" />
                </SkeletonCard>
              ))}
            </ProductGrid>
          )}

          {/* Products */}
          {!loading && products.length > 0 && (
            <ProductGrid $view={viewMode}>
              {products.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  $view={viewMode}
                  $index={idx}
                  onClick={() => navigate(`/user/product/${product.id}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${product.name}`}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/user/product/${product.id}`)}
                >
                  <ProductImage $view={viewMode}>
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0].url} alt={product.name} loading="lazy" />
                    ) : (
                      <PlaceholderIcon>📦</PlaceholderIcon>
                    )}
                    <StockBadge $inStock={product.is_in_stock}>
                      {product.is_in_stock ? 'In Stock' : 'Out of Stock'}
                    </StockBadge>
                  </ProductImage>
                  <ProductInfo>
                    <ProductCategory>{product.category}</ProductCategory>
                    <ProductName>{product.name}</ProductName>
                    <SellerName>by {product.seller_name}</SellerName>
                    <PriceRow>
                      <Price>৳{parseFloat(product.price).toLocaleString()}</Price>
                      <RatingBadge>
                        ★ {product.average_rating > 0 ? product.average_rating : '—'}
                        <span style={{ color: '#bbb', fontWeight: 400, fontSize: '0.78rem' }}>
                          ({product.review_count})
                        </span>
                      </RatingBadge>
                    </PriceRow>
                    <StockText $inStock={product.is_in_stock}>
                      {product.is_in_stock ? `${product.stock} available` : 'Currently unavailable'}
                    </StockText>
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductGrid>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && !error && (
            <EmptyState>
              <EmptyIcon>🛍️</EmptyIcon>
              <h2 style={{ color: '#333', marginBottom: 8 }}>No products found</h2>
              <p style={{ color: '#888' }}>Try adjusting your filters or search terms</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  style={{
                    marginTop: 20, background: '#3CCFC4', color: 'white', border: 'none',
                    padding: '12px 32px', borderRadius: '50px', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.95rem'
                  }}
                >Clear All Filters</button>
              )}
            </EmptyState>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Pagination>
              <PageBtn
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >← Prev</PageBtn>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page;
                if (totalPages <= 7) {
                  page = i + 1;
                } else if (currentPage <= 4) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  page = totalPages - 6 + i;
                } else {
                  page = currentPage - 3 + i;
                }
                return (
                  <PageBtn
                    key={page}
                    $active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                  >{page}</PageBtn>
                );
              })}
              <PageBtn
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >Next →</PageBtn>
            </Pagination>
          )}
        </Container>
      </PageWrapper>
      <Footer />
    </>
  );
};

export default ProductBrowse;
