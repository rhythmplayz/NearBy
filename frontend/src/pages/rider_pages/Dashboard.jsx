import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import RiderNav from '../../components/RiderNav';
import Footer from '../../components/Footer';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// fix default marker icon paths
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const Container = styled.div`
    padding: 24px;
    background-color: #f9f9f9;
    min-height: calc(100vh - 80px);
    font-family: 'Poppins', sans-serif;
`;

const Panel = styled.div`
    background: white;
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;

const OrderRow = styled.div`
    display:flex;
    justify-content:space-between;
    gap:12px;
    align-items:center;
    padding:12px 0;
    border-bottom:1px solid #eee;
`;

const Button = styled.button`
    background:#3CCFC4;
    color:white;
    border:none;
    padding:8px 12px;
    border-radius:6px;
    cursor:pointer;
    &:disabled{opacity:0.6}
`;

function parseJwt(token){
    if(!token) return null;
    try{
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')));
        return decoded;
    }catch(e){return null}
}

const RiderDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const socketsRef = useRef({});

    const token = localStorage.getItem('token');

    const apiHeaders = () => ({
        'Content-Type':'application/json',
        ...(token? {'Authorization': `Bearer ${token}`} : {}),
    });

    useEffect(()=>{
        fetchOrders();
        return ()=>{
            // cleanup sockets
            Object.values(socketsRef.current).forEach(s=>{try{s.close()}catch(e){}})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const fetchOrders = async ()=>{
        setLoading(true);
        try{
            const res = await axios.get('http://127.0.0.1:8000/api/orders/', { headers: apiHeaders() });
            const data = res.data.results || res.data;
            setOrders(data);
            // open websockets for each order
            data.forEach(openOrderSocket);
            setError(null);
        }catch(err){
            setError(err.response?.data?.detail || 'Failed to load orders');
        }finally{setLoading(false)}
    }

    const openOrderSocket = (order) =>{
        const orderId = order.id;
        if(socketsRef.current[orderId]) return;
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.hostname || '127.0.0.1';
        const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '8000');
        const tokenParam = token ? `?token=${token}` : '';
        const url = `${protocol}://${host}:${port}/ws/orders/${orderId}/${token? `?token=${token}` : ''}`;
        try{
            const ws = new WebSocket(url);
            ws.onmessage = (evt)=>{
                try{
                    const msg = JSON.parse(evt.data);
                    if(msg.type === 'order.update' && msg.data){
                        setOrders(prev=> prev.map(o=> o.id===msg.data.id ? msg.data : o));
                    }

                    const openDetails = (order) => {
                        setSelectedOrder(order);
                        openOrderSocket(order);
                    }

                    const closeDetails = () => setSelectedOrder(null);
                }catch(e){console.error(e)}
            }
            ws.onclose = ()=>{ delete socketsRef.current[orderId]; }
            socketsRef.current[orderId] = ws;
        }catch(e){console.warn('ws failed', e)}
    }

    const callAction = async (orderId, action) =>{
        try{
            const res = await axios.post(`http://127.0.0.1:8000/api/orders/${orderId}/${action}/`, {}, { headers: apiHeaders() });
            const updated = res.data;
            setOrders(prev=> prev.map(o=> o.id===updated.id ? updated : o));
        }catch(err){
            console.error(err);
            setError(err.response?.data?.detail || 'Action failed');
        }
    }

    if(loading) return (
        <>
            <RiderNav />
            <Container><Panel>Loading orders...</Panel></Container>
            <Footer />
        </>
    )

    return (
        <>
            <RiderNav />
            <Container>
                <h1>Rider Dashboard</h1>
                {error && <Panel style={{color:'red'}}>{error}</Panel>}

                <Panel>
                    <h3>Active Assignments</h3>
                    {orders.length===0 && <div>No active orders</div>}
                    {orders.map(order=> (
                        <OrderRow key={order.id} onClick={()=>openDetails(order)} style={{cursor:'pointer'}}>
                            <div style={{flex:1}}>
                                <div><strong>#{order.id}</strong> — {order.pickup_address} → {order.dropoff_address}</div>
                                <div style={{color:'#666', fontSize:12}}>Status: {order.status} {order.assigned_to ? `(assigned: ${order.assigned_to})` : ''}</div>
                            </div>
                            <div style={{display:'flex', gap:8}}>
                                {order.status === 'pending' && (
                                    <Button onClick={(e)=>{e.stopPropagation(); callAction(order.id, 'accept')}}>Accept</Button>
                                )}
                                {order.status === 'assigned' && (
                                    <>
                                        <Button onClick={(e)=>{e.stopPropagation(); callAction(order.id, 'pickup')}}>Pick up</Button>
                                        <Button onClick={(e)=>{e.stopPropagation(); callAction(order.id, 'start_transit')}}>Start transit</Button>
                                    </>
                                )}
                                {order.status === 'in_transit' && (
                                    <Button onClick={(e)=>{e.stopPropagation(); callAction(order.id, 'complete')}}>Mark delivered</Button>
                                )}
                            </div>
                        </OrderRow>
                    ))}
                </Panel>
                {/* Details Modal */}
                {selectedOrder && (
                    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000}} onClick={closeDetails}>
                        <div style={{background:'white',width:'90%',maxWidth:800,borderRadius:10,overflow:'hidden'}} onClick={(e)=>e.stopPropagation()}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:12,borderBottom:'1px solid #eee'}}>
                                <h3 style={{margin:0}}>Order #{selectedOrder.id} Details</h3>
                                <button onClick={closeDetails} style={{background:'transparent',border:'none',fontSize:20,cursor:'pointer'}}>×</button>
                            </div>
                            <div style={{display:'flex',gap:12}}>
                                <div style={{flex:1,padding:12}}>
                                    <p><strong>From:</strong> {selectedOrder.pickup_address}</p>
                                    <p><strong>To:</strong> {selectedOrder.dropoff_address}</p>
                                    <p><strong>Status:</strong> {selectedOrder.status}</p>
                                    <p><strong>Items:</strong> {selectedOrder.items?.map(i=> `${i.name} x${i.quantity}`).join(', ') || selectedOrder.items_description || '—'}</p>
                                    <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}>
                                        {selectedOrder.status === 'pending' && <Button onClick={()=>callAction(selectedOrder.id, 'accept')}>Accept</Button>}
                                        {selectedOrder.status === 'assigned' && <Button onClick={()=>callAction(selectedOrder.id, 'pickup')}>Pick up</Button>}
                                        {selectedOrder.status === 'in_transit' && <Button onClick={()=>callAction(selectedOrder.id, 'complete')}>Mark delivered</Button>}
                                        <Link to={`/rider/order/${selectedOrder.id}`} style={{textDecoration:'none'}}>
                                            <Button style={{background:'#6c757d'}}>Open page</Button>
                                        </Link>
                                    </div>
                                </div>
                                <div style={{width:360,height:300}}>
                                    {selectedOrder.pickup_latitude && selectedOrder.dropoff_latitude ? (
                                        <MapContainer center={[(parseFloat(selectedOrder.pickup_latitude)+parseFloat(selectedOrder.dropoff_latitude))/2, (parseFloat(selectedOrder.pickup_longitude)+parseFloat(selectedOrder.dropoff_longitude))/2]} zoom={13} style={{height:'100%',width:'100%'}}>
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <Marker position={[parseFloat(selectedOrder.pickup_latitude), parseFloat(selectedOrder.pickup_longitude)]}>
                                                <Popup>Pickup</Popup>
                                            </Marker>
                                            <Marker position={[parseFloat(selectedOrder.dropoff_latitude), parseFloat(selectedOrder.dropoff_longitude)]}>
                                                <Popup>Dropoff</Popup>
                                            </Marker>
                                            <Polyline positions={[[parseFloat(selectedOrder.pickup_latitude), parseFloat(selectedOrder.pickup_longitude)],[parseFloat(selectedOrder.dropoff_latitude), parseFloat(selectedOrder.dropoff_longitude)]]} color="#3CCFC4" />
                                        </MapContainer>
                                    ) : (
                                        <div style={{padding:12}}>No coordinates available for map.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Container>
            <Footer />
        </>
    )
}

export default RiderDashboard;