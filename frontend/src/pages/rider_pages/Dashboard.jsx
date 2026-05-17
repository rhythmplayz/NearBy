import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import RiderNav from '../../components/RiderNav';
import Footer from '../../components/Footer';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const API = 'http://127.0.0.1:8000/api/orders/orders';

const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{transform:scale(1)}50%{transform:scale(1.05)}`;

const PageWrap = styled.div`background:linear-gradient(135deg,#f8fffe 0%,#e8f8f5 50%,#f2f2f2 100%);min-height:calc(100vh - 80px);font-family:'Poppins',sans-serif;`;
const Container = styled.div`max-width:1200px;margin:0 auto;padding:28px 20px;`;
const Title = styled.h1`font-size:1.6rem;color:#1a1a2e;margin:0 0 6px;animation:${fadeIn} .4s ease;`;
const Sub = styled.p`color:#888;margin:0 0 24px;animation:${fadeIn} .4s ease .05s both;`;

const StatsRow = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:28px;animation:${fadeIn} .4s ease .1s both;`;
const StatCard = styled.div`background:white;border-radius:16px;padding:20px;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,.04);border-left:4px solid ${p=>p.$c||'#3CCFC4'};`;
const StatNum = styled.div`font-size:1.8rem;font-weight:700;color:${p=>p.$c||'#1a1a2e'};`;
const StatLabel = styled.div`font-size:.8rem;color:#999;margin-top:4px;font-weight:500;`;

const Tabs = styled.div`display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;animation:${fadeIn} .4s ease .15s both;`;
const Tab = styled.button`padding:9px 18px;border:2px solid ${p=>p.$a?'#3CCFC4':'#e0e0e0'};border-radius:12px;background:${p=>p.$a?'#3CCFC4':'white'};color:${p=>p.$a?'white':'#666'};font-weight:600;cursor:pointer;font-family:inherit;font-size:.83rem;transition:all .2s;&:hover{border-color:#3CCFC4}`;

const Panel = styled.div`background:white;border-radius:20px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,.04);margin-bottom:16px;animation:${fadeIn} .4s ease .2s both;`;

const OrderCard = styled.div`background:white;border-radius:16px;padding:20px;margin-bottom:12px;box-shadow:0 2px 12px rgba(0,0,0,.04);border:1px solid rgba(0,0,0,.04);cursor:pointer;transition:all .3s;animation:${fadeIn} .35s ease both;animation-delay:${p=>p.$i*.04}s;&:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(60,207,196,.12);border-color:rgba(60,207,196,.2)}`;
const OrderHead = styled.div`display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;`;
const OrderId = styled.span`font-weight:700;color:#1a1a2e;font-size:1.05rem;`;
const Badge = styled.span`padding:5px 14px;border-radius:20px;font-size:.75rem;font-weight:600;background:${p=>{const m={pending:'#fff3cd',assigned:'#d1ecf1',picked_up:'#d4edda',in_transit:'#cce5ff',delivered:'#d4edda',cancelled:'#f8d7da'};return m[p.$s]||'#f0f0f0'}};color:${p=>{const m={pending:'#856404',assigned:'#0c5460',picked_up:'#155724',in_transit:'#004085',delivered:'#155724',cancelled:'#721c24'};return m[p.$s]||'#666'}};`;
const Addr = styled.div`margin-top:10px;font-size:.87rem;color:#666;line-height:1.6;`;
const Meta = styled.div`display:flex;gap:16px;margin-top:10px;flex-wrap:wrap;color:#999;font-size:.82rem;`;

const Btn = styled.button`background:${p=>p.$bg||'#3CCFC4'};color:white;border:none;padding:8px 16px;border-radius:10px;cursor:pointer;font-weight:600;font-family:inherit;font-size:.83rem;transition:all .2s;&:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(60,207,196,.3)}&:disabled{opacity:.5;cursor:not-allowed}`;
const BtnGroup = styled.div`display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;`;

const Overlay = styled.div`position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;animation:${fadeIn} .15s ease;`;
const Modal = styled.div`background:white;width:100%;max-width:850px;max-height:90vh;overflow-y:auto;border-radius:24px;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:${fadeIn} .25s ease;`;
const ModalHeader = styled.div`display:flex;justify-content:space-between;align-items:center;padding:20px 28px;border-bottom:1px solid #f0f0f0;`;
const ModalBody = styled.div`padding:24px 28px;`;
const CloseBtn = styled.button`background:none;border:none;font-size:1.5rem;cursor:pointer;color:#999;transition:color .2s;&:hover{color:#333}`;

