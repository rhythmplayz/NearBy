import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SellerNav from '../../components/SellerNav';
import Footer from '../../components/Footer';

const slideIn = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Toast = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 14px 22px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  z-index: 2000;
  animation: ${slideIn} 0.25s ease-out;
  background-color: ${props => props.type === 'success' ? '#3CCFC4' : '#ff4d4d'};
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f4f7f7 0%, #dff7f3 100%);
  font-family: 'Poppins', sans-serif;
`;

const Shell = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 60px;
`;

const Hero = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.4rem;
  color: #0D0D0D;
`;

const Subtitle = styled.p`
  margin: 8px 0 0;
  color: #5d6b6b;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
`;

const Form = styled.form`
  display: grid;
  gap: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #e6ecec;
  background: #f8faf9;
  outline: none;
  font-family: inherit;

  &:focus { border-color: #3CCFC4; background: white; }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  resize: vertical;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #e6ecec;
  background: #f8faf9;
  outline: none;
  font-family: inherit;

  &:focus { border-color: #3CCFC4; background: white; }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const ActionButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  background: ${props => props.variant === 'ghost' ? '#edf3f3' : props.variant === 'danger' ? '#ff4d4d' : '#3CCFC4'};
  color: ${props => props.variant === 'ghost' ? '#0D0D0D' : 'white'};
`;

const ProductGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const ProductCard = styled.div`
  border: 1px solid #eef2f2;
  border-radius: 22px;
  padding: 18px;
  background: white;
`;

const ProductTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  background: ${props => props.$tone === 'stock' ? '#eafaf7' : props.$tone === 'out' ? '#fff1f1' : '#eef2ff'};
  color: ${props => props.$tone === 'stock' ? '#12806a' : props.$tone === 'out' ? '#b42318' : '#3346a3'};
`;

const ThumbRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
`;

const Thumb = styled.img`
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #edf0f0;
`;

const Pager = styled.div`
  display: flex;
  gap: 10px;
  justify-content: space-between;
  margin-top: 18px;
  flex-wrap: wrap;
`;

const Helper = styled.p`
  margin: 0;
  color: #6f7f7f;
  font-size: 0.92rem;
`;

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category_name: '',
  stock: '',
};

const SellerProducts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({ count: 0, next_page: null, previous_page: null });
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [form, setForm] = useState(emptyForm);

  const token = useMemo(() => localStorage.getItem('token'), []);

  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      setNotification({ show: false, message: '', type });
    }, 3000);
  };

  const loadProducts = async (targetPage = page) => {
    if (!token) {
      navigate('/seller/login');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/products/seller/?page=${targetPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.results || []);
      setPageInfo({
        count: response.data.count || 0,
        next_page: response.data.next_page,
        previous_page: response.data.previous_page,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/seller/login');
        return;
      }
      showToast(error.response?.data?.error || 'Could not load products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedFiles([]);
  };

  const beginEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category_name: product.category || '',
      stock: product.stock ?? 0,
    });
    setSelectedFiles([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('description', form.description);
    payload.append('price', form.price);
    payload.append('category_name', form.category_name);
    payload.append('stock', form.stock);
    selectedFiles.forEach((file) => payload.append('image_files', file));

    try {
      const endpoint = editingId
        ? `http://127.0.0.1:8000/api/products/${editingId}/`
        : 'http://127.0.0.1:8000/api/products/seller/';
      const method = editingId ? 'patch' : 'post';

      const response = await axios({
        method,
        url: endpoint,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast(response.data.message || 'Saved successfully.', 'success');
      resetForm();
      await loadProducts(page);
    } catch (error) {
      const firstError = error.response?.data && Object.values(error.response.data)[0];
      const message = Array.isArray(firstError) ? firstError[0] : firstError || 'Save failed.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/products/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast(response.data.message || 'Product deleted.', 'success');
      if (editingId === id) resetForm();
      await loadProducts(page);
    } catch (error) {
      showToast(error.response?.data?.error || 'Delete failed.', 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(pageInfo.count / 10));

  return (
    <>
      {notification.show && <Toast type={notification.type}>{notification.message}</Toast>}
      <SellerNav />
      <Page>
        <Shell>
          <Hero>
            <div>
              <Title>Product Management</Title>
              <Subtitle>Create, update, and organize your storefront inventory.</Subtitle>
            </div>
            <Helper>{pageInfo.count} product{pageInfo.count === 1 ? '' : 's'} total</Helper>
          </Hero>

          <Layout>
            <Panel>
              <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Product' : 'New Product'}</h2>
              <Form onSubmit={handleSubmit}>
                <Input
                  placeholder="Product name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
                <Textarea
                  placeholder="Product description"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  required
                />
                <Input
                  placeholder="Category"
                  value={form.category_name}
                  onChange={(event) => setForm({ ...form, category_name: event.target.value })}
                  required
                />
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Stock quantity"
                  value={form.stock}
                  onChange={(event) => setForm({ ...form, stock: event.target.value })}
                  required
                />
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Price"
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  required
                />
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
                />
                <Helper>
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} image${selectedFiles.length === 1 ? '' : 's'} selected`
                    : 'Leave images empty when editing to keep the current set.'}
                </Helper>
                <ButtonRow>
                  <ActionButton type="submit" disabled={saving}>
                    {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                  </ActionButton>
                  {editingId && (
                    <ActionButton type="button" variant="ghost" onClick={resetForm}>
                      Cancel Edit
                    </ActionButton>
                  )}
                </ButtonRow>
              </Form>
            </Panel>

            <Panel>
              <h2 style={{ marginTop: 0 }}>Your Products</h2>
              {loading ? (
                <Helper>Loading products...</Helper>
              ) : products.length === 0 ? (
                <Helper>No products yet. Add your first listing on the left.</Helper>
              ) : (
                <ProductGrid>
                  {products.map((product) => (
                    <ProductCard key={product.id}>
                      <ProductTop>
                        <div>
                          <h3 style={{ margin: '0 0 6px' }}>{product.name}</h3>
                          <Helper>{product.category}</Helper>
                        </div>
                        <Badge $tone={product.stock > 0 ? 'stock' : 'out'}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </ProductTop>

                      <p style={{ color: '#546161', lineHeight: 1.6 }}>{product.description}</p>
                      <Helper>Price: ${Number(product.price).toFixed(2)} · Stock: {product.stock}</Helper>

                      {product.images?.length > 0 && (
                        <ThumbRow>
                          {product.images.map((image) => (
                            <Thumb key={image.id} src={image.url} alt={product.name} />
                          ))}
                        </ThumbRow>
                      )}

                      <ButtonRow style={{ marginTop: '16px' }}>
                        <ActionButton type="button" onClick={() => beginEdit(product)}>
                          Edit
                        </ActionButton>
                        <ActionButton type="button" variant="danger" onClick={() => handleDelete(product.id)}>
                          Delete
                        </ActionButton>
                      </ButtonRow>
                    </ProductCard>
                  ))}
                </ProductGrid>
              )}

              <Pager>
                <Helper>
                  Page {page} of {totalPages}
                </Helper>
                <ButtonRow>
                  <ActionButton
                    type="button"
                    variant="ghost"
                    onClick={async () => {
                      const nextPage = Math.max(1, page - 1);
                      setPage(nextPage);
                      await loadProducts(nextPage);
                    }}
                    disabled={!pageInfo.previous_page}
                  >
                    Previous
                  </ActionButton>
                  <ActionButton
                    type="button"
                    variant="ghost"
                    onClick={async () => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      await loadProducts(nextPage);
                    }}
                    disabled={!pageInfo.next_page}
                  >
                    Next
                  </ActionButton>
                </ButtonRow>
              </Pager>
            </Panel>
          </Layout>
        </Shell>
      </Page>
      <Footer />
    </>
  );
};

export default SellerProducts;
