import React, { useState, useEffect, useMemo } from 'react';
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

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const PageWrapper = styled.div`
  background: linear-gradient(160deg, #f0faf8 0%, #e6f9f5 30%, #f2f2f2 70%, #e8fcf9 100%);
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px;
`;

const PageHeader = styled.div`
  margin-bottom: 36px;
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

const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 28px;
  align-items: start;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const CartItemsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CartItem = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  gap: 18px;
  align-items: center;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  transition: all 0.3s ease;
  animation: ${slideIn} 0.4s ease forwards;
  animation-delay: ${p => p.$delay || '0s'};
  opacity: 0;
  &:hover {
    box-shadow: 0 6px 24px rgba(31, 143, 135, 0.1);
    border-color: rgba(60, 207, 196, 0.2);
  }
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ItemImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 16px;
  background: ${p => p.$bg ? `url(${p.$bg}) center/cover no-repeat` : 'linear-gradient(135deg, #e8fcf9, #d5f5f0)'};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  @media (max-width: 600px) {
    width: 100%;
    height: 140px;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemSeller = styled.p`
  font-size: 0.78rem;
  color: #999;
  margin: 0 0 10px 0;
`;

const ItemPrice = styled.span`
  font-size: 1.1rem;
  font-weight: 800;
  color: #1F8F87;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  background: #f5f5f5;
  border-radius: 14px;
  overflow: hidden;
  border: 2px solid #e8e8e8;
`;

const QtyButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: #333;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &:hover {
    background: #3CCFC4;
    color: #fff;
  }
  &:disabled {
    color: #ccc;
    cursor: not-allowed;
    &:hover { background: transparent; color: #ccc; }
  }
`;

const QtyValue = styled.span`
  width: 44px;
  text-align: center;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1a1a1a;
`;

const RemoveButton = styled.button`
  padding: 8px 14px;
  border-radius: 12px;
  border: 2px solid #fecaca;
  background: rgba(254, 202, 202, 0.2);
  color: #dc2626;
  font-size: 0.78rem;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    background: #dc2626;
    color: #fff;
    border-color: #dc2626;
  }
`;

const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  @media (max-width: 600px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const LineTotal = styled.span`
  font-size: 1.15rem;
  font-weight: 800;
  color: #0D0D0D;
`;

/* --- Summary Panel --- */
const SummaryCard = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 24px;
  padding: 28px;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  position: sticky;
  top: 100px;
  animation: ${fadeIn} 0.6s ease;
`;

const SummaryTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid ${p => p.$bold ? 'transparent' : '#f0f0f0'};
  ${p => p.$bold && css`
    padding-top: 16px;
    margin-top: 8px;
    border-top: 2px solid #e0e0e0;
  `}
`;

const SummaryLabel = styled.span`
  font-size: ${p => p.$bold ? '1.05rem' : '0.9rem'};
  font-weight: ${p => p.$bold ? '800' : '500'};
  color: ${p => p.$bold ? '#0D0D0D' : '#666'};
`;

const SummaryValue = styled.span`
  font-size: ${p => p.$bold ? '1.25rem' : '0.95rem'};
  font-weight: ${p => p.$bold ? '800' : '600'};
  color: ${p => p.$bold ? '#1F8F87' : '#333'};
`;

const DeliveryInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 14px;
  font-size: 0.9rem;
  font-family: 'Poppins', sans-serif;
  margin: 12px 0;
  transition: all 0.3s;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #3CCFC4;
    box-shadow: 0 0 0 4px rgba(60, 207, 196, 0.1);
  }
  &::placeholder { color: #aaa; }
`;

const NoteInput = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 14px;
  font-size: 0.85rem;
  font-family: 'Poppins', sans-serif;
  resize: none;
  height: 70px;
  margin-bottom: 12px;
  transition: all 0.3s;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #3CCFC4;
    box-shadow: 0 0 0 4px rgba(60, 207, 196, 0.1);
  }
  &::placeholder { color: #aaa; }
`;

const PaymentSelect = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 14px;
  font-size: 0.9rem;
  font-family: 'Poppins', sans-serif;
  margin-bottom: 16px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #3CCFC4;
  }
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #3CCFC4, #1F8F87);
  color: #fff;
  font-size: 1.05rem;
  font-weight: 800;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(31, 143, 135, 0.35);
  }
  &:active { transform: scale(0.98); }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  animation: ${fadeIn} 0.6s ease;
  grid-column: 1 / -1;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
