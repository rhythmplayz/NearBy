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
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px 80px;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
  animation: ${fadeIn} 0.5s ease;
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

const FilterRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 28px;
  overflow-x: auto;
  padding-bottom: 4px;
  animation: ${fadeIn} 0.6s ease;
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
`;

const FilterPill = styled.button`
  padding: 8px 20px;
  border-radius: 50px;
  border: 2px solid ${p => p.$active ? '#3CCFC4' : '#e0e0e0'};
  background: ${p => p.$active ? 'linear-gradient(135deg, #3CCFC4, #1F8F87)' : 'rgba(255,255,255,0.9)'};
  color: ${p => p.$active ? '#fff' : '#555'};
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  &:hover {
    border-color: #3CCFC4;
    transform: translateY(-2px);
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const OrderCard = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease forwards;
  animation-delay: ${p => p.$delay || '0s'};
  opacity: 0;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(31, 143, 135, 0.1);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
  gap: 10px;
`;

const OrderId = styled.span`
  font-size: 1.1rem;
  font-weight: 800;
  color: #1a1a1a;
`;

const OrderDate = styled.span`
  font-size: 0.82rem;
  color: #999;
  font-weight: 500;
`;

const statusColors = {
  pending: { bg: 'rgba(242, 226, 5, 0.12)', color: '#b8860b', border: 'rgba(242, 226, 5, 0.3)' },
  confirmed: { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: 'rgba(59, 130, 246, 0.3)' },
  assigned: { bg: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', border: 'rgba(139, 92, 246, 0.3)' },
  picked_up: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: 'rgba(245, 158, 11, 0.3)' },
  in_transit: { bg: 'rgba(60, 207, 196, 0.1)', color: '#1F8F87', border: 'rgba(60, 207, 196, 0.3)' },
  delivered: { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: 'rgba(16, 185, 129, 0.3)' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: 'rgba(239, 68, 68, 0.3)' },
};

const StatusBadge = styled.span`
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  ${p => {
    const c = statusColors[p.$status] || statusColors.pending;
    return css`
      background: ${c.bg};
      color: ${c.color};
      border: 1px solid ${c.border};
    `;
  }}
`;

const OrderBody = styled.div`
  padding: 18px 24px;
`;

const ItemsPreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
`;

const ItemChip = styled.span`
  padding: 5px 12px;
  background: #f5f5f5;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #555;
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
`;

const TotalPrice = styled.span`
  font-size: 1.2rem;
  font-weight: 800;
  color: #1F8F87;
`;

const SellerInfo = styled.span`
  font-size: 0.82rem;
  color: #888;
  font-weight: 500;
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

const ShopButton = styled.button`
  padding: 14px 40px;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, #3CCFC4, #1F8F87);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(60, 207, 196, 0.35);
  }
`;

const Skeleton = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${p => p.$radius || '12px'};
  height: ${p => p.$h || '20px'};
  width: ${p => p.$w || '100%'};
`;

const DeliveryAddr = styled.div`
  font-size: 0.82rem;
  color: #777;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  assigned: 'Assigned',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter) params.status = filter;
            const { data } = await axios.get(`${API}/api/orders/orders/my-orders/`, { headers, params });
            setOrders(data.results || data || []);
        } catch (err) {
            console.error('Failed to load orders', err);
            setOrders([]);
        }
        setLoading(false);
    }, [filter]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    return (
        <>
            <UserMarketplaceNav />
            <PageWrapper>
                <ContentContainer>
                    <PageHeader>
                        <Title>📦 My Orders</Title>
                        <Subtitle>Track and manage all your orders</Subtitle>
                    </PageHeader>

                    <FilterRow>
                        {[
                            { value: '', label: 'All' },
                            { value: 'pending', label: '⏳ Pending' },
                            { value: 'confirmed', label: '✓ Confirmed' },
                            { value: 'in_transit', label: '🚀 In Transit' },
                            { value: 'delivered', label: '✅ Delivered' },
                            { value: 'cancelled', label: '❌ Cancelled' },
                        ].map(f => (
                            <FilterPill
                                key={f.value}
                                $active={filter === f.value}
                                onClick={() => setFilter(f.value)}
                            >
                                {f.label}
                            </FilterPill>
                        ))}
                    </FilterRow>

                    {loading ? (
                        <OrdersList>
                            {[1,2,3].map(i => (
                                <OrderCard key={i} style={{ opacity: 1 }}>
                                    <div style={{ padding: 24 }}>
                                        <Skeleton $h="22px" $w="40%" style={{ marginBottom: 12 }} />
                                        <Skeleton $h="16px" $w="60%" style={{ marginBottom: 8 }} />
                                        <Skeleton $h="14px" $w="80%" />
                                    </div>
                                </OrderCard>
                            ))}
                        </OrdersList>
                    ) : orders.length === 0 ? (
                        <EmptyState>
                            <EmptyIcon>📦</EmptyIcon>
                            <h2 style={{ color: '#333', margin: '0 0 8px 0' }}>No orders yet</h2>
                            <p style={{ color: '#888' }}>
                                {filter ? `No ${statusLabels[filter]?.toLowerCase()} orders found` : "You haven't placed any orders yet"}
                            </p>
                            <ShopButton onClick={() => navigate('/user/shops')}>
                                Start Shopping
                            </ShopButton>
                        </EmptyState>
                    ) : (
                        <OrdersList>
                            {orders.map((order, idx) => (
                                <OrderCard key={order.id} $delay={`${idx * 0.08}s`}>
                                    <OrderHeader>
                                        <div>
                                            <OrderId>Order #{String(order.id).padStart(6, '0')}</OrderId>
                                            <OrderDate style={{ marginLeft: 14 }}>
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </OrderDate>
                                        </div>
                                        <StatusBadge $status={order.status}>
                                            {statusLabels[order.status] || order.status}
                                        </StatusBadge>
                                    </OrderHeader>

                                    <OrderBody>
                                        <ItemsPreview>
                                            {(order.items || []).map((item, i) => (
                                                <ItemChip key={i}>
                                                    {item.name} × {item.quantity}
                                                </ItemChip>
                                            ))}
                                        </ItemsPreview>
                                        <DeliveryAddr>
                                            📍 {order.dropoff_address}
                                        </DeliveryAddr>
                                    </OrderBody>

                                    <OrderFooter>
                                        <SellerInfo>
                                            {order.seller_name && `🏪 ${order.seller_name}`}
                                            {order.payment_method && ` • ${order.payment_method === 'cod' ? '💵 COD' : '💳 Online'}`}
                                        </SellerInfo>
                                        <TotalPrice>৳{parseFloat(order.total_price).toFixed(2)}</TotalPrice>
                                    </OrderFooter>
                                </OrderCard>
                            ))}
                        </OrdersList>
                    )}
                </ContentContainer>
            </PageWrapper>
            <Footer />
        </>
    );
};

export default MyOrders;
