import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import RiderNav from '../../components/RiderNav';
import Footer from '../../components/Footer';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const API = 'http://127.0.0.1:8000/api/orders/orders';
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;

const PageWrap = styled.div`background:linear-gradient(135deg,#f8fffe,#e8f8f5,#f2f2f2);min-height:calc(100vh - 80px);font-family:'Poppins',sans-serif;`;
const Container = styled.div`max-width:900px;margin:0 auto;padding:28px 20px;`;
const BackBtn = styled(Link)`display:inline-flex;align-items:center;gap:6px;color:#3CCFC4;font-weight:600;text-decoration:none;margin-bottom:20px;font-size:.95rem;transition:color .2s;&:hover{color:#2ba89e}`;
const Panel = styled.div`background:white;padding:24px;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,.04);margin-bottom:16px;animation:${fadeIn} .4s ease;`;
const Badge = styled.span`padding:5px 14px;border-radius:20px;font-size:.78rem;font-weight:600;display:inline-block;background:${p=>{const m={pending:'#fff3cd',assigned:'#d1ecf1',picked_up:'#d4edda',in_transit:'#cce5ff',delivered:'#d4edda',cancelled:'#f8d7da'};return m[p.$s]||'#f0f0f0'}};color:${p=>{const m={pending:'#856404',assigned:'#0c5460',picked_up:'#155724',in_transit:'#004085',delivered:'#155724',cancelled:'#721c24'};return m[p.$s]||'#666'}};`;
const Btn = styled.button`background:${p=>p.$bg||'#3CCFC4'};color:white;border:none;padding:10px 20px;border-radius:12px;cursor:pointer;font-weight:600;font-family:inherit;font-size:.88rem;transition:all .2s;&:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(60,207,196,.3)}`;
const ErrPanel = styled.div`background:#fff0f0;color:#c00;padding:20px;border-radius:16px;text-align:center;`;

