import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserMarketplaceNav from '../../../components/UserMarketplaceNav';
import Footer from '../../../components/Footer';

const API = 'http://127.0.0.1:8000/api';
const fadeIn = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;
const slideIn = keyframes`from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}`;

const Wrap = styled.div`background:linear-gradient(135deg,#f8fffe,#e8f8f5 50%,#f2f2f2);min-height:100vh;font-family:'Poppins',sans-serif;`;
const Box = styled.div`max-width:1100px;margin:0 auto;padding:30px 20px;`;
const Title = styled.h1`font-size:1.6rem;color:#1a1a2e;margin-bottom:8px;animation:${fadeIn} .5s ease;`;
const Sub = styled.p`color:#888;margin-bottom:24px;animation:${fadeIn} .5s ease .1s both;`;

const Tabs = styled.div`display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;animation:${fadeIn} .5s ease .15s both;`;
const Tab = styled.button`padding:10px 20px;border:2px solid ${p=>p.$active?'#3CCFC4':'#e0e0e0'};border-radius:14px;background:${p=>p.$active?'#3CCFC4':'white'};color:${p=>p.$active?'white':'#666'};font-weight:600;cursor:pointer;font-family:inherit;font-size:.85rem;transition:all .2s;&:hover{border-color:#3CCFC4}`;

const OrderCard = styled.div`background:white;border-radius:20px;padding:24px;margin-bottom:16px;box-shadow:0 4px 20px rgba(0,0,0,.04);border:1px solid rgba(0,0,0,.04);cursor:pointer;transition:all .3s ease;animation:${fadeIn} .4s ease both;animation-delay:${p=>p.$i*.06}s;&:hover{transform:translateY(-4px);box-shadow:0 8px 30px rgba(60,207,196,.12);border-color:rgba(60,207,196,.2)}`;
const OrderHeader = styled.div`display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;`;
const OrderId = styled.span`font-weight:700;color:#1a1a2e;font-size:1.05rem;`;
const StatusBadge = styled.span`padding:6px 16px;border-radius:20px;font-size:.78rem;font-weight:600;background:${p=>{
  const m={pending:'#fff3cd',assigned:'#d1ecf1',picked_up:'#d4edda',in_transit:'#cce5ff',delivered:'#d4edda',cancelled:'#f8d7da'};return m[p.$s]||'#f0f0f0'}};
  color:${p=>{const m={pending:'#856404',assigned:'#0c5460',picked_up:'#155724',in_transit:'#004085',delivered:'#155724',cancelled:'#721c24'};return m[p.$s]||'#666'}};`;
const OrderMeta = styled.div`display:flex;gap:24px;margin-top:12px;flex-wrap:wrap;color:#888;font-size:.85rem;`;
const OrderAddr = styled.div`margin-top:10px;font-size:.88rem;color:#666;`;

// Detail Modal
const Overlay = styled.div`position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;animation:${fadeIn} .2s ease;`;
const Modal = styled.div`background:white;width:100%;max-width:700px;max-height:90vh;overflow-y:auto;border-radius:24px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:${fadeIn} .3s ease;`;
const CloseBtn = styled.button`position:absolute;top:16px;right:20px;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#999;&:hover{color:#333}`;

// Timeline
const Timeline = styled.div`margin:24px 0;padding-left:24px;border-left:3px solid #e0f0ee;`;
const TimelineItem = styled.div`position:relative;padding:0 0 24px 24px;animation:${slideIn} .4s ease both;animation-delay:${p=>p.$i*.1}s;
  &:last-child{padding-bottom:0}
  &::before{content:'';position:absolute;left:-30px;top:4px;width:14px;height:14px;border-radius:50%;background:${p=>p.$active?'#3CCFC4':'#d0e8e5'};border:3px solid ${p=>p.$active?'#2ba89e':'#e0f0ee'};transition:all .3s}`;
