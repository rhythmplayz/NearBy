import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Poppins', sans-serif;
`;

const Panel = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Heading = styled.h2`
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  color: #0D0D0D;
`;

const SubHeading = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: Poppins, sans-serif;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #3CCFC4;
    box-shadow: 0 0 0 3px rgba(60, 207, 196, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: Poppins, sans-serif;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #3CCFC4;
    box-shadow: 0 0 0 3px rgba(60, 207, 196, 0.1);
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Button = styled.button`
  background: #3CCFC4;
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.3s;
  
  &:hover {
    background: #2ab9b1;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: #6c757d;
  
  &:hover {
    background: #5a6268;
  }
`;

const BreakdownContainer = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #3CCFC4;
`;

const BreakdownRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
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
  color: #0D0D0D;
  font-weight: 600;
  font-size: 0.95rem;
`;

const TotalRow = styled(BreakdownRow)`
  background: white;
  padding: 16px;
  margin-top: 8px;
  border-radius: 8px;
  border: 2px solid #3CCFC4;
  border-bottom: none;
`;

const FinalFare = styled.span`
  color: #3CCFC4;
  font-weight: 700;
  font-size: 1.3rem;
`;

const Alert = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.95rem;
  
  ${props => {
    if (props.type === 'error') {
      return `
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
      `;
    }
    if (props.type === 'success') {
      return `
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
      `;
    }
    return `
      background: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
    `;
  }}
`;

const Loading = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3CCFC4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PromoCodeContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const FareCalculator = () => {
  const [formData, setFormData] = useState({
    distance_km: '',
    duration_minutes: '',
    waiting_minutes: 0,
    ride_type: 'economy',
    promo_code: '',
    currency: 'USD',
  });

  const [useCoordinates, setUseCoordinates] = useState(false);
  const [coordinates, setCoordinates] = useState({
    pickup_latitude: '',
    pickup_longitude: '',
    dropoff_latitude: '',
    dropoff_longitude: '',
  });

  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [promoValid, setPromoValid] = useState(null);
  const [promoValidating, setPromoValidating] = useState(false);

  const token = localStorage.getItem('token');

  const apiHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setCoordinates({ ...coordinates, [name]: value });
  };

  const validatePromoCode = async () => {
    if (!formData.promo_code) {
      setPromoValid(null);
      return;
    }

    setPromoValidating(true);
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/fares/validate-promo/',
        {
          promo_code: formData.promo_code,
          ride_type: formData.ride_type,
          currency: formData.currency,
          subtotal: breakdown?.subtotal_after_surge || 0,
        },
        { headers: apiHeaders() }
      );

      setPromoValid({
        isValid: true,
        discount: response.data.data.discount_value,
        discountType: response.data.data.discount_type,
      });
    } catch (err) {
      setPromoValid({
        isValid: false,
        error: err.response?.data?.message || 'Invalid promo code',
      });
    } finally {
      setPromoValidating(false);
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        duration_minutes: parseInt(formData.duration_minutes),
        waiting_minutes: parseInt(formData.waiting_minutes || 0),
        ride_type: formData.ride_type,
        currency: formData.currency,
      };

      if (useCoordinates) {
        Object.assign(payload, {
          pickup_latitude: parseFloat(coordinates.pickup_latitude),
          pickup_longitude: parseFloat(coordinates.pickup_longitude),
          dropoff_latitude: parseFloat(coordinates.dropoff_latitude),
          dropoff_longitude: parseFloat(coordinates.dropoff_longitude),
        });
      } else {
        payload.distance_km = parseFloat(formData.distance_km);
      }

      if (formData.promo_code) {
        payload.promo_code = formData.promo_code;
      }

      const response = await axios.post(
        'http://127.0.0.1:8000/api/fares/calculate/',
        payload,
        { headers: apiHeaders() }
      );

      if (response.data.status === 'success') {
        setBreakdown(response.data.data);
        setPromoValid(null);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate fare');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      distance_km: '',
      duration_minutes: '',
      waiting_minutes: 0,
      ride_type: 'economy',
      promo_code: '',
      currency: 'USD',
    });
    setCoordinates({
      pickup_latitude: '',
      pickup_longitude: '',
      dropoff_latitude: '',
      dropoff_longitude: '',
    });
    setBreakdown(null);
    setError(null);
    setPromoValid(null);
  };

  return (
    <Container>
      <Panel>
        <Heading>🚗 Fare Calculator</Heading>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleCalculate}>
          {/* Location Input Selection */}
          <FormGroup>
            <Label>
              <input
                type="radio"
                checked={!useCoordinates}
                onChange={() => setUseCoordinates(false)}
                style={{ marginRight: '8px' }}
              />
              Use Distance (km)
            </Label>
            <Label style={{ marginTop: '8px' }}>
              <input
                type="radio"
                checked={useCoordinates}
                onChange={() => setUseCoordinates(true)}
                style={{ marginRight: '8px' }}
              />
              Use Coordinates (GPS)
            </Label>
          </FormGroup>

          {/* Distance or Coordinates */}
          {useCoordinates ? (
            <>
              <SubHeading>Pickup Location</SubHeading>
              <GridContainer>
                <FormGroup>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    name="pickup_latitude"
                    value={coordinates.pickup_latitude}
                    onChange={handleCoordinateChange}
                    placeholder="40.7128"
                    step="0.0001"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    name="pickup_longitude"
                    value={coordinates.pickup_longitude}
                    onChange={handleCoordinateChange}
                    placeholder="-74.0060"
                    step="0.0001"
                    required
                  />
                </FormGroup>
              </GridContainer>

              <SubHeading>Dropoff Location</SubHeading>
              <GridContainer>
                <FormGroup>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    name="dropoff_latitude"
                    value={coordinates.dropoff_latitude}
                    onChange={handleCoordinateChange}
                    placeholder="40.7580"
                    step="0.0001"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    name="dropoff_longitude"
                    value={coordinates.dropoff_longitude}
                    onChange={handleCoordinateChange}
                    placeholder="-73.9855"
                    step="0.0001"
                    required
                  />
                </FormGroup>
              </GridContainer>
            </>
          ) : (
            <FormGroup>
              <Label>Distance (km) *</Label>
              <Input
                type="number"
                name="distance_km"
                value={formData.distance_km}
                onChange={handleInputChange}
                placeholder="10.5"
                step="0.1"
                required
              />
            </FormGroup>
          )}

          {/* Trip Duration */}
          <FormGroup>
            <Label>Trip Duration (minutes) *</Label>
            <Input
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleInputChange}
              placeholder="25"
              required
            />
          </FormGroup>

          {/* Waiting Time */}
          <FormGroup>
            <Label>Waiting Time (minutes)</Label>
            <Input
              type="number"
              name="waiting_minutes"
              value={formData.waiting_minutes}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
            />
          </FormGroup>

          {/* Ride Type and Currency */}
          <GridContainer>
            <FormGroup>
              <Label>Ride Type</Label>
              <Select name="ride_type" value={formData.ride_type} onChange={handleInputChange}>
                <option value="economy">Economy</option>
                <option value="premium">Premium</option>
                <option value="shared">Shared</option>
                <option value="delivery">Delivery</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Currency</Label>
              <Select name="currency" value={formData.currency} onChange={handleInputChange}>
                <option value="USD">US Dollar</option>
                <option value="EUR">Euro</option>
                <option value="GBP">British Pound</option>
                <option value="INR">Indian Rupee</option>
                <option value="NGN">Nigerian Naira</option>
              </Select>
            </FormGroup>
          </GridContainer>

          {/* Promo Code */}
          <FormGroup>
            <Label>Promo Code (Optional)</Label>
            <PromoCodeContainer>
              <Input
                type="text"
                name="promo_code"
                value={formData.promo_code}
                onChange={handleInputChange}
                placeholder="SUMMER2024"
                style={{ flex: 1 }}
              />
              {formData.promo_code && (
                <SecondaryButton
                  type="button"
                  onClick={validatePromoCode}
                  disabled={promoValidating}
                >
                  {promoValidating ? <Loading /> : 'Validate'}
                </SecondaryButton>
              )}
            </PromoCodeContainer>
            {promoValid && (
              <Alert type={promoValid.isValid ? 'success' : 'error'}>
                {promoValid.isValid
                  ? `✓ Valid! ${promoValid.discount}% discount`
                  : `✗ ${promoValid.error}`}
              </Alert>
            )}
          </FormGroup>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <Button type="submit" disabled={loading}>
              {loading ? <Loading /> : 'Calculate Fare'}
            </Button>
            <SecondaryButton type="button" onClick={resetForm}>
              Reset
            </SecondaryButton>
          </div>
        </form>
      </Panel>

      {/* Fare Breakdown */}
      {breakdown && (
        <Panel>
          <Heading>Fare Breakdown</Heading>

          <BreakdownContainer>
            <BreakdownRow>
              <BreakdownLabel>Base Fare</BreakdownLabel>
              <BreakdownValue>
                {breakdown.currency} {parseFloat(breakdown.base_fare).toFixed(2)}
              </BreakdownValue>
            </BreakdownRow>

            <BreakdownRow>
              <BreakdownLabel>
                Distance Charge ({breakdown.distance_km} km)
              </BreakdownLabel>
              <BreakdownValue>
                {breakdown.currency} {parseFloat(breakdown.distance_charge).toFixed(2)}
              </BreakdownValue>
            </BreakdownRow>

            <BreakdownRow>
              <BreakdownLabel>
                Time Charge ({breakdown.duration_minutes} min)
              </BreakdownLabel>
              <BreakdownValue>
                {breakdown.currency} {parseFloat(breakdown.time_charge).toFixed(2)}
              </BreakdownValue>
            </BreakdownRow>

            {parseFloat(breakdown.waiting_charge) > 0 && (
              <BreakdownRow>
                <BreakdownLabel>
                  Waiting Charge ({breakdown.waiting_minutes} min)
                </BreakdownLabel>
                <BreakdownValue>
                  {breakdown.currency} {parseFloat(breakdown.waiting_charge).toFixed(2)}
                </BreakdownValue>
              </BreakdownRow>
            )}

            {breakdown.surge_multiplier > 1 && (
              <BreakdownRow>
                <BreakdownLabel>Surge Pricing (×{breakdown.surge_multiplier})</BreakdownLabel>
                <BreakdownValue style={{ color: '#ff6b6b' }}>
                  Applied
                </BreakdownValue>
              </BreakdownRow>
            )}

            <BreakdownRow>
              <BreakdownLabel>Subtotal (before discounts)</BreakdownLabel>
              <BreakdownValue>
                {breakdown.currency} {parseFloat(breakdown.subtotal_after_surge).toFixed(2)}
              </BreakdownValue>
            </BreakdownRow>

            {parseFloat(breakdown.total_discount) > 0 && (
              <BreakdownRow>
                <BreakdownLabel>
                  Discount {breakdown.promo_code && `(${breakdown.promo_code})`}
                </BreakdownLabel>
                <BreakdownValue style={{ color: '#51cf66' }}>
                  -{breakdown.currency} {parseFloat(breakdown.total_discount).toFixed(2)}
                </BreakdownValue>
              </BreakdownRow>
            )}

            {parseFloat(breakdown.tax_amount) > 0 && (
              <BreakdownRow>
                <BreakdownLabel>Tax ({breakdown.tax_rate}%)</BreakdownLabel>
                <BreakdownValue>
                  {breakdown.currency} {parseFloat(breakdown.tax_amount).toFixed(2)}
                </BreakdownValue>
              </BreakdownRow>
            )}

            <TotalRow>
              <BreakdownLabel style={{ fontSize: '1rem', fontWeight: '600' }}>
                Final Fare
              </BreakdownLabel>
              <FinalFare>
                {breakdown.currency} {parseFloat(breakdown.final_fare).toFixed(2)}
              </FinalFare>
            </TotalRow>
          </BreakdownContainer>

          <Alert type="success" style={{ marginTop: '16px' }}>
            💡 This is an estimated fare. Actual fare may vary based on traffic and route.
          </Alert>
        </Panel>
      )}
    </Container>
  );
};

export default FareCalculator;