const statusLabels = {pending:'Pending',assigned:'Assigned',picked_up:'Picked Up',in_transit:'In Transit',delivered:'Delivered',cancelled:'Cancelled'};

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const token = localStorage.getItem('token');
  const headers = { ...(token ? {'Authorization':`Bearer ${token}`} : {}) };

  useEffect(() => {
    axios.get(`${API}/${id}/`, { headers })
      .then(res => setOrder(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load order'));
  }, [id]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!order) return;
    try {
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(`${proto}://127.0.0.1:8000/ws/orders/${id}/?token=${token}`);
      ws.onmessage = (evt) => {
        try { const msg = JSON.parse(evt.data); if (msg.type === 'order.update' && msg.data) setOrder(msg.data); } catch {}
      };
      wsRef.current = ws;
    } catch {}
    return () => { if (wsRef.current) try { wsRef.current.close(); } catch {} };
  }, [order?.id]);

  const callAction = async (action) => {
    try {
      const res = await axios.post(`${API}/${id}/${action}/`, {}, { headers });
      setOrder(res.data);
    } catch (err) { setError(err.response?.data?.detail || 'Action failed'); }
  };

  if (error) return <><RiderNav /><PageWrap><Container><ErrPanel>{error}</ErrPanel><BackBtn to="/rider/dashboard">← Back to Dashboard</BackBtn></Container></PageWrap><Footer /></>;
  if (!order) return <><RiderNav /><PageWrap><Container><Panel>Loading order details...</Panel></Container></PageWrap><Footer /></>;

  const hasCoords = order.pickup_latitude && order.dropoff_latitude;
  const pLat = parseFloat(order.pickup_latitude), pLng = parseFloat(order.pickup_longitude);
  const dLat = parseFloat(order.dropoff_latitude), dLng = parseFloat(order.dropoff_longitude);

  return (
    <>
      <RiderNav />
      <PageWrap>
        <Container>
          <BackBtn to="/rider/dashboard">← Back to Dashboard</BackBtn>

          {/* Order Header */}
          <Panel>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
              <h2 style={{margin:0}}>Order #{order.id}</h2>
              <Badge $s={order.status}>{statusLabels[order.status]}</Badge>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:20}}>
              <div><div style={{fontWeight:600,fontSize:'.82rem',color:'#999',marginBottom:4}}>Pickup</div><div>{order.pickup_address}</div></div>
              <div><div style={{fontWeight:600,fontSize:'.82rem',color:'#999',marginBottom:4}}>Drop-off</div><div>{order.dropoff_address}</div></div>
              {order.total_price && <div><div style={{fontWeight:600,fontSize:'.82rem',color:'#999',marginBottom:4}}>Price</div><div style={{fontWeight:700,fontSize:'1.1rem'}}>৳{order.total_price}</div></div>}
              {order.estimated_distance_km && <div><div style={{fontWeight:600,fontSize:'.82rem',color:'#999',marginBottom:4}}>Distance</div><div>{order.estimated_distance_km} km</div></div>}
              {order.user_name && <div><div style={{fontWeight:600,fontSize:'.82rem',color:'#999',marginBottom:4}}>Customer</div><div>{order.user_name}</div></div>}
              {order.assigned_to_name && <div><div style={{fontWeight:600,fontSize:'.82rem',color:'#999',marginBottom:4}}>Rider</div><div>{order.assigned_to_name}</div></div>}
            </div>

            {/* Items */}
            {(order.items?.length > 0 || order.items_description) && (
              <div style={{marginTop:16,padding:16,background:'#f8faf9',borderRadius:12}}>
                <div style={{fontWeight:600,marginBottom:8}}>📦 Items</div>
                {order.items?.length > 0
                  ? order.items.map(it => <div key={it.id} style={{color:'#555',fontSize:'.9rem'}}>• {it.name} x{it.quantity} {it.notes && `(${it.notes})`}</div>)
                  : <div style={{color:'#666'}}>{order.items_description}</div>}
              </div>
            )}

            {/* Actions */}
            <div style={{display:'flex',gap:8,marginTop:20,flexWrap:'wrap'}}>
              {order.status === 'pending' && <Btn onClick={() => callAction('accept')}>✓ Accept Order</Btn>}
              {order.status === 'assigned' && <><Btn $bg="#17a2b8" onClick={() => callAction('pickup')}>📦 Pick Up</Btn><Btn $bg="#6f42c1" onClick={() => callAction('start_transit')}>🚀 Start Transit</Btn></>}
              {order.status === 'picked_up' && <Btn $bg="#6f42c1" onClick={() => callAction('start_transit')}>🚀 Start Transit</Btn>}
              {order.status === 'in_transit' && <Btn $bg="#28a745" onClick={() => callAction('complete')}>✅ Mark Delivered</Btn>}
            </div>
          </Panel>

          {/* Status Timeline */}
          {order.status_history?.length > 0 && (
            <Panel>
              <h3 style={{margin:'0 0 16px'}}>📋 Tracking Timeline</h3>
              <div style={{paddingLeft:20,borderLeft:'3px solid #e0f0ee'}}>
                {order.status_history.map(h => (
                  <div key={h.id} style={{position:'relative',paddingLeft:20,paddingBottom:18}}>
                    <div style={{position:'absolute',left:-31,top:4,width:12,height:12,borderRadius:'50%',background:'#3CCFC4',border:'3px solid #e0f0ee'}}/>
                    <div style={{fontWeight:600,fontSize:'.9rem',color:'#333'}}>{statusLabels[h.status]||h.status}</div>
                    <div style={{fontSize:'.78rem',color:'#bbb'}}>{new Date(h.timestamp).toLocaleString()}</div>
                    {h.note && <div style={{fontSize:'.82rem',color:'#888',fontStyle:'italic'}}>{h.note}</div>}
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Map */}
          <Panel>
            <h3 style={{margin:'0 0 12px'}}>🗺️ Route</h3>
            {hasCoords ? (
              <div style={{borderRadius:12,overflow:'hidden'}}>
                <MapContainer center={[(pLat+dLat)/2,(pLng+dLng)/2]} zoom={13} style={{height:400,width:'100%'}}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[pLat,pLng]}><Popup>📍 Pickup</Popup></Marker>
                  <Marker position={[dLat,dLng]}><Popup>📍 Dropoff</Popup></Marker>
                  <Polyline positions={[[pLat,pLng],[dLat,dLng]]} color="#3CCFC4" weight={4} />
                </MapContainer>
              </div>
            ) : (
              <div style={{textAlign:'center',padding:40,color:'#999'}}>No coordinates available for map.</div>
            )}
          </Panel>

          {order.canceled_reason && (
            <Panel style={{background:'#fff3f3',border:'1px solid #ffd0d0'}}>
              <div style={{fontWeight:600,color:'#c44',marginBottom:4}}>Cancellation Reason</div>
              <div style={{color:'#666'}}>{order.canceled_reason}</div>
            </Panel>
          )}
        </Container>
      </PageWrap>
      <Footer />
    </>
  );
};

export default OrderDetails;