const EmptyState = styled.div`text-align:center;padding:60px 20px;color:#999;`;
const ErrBanner = styled.div`background:#fff0f0;border:1px solid #ffd0d0;color:#c00;padding:14px 20px;border-radius:14px;margin-bottom:16px;`;
const Loader = styled.div`text-align:center;padding:50px;color:#999;`;

const statusLabels = {pending:'Pending',assigned:'Assigned',picked_up:'Picked Up',in_transit:'In Transit',delivered:'Delivered',cancelled:'Cancelled'};
const statusFilters = [{key:'',label:'All'},{key:'pending',label:'Pending'},{key:'assigned',label:'Assigned'},{key:'picked_up',label:'Picked Up'},{key:'in_transit',label:'In Transit'},{key:'delivered',label:'Delivered'}];

const RiderDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');
    const socketsRef = useRef({});
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type':'application/json', ...(token ? {'Authorization':`Bearer ${token}`} : {}) };

    // --- Fetch orders ---
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/`, { headers });
            const data = res.data.results || res.data;
            setOrders(Array.isArray(data) ? data : []);
            setError(null);
        } catch(err) {
            setError(err.response?.data?.detail || 'Failed to load orders');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchOrders();
        return () => { Object.values(socketsRef.current).forEach(s => { try{s.close()}catch{} }); };
    }, [fetchOrders]);

    // --- WebSocket for selected order ---
    useEffect(() => {
        if (!selectedOrder) return;
        const id = selectedOrder.id;
        if (socketsRef.current[id]) return;
        try {
            const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
            const ws = new WebSocket(`${proto}://127.0.0.1:8000/ws/orders/${id}/?token=${token}`);
            ws.onmessage = (evt) => {
                try {
                    const msg = JSON.parse(evt.data);
                    if (msg.type === 'order.update' && msg.data) {
                        setOrders(prev => prev.map(o => o.id === msg.data.id ? msg.data : o));
                        setSelectedOrder(prev => prev && prev.id === msg.data.id ? msg.data : prev);
                    }
                } catch {}
            };
            ws.onclose = () => { delete socketsRef.current[id]; };
            socketsRef.current[id] = ws;
        } catch {}
        return () => {
            if (socketsRef.current[id]) { try { socketsRef.current[id].close(); } catch {} delete socketsRef.current[id]; }
        };
    }, [selectedOrder?.id]);

    // --- Actions ---
    const callAction = async (orderId, action, e) => {
        if (e) e.stopPropagation();
        try {
            const res = await axios.post(`${API}/${orderId}/${action}/`, {}, { headers });
            const updated = res.data;
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
            setSelectedOrder(prev => prev && prev.id === updated.id ? updated : prev);
        } catch(err) {
            setError(err.response?.data?.detail || 'Action failed');
        }
    };

    const openDetails = (order) => setSelectedOrder(order);
    const closeDetails = () => setSelectedOrder(null);

    // --- Filter ---
    const filtered = filter ? orders.filter(o => o.status === filter) : orders;
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        active: orders.filter(o => ['assigned','picked_up','in_transit'].includes(o.status)).length,
        delivered: orders.filter(o => o.status === 'delivered').length,
    };

    // --- Action buttons helper ---
    const renderActions = (order, stopProp = true) => {
        const wrap = (action, label, bg) => (
            <Btn key={action} $bg={bg} onClick={(e) => callAction(order.id, action, stopProp ? e : null)}>{label}</Btn>
        );
        const btns = [];
        if (order.status === 'pending') btns.push(wrap('accept', '✓ Accept Order', '#3CCFC4'));
        if (order.status === 'assigned') { btns.push(wrap('pickup', '📦 Pick Up', '#17a2b8')); btns.push(wrap('start_transit', '🚀 Start Transit', '#6f42c1')); }
        if (order.status === 'picked_up') btns.push(wrap('start_transit', '🚀 Start Transit', '#6f42c1'));
        if (order.status === 'in_transit') btns.push(wrap('complete', '✅ Mark Delivered', '#28a745'));
        return btns;
    };

    // --- Map helper ---
    const renderMap = (order, h = 300) => {
        if (!order.pickup_latitude || !order.dropoff_latitude) return <div style={{padding:16,color:'#999',textAlign:'center'}}>No coordinates available for map.</div>;
        const pLat = parseFloat(order.pickup_latitude), pLng = parseFloat(order.pickup_longitude);
        const dLat = parseFloat(order.dropoff_latitude), dLng = parseFloat(order.dropoff_longitude);
        return (
            <MapContainer center={[(pLat+dLat)/2,(pLng+dLng)/2]} zoom={13} style={{height:h,width:'100%',borderRadius:12}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[pLat,pLng]}><Popup>📍 Pickup</Popup></Marker>
                <Marker position={[dLat,dLng]}><Popup>📍 Dropoff</Popup></Marker>
                <Polyline positions={[[pLat,pLng],[dLat,dLng]]} color="#3CCFC4" weight={4} />
            </MapContainer>
        );
    };

    return (
        <>
            <RiderNav />
            <PageWrap>
                <Container>
                    <Title>🏍️ Rider Dashboard</Title>
                    <Sub>Manage your deliveries and track orders</Sub>

                    {error && <ErrBanner>{error} <button onClick={()=>setError(null)} style={{background:'none',border:'none',cursor:'pointer',float:'right',fontSize:'1.1rem'}}>✕</button></ErrBanner>}

                    {/* Stats */}
                    <StatsRow>
                        <StatCard $c="#3CCFC4"><StatNum $c="#3CCFC4">{stats.total}</StatNum><StatLabel>Total Orders</StatLabel></StatCard>
                        <StatCard $c="#f5a623"><StatNum $c="#f5a623">{stats.pending}</StatNum><StatLabel>Pending</StatLabel></StatCard>
                        <StatCard $c="#6f42c1"><StatNum $c="#6f42c1">{stats.active}</StatNum><StatLabel>Active</StatLabel></StatCard>
                        <StatCard $c="#28a745"><StatNum $c="#28a745">{stats.delivered}</StatNum><StatLabel>Delivered</StatLabel></StatCard>
                    </StatsRow>

                    {/* Filter Tabs */}
                    <Tabs>
                        {statusFilters.map(s => (
                            <Tab key={s.key} $a={filter===s.key} onClick={() => setFilter(s.key)}>{s.label}</Tab>
                        ))}
                        <Btn $bg="#6c757d" onClick={fetchOrders} style={{marginLeft:'auto',padding:'8px 16px'}}>🔄 Refresh</Btn>
                    </Tabs>

                    {/* Loading */}
                    {loading && <Loader>Loading orders...</Loader>}

                    {/* Empty */}
                    {!loading && filtered.length === 0 && (
                        <EmptyState>
                            <div style={{fontSize:'3rem',marginBottom:12}}>📋</div>
                            <h3 style={{color:'#555'}}>No orders found</h3>
                            <p>No {filter ? statusLabels[filter]?.toLowerCase() : ''} orders available right now.</p>
                        </EmptyState>
                    )}

                    {/* Order List */}
                    {!loading && filtered.map((order, i) => (
                        <OrderCard key={order.id} $i={i} onClick={() => openDetails(order)}>
                            <OrderHead>
                                <OrderId>Order #{order.id}</OrderId>
                                <Badge $s={order.status}>{statusLabels[order.status] || order.status}</Badge>
                            </OrderHead>
                            <Addr>
                                <div><strong>📍 From:</strong> {order.pickup_address}</div>
                                <div><strong>📍 To:</strong> {order.dropoff_address}</div>
                            </Addr>
                            <Meta>
                                <span>🕐 {new Date(order.created_at).toLocaleString()}</span>
                                {order.total_price && <span>💰 ৳{order.total_price}</span>}
                                {order.estimated_distance_km && <span>📏 {order.estimated_distance_km} km</span>}
                                {order.assigned_to_name && <span>🏍️ {order.assigned_to_name}</span>}
                                {order.user_name && <span>👤 {order.user_name}</span>}
                            </Meta>
                            <BtnGroup onClick={e => e.stopPropagation()}>
                                {renderActions(order)}
                            </BtnGroup>
                        </OrderCard>
                    ))}

                    {/* Detail Modal */}
                    {selectedOrder && (
                        <Overlay onClick={closeDetails}>
                            <Modal onClick={e => e.stopPropagation()}>
                                <ModalHeader>
                                    <div>
                                        <h2 style={{margin:0}}>Order #{selectedOrder.id}</h2>
                                        <Badge $s={selectedOrder.status} style={{marginTop:8,display:'inline-block'}}>{statusLabels[selectedOrder.status]}</Badge>
                                    </div>
                                    <CloseBtn onClick={closeDetails}>✕</CloseBtn>
                                </ModalHeader>
                                <ModalBody>
                                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
                                        <div><div style={{fontWeight:600,fontSize:'.82rem',color:'#999',marginBottom:4}}>Pickup Address</div><div style={{color:'#333'}}>{selectedOrder.pickup_address}</div></div>
                                        <div><div style={{fontWeight:600,fontSize:'.82rem',color:'#999',marginBottom:4}}>Drop-off Address</div><div style={{color:'#333'}}>{selectedOrder.dropoff_address}</div></div>
                                        {selectedOrder.total_price && <div><div style={{fontWeight:600,fontSize:'.82rem',color:'#999',marginBottom:4}}>Total Price</div><div style={{color:'#333',fontWeight:700,fontSize:'1.1rem'}}>৳{selectedOrder.total_price}</div></div>}
                                        {selectedOrder.estimated_distance_km && <div><div style={{fontWeight:600,fontSize:'.82rem',color:'#999',marginBottom:4}}>Distance</div><div style={{color:'#333'}}>{selectedOrder.estimated_distance_km} km</div></div>}
                                        {selectedOrder.estimated_duration_minutes && <div><div style={{fontWeight:600,fontSize:'.82rem',color:'#999',marginBottom:4}}>Est. Duration</div><div style={{color:'#333'}}>{selectedOrder.estimated_duration_minutes} min</div></div>}
                                        {selectedOrder.user_name && <div><div style={{fontWeight:600,fontSize:'.82rem',color:'#999',marginBottom:4}}>Customer</div><div style={{color:'#333'}}>{selectedOrder.user_name}</div></div>}
                                    </div>

                                    {/* Items */}
                                    {(selectedOrder.items?.length > 0 || selectedOrder.items_description) && (
                                        <div style={{marginBottom:20,padding:16,background:'#f8faf9',borderRadius:12}}>
                                            <div style={{fontWeight:600,marginBottom:8}}>📦 Items</div>
                                            {selectedOrder.items?.length > 0
                                                ? selectedOrder.items.map(it => <div key={it.id} style={{color:'#555',fontSize:'.9rem',marginBottom:4}}>• {it.name} x{it.quantity} {it.notes && <span style={{color:'#999'}}>({it.notes})</span>}</div>)
                                                : <div style={{color:'#666'}}>{selectedOrder.items_description}</div>
                                            }
                                        </div>
                                    )}

                                    {/* Status Timeline */}
                                    {selectedOrder.status_history?.length > 0 && (
                                        <div style={{marginBottom:20}}>
                                            <div style={{fontWeight:600,marginBottom:12}}>📋 Status Timeline</div>
                                            <div style={{paddingLeft:20,borderLeft:'3px solid #e0f0ee'}}>
                                                {selectedOrder.status_history.map((h,i) => (
                                                    <div key={h.id} style={{position:'relative',paddingLeft:20,paddingBottom:16}}>
                                                        <div style={{position:'absolute',left:-31,top:4,width:12,height:12,borderRadius:'50%',background:'#3CCFC4',border:'3px solid #e0f0ee'}}/>
                                                        <div style={{fontWeight:600,fontSize:'.88rem',color:'#333'}}>{statusLabels[h.status]||h.status}</div>
                                                        <div style={{fontSize:'.78rem',color:'#bbb'}}>{new Date(h.timestamp).toLocaleString()}</div>
                                                        {h.note && <div style={{fontSize:'.82rem',color:'#888',fontStyle:'italic'}}>{h.note}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <BtnGroup style={{marginBottom:20}}>
                                        {renderActions(selectedOrder, false)}
                                        <Link to={`/rider/order/${selectedOrder.id}`} style={{textDecoration:'none'}}>
                                            <Btn $bg="#6c757d">🗺️ Full Details</Btn>
                                        </Link>
                                    </BtnGroup>

                                    {/* Map */}
                                    <div style={{borderRadius:12,overflow:'hidden'}}>
                                        {renderMap(selectedOrder, 350)}
                                    </div>

                                    {/* Cancel reason */}
                                    {selectedOrder.canceled_reason && (
                                        <div style={{background:'#fff3f3',padding:16,borderRadius:12,marginTop:16}}>
                                            <div style={{fontWeight:600,color:'#c44',marginBottom:4}}>Cancellation Reason</div>
                                            <div style={{color:'#666'}}>{selectedOrder.canceled_reason}</div>
                                        </div>
                                    )}
                                </ModalBody>
                            </Modal>
                        </Overlay>
                    )}
                </Container>
            </PageWrap>
            <Footer />
        </>
    );
};

export default RiderDashboard;