const TimeStatus = styled.div`font-weight:600;color:${p=>p.$active?'#1a1a2e':'#999'};font-size:.9rem;`;
const TimeDate = styled.div`font-size:.78rem;color:#bbb;margin-top:2px;`;
const TimeNote = styled.div`font-size:.82rem;color:#888;margin-top:2px;font-style:italic;`;

const EmptyState = styled.div`text-align:center;padding:80px 20px;animation:${fadeIn} .5s ease;`;
const Loader = styled.div`text-align:center;padding:60px;color:#999;animation:${fadeIn} .3s ease;`;
const ErrBanner = styled.div`background:#fff0f0;border:1px solid #ffd0d0;color:#c00;padding:16px;border-radius:14px;margin-bottom:20px;text-align:center;`;

const statuses = [
  { key: '', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const statusLabels = { pending:'Pending', assigned:'Assigned', picked_up:'Picked Up', in_transit:'In Transit', delivered:'Delivered', cancelled:'Cancelled' };

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const wsRef = useRef(null);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchOrders(); return () => { if(wsRef.current) try{wsRef.current.close()}catch{} }; }, [filter]);

  const fetchOrders = async () => {
    setLoading(true); setError(null);
    try {
      const params = filter ? `?status=${filter}` : '';
      const res = await axios.get(`${API}/orders/orders/my-orders/${params}`, { headers });
      setOrders(res.data.results || res.data || []);
    } catch (e) { setError(e.response?.data?.detail || 'Failed to load orders'); }
    finally { setLoading(false); }
  };

  const openDetail = (order) => {
    setSelected(order);
    // Open WebSocket for real-time updates
    if (wsRef.current) try { wsRef.current.close(); } catch {}
    try {
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(`${proto}://127.0.0.1:8000/ws/orders/${order.id}/?token=${token}`);
      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === 'order.update' && msg.data) {
            setSelected(prev => prev?.id === msg.data.id ? msg.data : prev);
            setOrders(prev => prev.map(o => o.id === msg.data.id ? msg.data : o));
          }
        } catch {}
      };
      wsRef.current = ws;
    } catch {}
  };

  const closeDetail = () => { setSelected(null); if(wsRef.current) try{wsRef.current.close()}catch{} };

  const allStatuses = ['pending','assigned','picked_up','in_transit','delivered','cancelled'];
  const getTimelineIndex = (s) => allStatuses.indexOf(s);

  return (
    <>
      <UserMarketplaceNav />
      <Wrap>
        <Box>
          <Title>📦 My Orders</Title>
          <Sub>Track your delivery orders in real-time</Sub>

          <Tabs>
            {statuses.map(s => (
              <Tab key={s.key} $active={filter===s.key} onClick={() => setFilter(s.key)}>{s.label}</Tab>
            ))}
          </Tabs>

          {error && <ErrBanner>{error}</ErrBanner>}
          {loading && <Loader>Loading your orders...</Loader>}

          {!loading && orders.length === 0 && (
            <EmptyState>
              <div style={{fontSize:'4rem',marginBottom:16}}>📋</div>
              <h2 style={{color:'#333'}}>No orders found</h2>
              <p style={{color:'#888'}}>You haven't placed any orders yet.</p>
            </EmptyState>
          )}

          {!loading && orders.map((order, i) => (
            <OrderCard key={order.id} $i={i} onClick={() => openDetail(order)}>
              <OrderHeader>
                <OrderId>Order #{order.id}</OrderId>
                <StatusBadge $s={order.status}>{statusLabels[order.status] || order.status}</StatusBadge>
              </OrderHeader>
              <OrderAddr>
                <span style={{fontWeight:600}}>📍 From:</span> {order.pickup_address}
                <br/>
                <span style={{fontWeight:600}}>📍 To:</span> {order.dropoff_address}
              </OrderAddr>
              <OrderMeta>
                <span>🕐 {new Date(order.created_at).toLocaleString()}</span>
                {order.total_price && <span>💰 ৳{order.total_price}</span>}
                {order.assigned_to_name && <span>🏍️ {order.assigned_to_name}</span>}
              </OrderMeta>
            </OrderCard>
          ))}

          {/* Order Detail Modal */}
          {selected && (
            <Overlay onClick={closeDetail}>
              <Modal onClick={e => e.stopPropagation()} style={{position:'relative'}}>
                <CloseBtn onClick={closeDetail}>✕</CloseBtn>
                <h2 style={{margin:'0 0 4px'}}>Order #{selected.id}</h2>
                <StatusBadge $s={selected.status} style={{marginBottom:16,display:'inline-block'}}>{statusLabels[selected.status]}</StatusBadge>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
                  <div><div style={{fontWeight:600,fontSize:'.85rem',color:'#999',marginBottom:4}}>Pickup</div><div style={{color:'#333'}}>{selected.pickup_address}</div></div>
                  <div><div style={{fontWeight:600,fontSize:'.85rem',color:'#999',marginBottom:4}}>Drop-off</div><div style={{color:'#333'}}>{selected.dropoff_address}</div></div>
                  {selected.total_price && <div><div style={{fontWeight:600,fontSize:'.85rem',color:'#999',marginBottom:4}}>Total</div><div style={{color:'#333',fontWeight:700}}>৳{selected.total_price}</div></div>}
                  {selected.assigned_to_name && <div><div style={{fontWeight:600,fontSize:'.85rem',color:'#999',marginBottom:4}}>Rider</div><div style={{color:'#333'}}>{selected.assigned_to_name}</div></div>}
                </div>

                {selected.items?.length > 0 && (
                  <div style={{margin:'16px 0'}}>
                    <div style={{fontWeight:600,marginBottom:8}}>Items</div>
                    {selected.items.map(item => <div key={item.id} style={{color:'#666',fontSize:'.9rem'}}>• {item.name} x{item.quantity} {item.notes && `(${item.notes})`}</div>)}
                  </div>
                )}

                {/* Status Timeline */}
                <h3 style={{marginTop:24,marginBottom:8}}>Tracking Timeline</h3>
                <Timeline>
                  {(selected.status_history && selected.status_history.length > 0) ? (
                    selected.status_history.map((h, i) => (
                      <TimelineItem key={h.id} $i={i} $active={true}>
                        <TimeStatus $active={true}>{statusLabels[h.status] || h.status}</TimeStatus>
                        <TimeDate>{new Date(h.timestamp).toLocaleString()}</TimeDate>
                        {h.note && <TimeNote>{h.note}</TimeNote>}
                        {h.changed_by_name && h.changed_by_name !== 'System' && <TimeNote>by {h.changed_by_name}</TimeNote>}
                      </TimelineItem>
                    ))
                  ) : (
                    allStatuses.slice(0, getTimelineIndex(selected.status) + 1).map((s, i) => (
                      <TimelineItem key={s} $i={i} $active={i <= getTimelineIndex(selected.status)}>
                        <TimeStatus $active={i <= getTimelineIndex(selected.status)}>{statusLabels[s]}</TimeStatus>
                        {s === selected.status && <TimeDate>{new Date(selected.updated_at).toLocaleString()}</TimeDate>}
                      </TimelineItem>
                    ))
                  )}
                </Timeline>

                {selected.canceled_reason && (
                  <div style={{background:'#fff3f3',padding:16,borderRadius:12,marginTop:16}}>
                    <div style={{fontWeight:600,color:'#c44',marginBottom:4}}>Cancellation Reason</div>
                    <div style={{color:'#666'}}>{selected.canceled_reason}</div>
                  </div>
                )}
              </Modal>
            </Overlay>
          )}
        </Box>
      </Wrap>
      <Footer />
    </>
  );
};

export default OrderTracking;
