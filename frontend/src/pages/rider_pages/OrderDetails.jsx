import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const Container = styled.div`
  padding: 24px;
  font-family: 'Poppins', sans-serif;
`;

const Panel = styled.div`
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;

const BackLink = styled(Link)`
  display:inline-block;
  margin-bottom:12px;
`;

// fix default marker icon paths in some bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const OrderDetails = ()=>{
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(()=>{
    const token = localStorage.getItem('token');
    axios.get(`http://127.0.0.1:8000/api/orders/${id}/`, { headers: { ...(token? {'Authorization': `Bearer ${token}`} : {}) } })
      .then(res=> setOrder(res.data))
      .catch(err=> setError(err.response?.data?.detail || 'Failed to load'))
  },[id]);

  if(error) return <Container><Panel>{error}</Panel></Container>
  if(!order) return <Container><Panel>Loading...</Panel></Container>

  const center = order.pickup_latitude && order.dropoff_latitude ? [(parseFloat(order.pickup_latitude)+parseFloat(order.dropoff_latitude))/2, (parseFloat(order.pickup_longitude)+parseFloat(order.dropoff_longitude))/2] : [0,0];

  const positions = order.pickup_latitude && order.dropoff_latitude ? [ [parseFloat(order.pickup_latitude), parseFloat(order.pickup_longitude)], [parseFloat(order.dropoff_latitude), parseFloat(order.dropoff_longitude)] ] : [];

  return (
    <Container>
      <BackLink to="/rider/dashboard">← Back to Dashboard</BackLink>
      <Panel>
        <h3>Order #{order.id}</h3>
        <p><strong>From:</strong> {order.pickup_address}</p>
        <p><strong>To:</strong> {order.dropoff_address}</p>
        <p><strong>Status:</strong> {order.status}</p>
      </Panel>

      <Panel style={{marginTop:12}}>
        <h4>Route</h4>
        {positions.length===2 ? (
          <MapContainer center={center} zoom={13} style={{height:400,width:'100%'}}> 
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={positions[0]}><Popup>Pickup</Popup></Marker>
            <Marker position={positions[1]}><Popup>Dropoff</Popup></Marker>
            <Polyline positions={positions} color="#3CCFC4" />
          </MapContainer>
        ) : (
          <div>No coordinates available for map.</div>
        )}
      </Panel>
    </Container>
  )
}

export default OrderDetails;
