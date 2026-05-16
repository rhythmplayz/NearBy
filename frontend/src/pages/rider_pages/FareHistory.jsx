import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Poppins', sans-serif;
`;

const Heading = styled.h2`
  margin: 0 0 24px 0;
  font-size: 1.5rem;
  color: #0D0D0D;
`;

const Panel = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #3CCFC4 0%, #2ab9b1 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
`;

const TripsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TripCard = styled.div`
  background: #f8f9fa;
  border-left: 4px solid #3CCFC4;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const TripHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const TripRoute = styled.div`
  flex: 1;
`;

const TripFrom = styled.div`
  font-weight: 600;
  color: #0D0D0D;
  margin-bottom: 4px;
`;

const TripTo = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const TripFare = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #3CCFC4;
  text-align: right;
`;

const TripDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  font-size: 0.85rem;
  color: #666;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  
  ${props => {
    switch (props.status) {
      case 'completed':
        return `background: #d4edda; color: #155724;`;
      case 'in_progress':
        return `background: #cce5ff; color: #004085;`;
      case 'cancelled':
        return `background: #f8d7da; color: #721c24;`;
      default:
        return `background: #e2e3e5; color: #383d41;`;
    }
  }}
`;

const Alert = styled.div`
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  color: #666;
  background: #f8f9fa;
`;

const Loading = styled.div`
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3CCFC4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #0D0D0D;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
`;

const BreakdownRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const BreakdownLabel = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const BreakdownValue = styled.span`
  font-weight: 600;
  color: #0D0D0D;