`;

const ContinueButton = styled.button`
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

const ErrorBanner = styled.div`
  background: rgba(254, 202, 202, 0.3);
  border: 1px solid #fca5a5;
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 16px;
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 600;
  animation: ${fadeIn} 0.3s ease;
`;

const SectionLabel = styled.label`
  font-size: 0.82rem;
  font-weight: 700;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: block;
`;

const TAX_RATE = 0.05;
const DELIVERY_FEE = 50.00;

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(() => {
        try { return JSON.parse(localStorage.getItem('nearby_cart') || '[]'); }
        catch { return []; }
    });
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [customerNote, setCustomerNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        localStorage.setItem('nearby_cart', JSON.stringify(cart));
    }, [cart]);

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.product_id === productId) {
                const newQty = Math.max(1, Math.min(item.quantity + delta, item.stock));
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeItem = (productId) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    const clearCart = () => setCart([]);

    const { subtotal, tax, total } = useMemo(() => {
        const sub = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const t = sub * TAX_RATE;
        return {
            subtotal: sub,
            tax: t,
            total: sub + t + (cart.length > 0 ? DELIVERY_FEE : 0),
        };
    }, [cart]);

    const placeOrder = async () => {
        setError('');
        if (cart.length === 0) {
            setError('Your cart is empty.');
            return;
        }
        if (!deliveryAddress.trim()) {
            setError('Please enter a delivery address.');
            return;
        }

        setPlacing(true);
        try {
            const payload = {
                items: cart.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                })),
                delivery_address: deliveryAddress.trim(),
                payment_method: paymentMethod,
                customer_note: customerNote.trim(),
            };

            const { data } = await axios.post(`${API}/api/orders/orders/place-order/`, payload, { headers });

            // Clear cart
            localStorage.removeItem('nearby_cart');
            setCart([]);

            // Navigate to confirmation with order data
            navigate('/user/order-confirmation', { state: { order: data.order } });
        } catch (err) {
            console.error('Order placement failed', err);
            const errData = err.response?.data;
            if (errData) {
                if (typeof errData === 'string') {
                    setError(errData);
                } else if (errData.items) {
                    const itemErrors = Array.isArray(errData.items)
                        ? errData.items.flat().join(' ')
                        : JSON.stringify(errData.items);
                    setError(itemErrors);
                } else if (errData.detail) {
                    setError(errData.detail);
                } else if (errData.non_field_errors) {
                    setError(errData.non_field_errors.join(' '));
                } else {
                    setError(Object.values(errData).flat().join(' '));
                }
            } else {
                setError('Failed to place order. Please try again.');
            }
        }
        setPlacing(false);
    };

    return (
        <>
            <UserMarketplaceNav />
            <PageWrapper>
                <ContentContainer>
                    <PageHeader>
                        <Title>🛒 Your Cart</Title>
                        <Subtitle>
                            {cart.length > 0
                                ? `${cart.length} item${cart.length > 1 ? 's' : ''} in your cart`
                                : 'Your cart is empty'}
                        </Subtitle>
                    </PageHeader>

                    {cart.length === 0 ? (
                        <EmptyState>
                            <EmptyIcon>🛒</EmptyIcon>
                            <h2 style={{ color: '#333', margin: '0 0 8px 0' }}>Your cart is empty</h2>
                            <p style={{ color: '#888' }}>Browse our marketplace and add products to get started</p>
                            <ContinueButton id="continue-shopping-btn" onClick={() => navigate('/user/shops')}>
                                Continue Shopping
                            </ContinueButton>
                        </EmptyState>
                    ) : (
                        <CartLayout>
                            <CartItemsSection>
                                {cart.map((item, index) => (
                                    <CartItem key={item.product_id} $delay={`${index * 0.08}s`}>
                                        <ItemImage $bg={item.image}>
                                            {!item.image && '📦'}
                                        </ItemImage>
                                        <ItemDetails>
                                            <ItemName>{item.name}</ItemName>
                                            <ItemSeller>🏪 {item.seller_name}</ItemSeller>
                                            <ItemPrice>৳{item.price.toFixed(2)}</ItemPrice>
                                        </ItemDetails>
                                        <ItemActions>
                                            <LineTotal>৳{(item.price * item.quantity).toFixed(2)}</LineTotal>
                                            <QuantityControls>
                                                <QtyButton
                                                    id={`qty-dec-${item.product_id}`}
                                                    onClick={() => updateQuantity(item.product_id, -1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    −
                                                </QtyButton>
                                                <QtyValue>{item.quantity}</QtyValue>
                                                <QtyButton
                                                    id={`qty-inc-${item.product_id}`}
                                                    onClick={() => updateQuantity(item.product_id, 1)}
                                                    disabled={item.quantity >= item.stock}
                                                >
                                                    +
                                                </QtyButton>
                                            </QuantityControls>
                                            <RemoveButton
                                                id={`remove-${item.product_id}`}
                                                onClick={() => removeItem(item.product_id)}
                                            >
                                                ✕ Remove
                                            </RemoveButton>
                                        </ItemActions>
                                    </CartItem>
                                ))}

                                <div style={{ textAlign: 'right', marginTop: 8 }}>
                                    <RemoveButton id="clear-cart-btn" onClick={clearCart} style={{ borderColor: '#e0e0e0', color: '#888' }}>
                                        Clear Cart
                                    </RemoveButton>
                                </div>
                            </CartItemsSection>

                            <SummaryCard>
                                <SummaryTitle>📋 Order Summary</SummaryTitle>

                                <SummaryRow>
                                    <SummaryLabel>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</SummaryLabel>
                                    <SummaryValue>৳{subtotal.toFixed(2)}</SummaryValue>
                                </SummaryRow>
                                <SummaryRow>
                                    <SummaryLabel>Tax (5%)</SummaryLabel>
                                    <SummaryValue>৳{tax.toFixed(2)}</SummaryValue>
                                </SummaryRow>
                                <SummaryRow>
                                    <SummaryLabel>Delivery Fee</SummaryLabel>
                                    <SummaryValue>৳{DELIVERY_FEE.toFixed(2)}</SummaryValue>
                                </SummaryRow>
                                <SummaryRow $bold>
                                    <SummaryLabel $bold>Total</SummaryLabel>
                                    <SummaryValue $bold>৳{total.toFixed(2)}</SummaryValue>
                                </SummaryRow>

                                <div style={{ marginTop: 20 }}>
                                    <SectionLabel>Delivery Address *</SectionLabel>
                                    <DeliveryInput
                                        id="delivery-address-input"
                                        placeholder="Enter your delivery address"
                                        value={deliveryAddress}
                                        onChange={e => setDeliveryAddress(e.target.value)}
                                    />
                                </div>

                                <SectionLabel>Special Instructions</SectionLabel>
                                <NoteInput
                                    id="customer-note-input"
                                    placeholder="Any special requests? (optional)"
                                    value={customerNote}
                                    onChange={e => setCustomerNote(e.target.value)}
                                />

                                <SectionLabel>Payment Method</SectionLabel>
                                <PaymentSelect
                                    id="payment-method-select"
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                >
                                    <option value="cod">💵 Cash on Delivery</option>
                                    <option value="online">💳 Online Payment</option>
                                </PaymentSelect>

                                {error && <ErrorBanner id="cart-error-banner">{error}</ErrorBanner>}

                                <CheckoutButton
                                    id="place-order-btn"
                                    onClick={placeOrder}
                                    disabled={placing || cart.length === 0}
                                >
                                    {placing ? (
                                        <>
                                            <Spinner /> Placing Order...
                                        </>
                                    ) : (
                                        <>🚀 Place Order — ৳{total.toFixed(2)}</>
                                    )}
                                </CheckoutButton>
                            </SummaryCard>
                        </CartLayout>
                    )}
                </ContentContainer>
            </PageWrapper>
            <Footer />
        </>
    );
};

export default Cart;