`;

const FareHistory = () => {
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const token = localStorage.getItem('token');

  const apiHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!token) {
        setError('Please log in to view fare history');
        setLoading(false);
        return;
      }

      // Fetch trips
      const tripsRes = await axios.get(
        'http://127.0.0.1:8000/api/fares/history/',
        { headers: apiHeaders() }
      );

      // Fetch statistics
      const statsRes = await axios.get(
        'http://127.0.0.1:8000/api/fares/statistics/',
        { headers: apiHeaders() }
      );

      setTrips(tripsRes.data.results || tripsRes.data);
      if (statsRes.data.status === 'success') {
        setStats(statsRes.data.data);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fare history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Panel style={{ textAlign: 'center', padding: '60px 24px' }}>
          <Loading />
          <div style={{ marginTop: '16px', color: '#666' }}>Loading fare history...</div>
        </Panel>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Panel>
          <Alert>{error}</Alert>
        </Panel>
      </Container>
    );
  }

  return (
    <Container>
      <Heading>💰 Fare History & Statistics</Heading>

      {/* Statistics Cards */}
      {stats && stats.total_trips > 0 && (
        <StatsGrid>
          <StatCard>
            <StatLabel>Total Trips</StatLabel>
            <StatValue>{stats.total_trips}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Total Spent</StatLabel>
            <StatValue>${parseFloat(stats.total_fare_spent).toFixed(2)}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Average Fare</StatLabel>
            <StatValue>${parseFloat(stats.average_fare).toFixed(2)}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Total Distance</StatLabel>
            <StatValue>{parseFloat(stats.total_distance_km).toFixed(1)} km</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Total Saved</StatLabel>
            <StatValue>${parseFloat(stats.total_discount_applied).toFixed(2)}</StatValue>
          </StatCard>
        </StatsGrid>
      )}

      {/* Trips List */}
      <Panel>
        <Heading>Recent Trips</Heading>

        {trips.length === 0 ? (
          <Alert>No trips found. Book a ride to see your fare history here!</Alert>
        ) : (
          <TripsList>
            {trips.map((trip) => (
              <TripCard key={trip.id} onClick={() => setSelectedTrip(trip)}>
                <TripHeader>
                  <TripRoute>
                    <TripFrom>📍 {trip.pickup_address}</TripFrom>
                    <TripTo>➜ {trip.dropoff_address}</TripTo>
                  </TripRoute>
                  <TripFare>${parseFloat(trip.fare_breakdown?.final_fare || 0).toFixed(2)}</TripFare>
                </TripHeader>

                <TripDetails>
                  <DetailItem>
                    <span>📏</span>
                    <span>{parseFloat(trip.actual_distance_km || 0).toFixed(1)} km</span>
                  </DetailItem>
                  <DetailItem>
                    <span>⏱️</span>
                    <span>{trip.actual_duration_minutes || 0} min</span>
                  </DetailItem>
                  <DetailItem>
                    <span>🚗</span>
                    <span>{trip.ride_type.charAt(0).toUpperCase() + trip.ride_type.slice(1)}</span>
                  </DetailItem>
                  <DetailItem>
                    <StatusBadge status={trip.status}>
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </StatusBadge>
                  </DetailItem>
                  <DetailItem>
                    <span>📅</span>
                    <span>{new Date(trip.requested_at).toLocaleDateString()}</span>
                  </DetailItem>
                </TripDetails>
              </TripCard>
            ))}
          </TripsList>
        )}
      </Panel>

      {/* Detail Modal */}
      {selectedTrip && (
        <ModalOverlay onClick={() => setSelectedTrip(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Trip Details</ModalTitle>
              <CloseButton onClick={() => setSelectedTrip(null)}>×</CloseButton>
            </ModalHeader>

            <div>
              <h4>Route</h4>
              <BreakdownRow>
                <BreakdownLabel>From</BreakdownLabel>
                <BreakdownValue>{selectedTrip.pickup_address}</BreakdownValue>
              </BreakdownRow>
              <BreakdownRow>
                <BreakdownLabel>To</BreakdownLabel>
                <BreakdownValue>{selectedTrip.dropoff_address}</BreakdownValue>
              </BreakdownRow>

              <h4 style={{ marginTop: '16px' }}>Trip Information</h4>
              <BreakdownRow>
                <BreakdownLabel>Ride Type</BreakdownLabel>
                <BreakdownValue>{selectedTrip.ride_type}</BreakdownValue>
              </BreakdownRow>
              <BreakdownRow>
                <BreakdownLabel>Distance</BreakdownLabel>
                <BreakdownValue>
                  {parseFloat(selectedTrip.actual_distance_km || 0).toFixed(1)} km
                </BreakdownValue>
              </BreakdownRow>
              <BreakdownRow>
                <BreakdownLabel>Duration</BreakdownLabel>
                <BreakdownValue>
                  {selectedTrip.actual_duration_minutes || 0} minutes
                </BreakdownValue>
              </BreakdownRow>
              <BreakdownRow>
                <BreakdownLabel>Status</BreakdownLabel>
                <BreakdownValue>
                  <StatusBadge status={selectedTrip.status}>
                    {selectedTrip.status.charAt(0).toUpperCase() + selectedTrip.status.slice(1)}
                  </StatusBadge>
                </BreakdownValue>
              </BreakdownRow>
              <BreakdownRow>
                <BreakdownLabel>Date</BreakdownLabel>
                <BreakdownValue>
                  {new Date(selectedTrip.requested_at).toLocaleString()}
                </BreakdownValue>
              </BreakdownRow>

              {selectedTrip.fare_breakdown && (
                <>
                  <h4 style={{ marginTop: '16px' }}>Fare Breakdown</h4>
                  <BreakdownRow>
                    <BreakdownLabel>Base Fare</BreakdownLabel>
                    <BreakdownValue>
                      ${parseFloat(selectedTrip.fare_breakdown.base_fare).toFixed(2)}
                    </BreakdownValue>
                  </BreakdownRow>
                  <BreakdownRow>
                    <BreakdownLabel>Distance Charge</BreakdownLabel>
                    <BreakdownValue>
                      ${parseFloat(selectedTrip.fare_breakdown.distance_charge).toFixed(2)}
                    </BreakdownValue>
                  </BreakdownRow>
                  <BreakdownRow>
                    <BreakdownLabel>Time Charge</BreakdownLabel>
                    <BreakdownValue>
                      ${parseFloat(selectedTrip.fare_breakdown.time_charge).toFixed(2)}
                    </BreakdownValue>
                  </BreakdownRow>
                  {parseFloat(selectedTrip.fare_breakdown.total_discount) > 0 && (
                    <BreakdownRow>
                      <BreakdownLabel>Discount</BreakdownLabel>
                      <BreakdownValue style={{ color: '#51cf66' }}>
                        -${parseFloat(selectedTrip.fare_breakdown.total_discount).toFixed(2)}
                      </BreakdownValue>
                    </BreakdownRow>
                  )}
                  <BreakdownRow style={{ borderBottom: '2px solid #3CCFC4', paddingBottom: '12px' }}>
                    <BreakdownLabel style={{ fontWeight: '700' }}>Final Fare</BreakdownLabel>
                    <BreakdownValue style={{ color: '#3CCFC4', fontSize: '1.2rem' }}>
                      ${parseFloat(selectedTrip.fare_breakdown.final_fare).toFixed(2)}
                    </BreakdownValue>
                  </BreakdownRow>
                </>
              )}
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default FareHistory;
