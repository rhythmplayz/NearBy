import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import UserMarketplaceNav from '../../../components/UserMarketplaceNav';
import Footer from '../../../components/Footer';

const popIn = keyframes`
  0% { opacity: 0; transform: scale(0.7); }
  60% { transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const confetti = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
`;

const PageWrapper = styled.div`
  background: linear-gradient(160deg, #f0faf8 0%, #e6f9f5 30%, #f2f2f2 70%, #e8fcf9 100%);
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  position: relative;
  overflow: hidden;
`;

const ConfettiPiece = styled.div`
  position: fixed;
  top: -20px;
  width: ${p => p.$size || '10'}px;
  height: ${p => p.$size || '10'}px;
  background: ${p => p.$color};
  border-radius: ${p => p.$round ? '50%' : '2px'};
  animation: ${confetti} ${p => p.$dur || '3'}s ease-in forwards;
  animation-delay: ${p => p.$delay || '0'}s;
  left: ${p => p.$left}%;
  z-index: 1;
  opacity: 0.9;
`;

const ContentContainer = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 60px 24px 100px;
  position: relative;
  z-index: 2;
`;

const SuccessCard = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 32px;
  padding: 48px 40px;
  text-align: center;
  border: 1px solid rgba(60, 207, 196, 0.15);
  box-shadow: 0 8px 40px rgba(31, 143, 135, 0.08);
  animation: ${fadeIn} 0.6s ease;
`;

const SuccessIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 20px;
  animation: ${popIn} 0.6s ease 0.2s both;
`;

const SuccessTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1F8F87 0%, #3CCFC4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 10px 0;
  animation: ${fadeIn} 0.5s ease 0.3s both;
`;

const SuccessSubtitle = styled.p`
  color: #666;
  font-size: 1rem;
  margin: 0 0 32px 0;
  animation: ${fadeIn} 0.5s ease 0.4s both;
`;

const OrderRef = styled.div`
  background: linear-gradient(135deg, rgba(60, 207, 196, 0.08), rgba(31, 143, 135, 0.08));
  border: 2px dashed rgba(60, 207, 196, 0.4);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 28px;
  animation: ${fadeIn} 0.5s ease 0.5s both;
`;

const RefLabel = styled.p`
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  margin: 0 0 6px 0;
`;

const RefValue = styled.p`
  font-size: 2rem;
  font-weight: 900;
  color: #1F8F87;
  margin: 0;
  letter-spacing: 2px;
`;

const OrderDetails = styled.div`
  background: #fafafa;
  border-radius: 20px;
  padding: 24px;
  text-align: left;
  margin-bottom: 28px;
  animation: ${fadeIn} 0.5s ease 0.6s both;
`;

const DetailTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 800;
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  &:last-child { border-bottom: none; }
`;

const DetailLabel = styled.span`
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  color: #333;
`;

const ItemsList = styled.div`
  margin-bottom: 28px;
  text-align: left;
  animation: ${fadeIn} 0.5s ease 0.65s both;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #f9f9f9;
  border-radius: 12px;
  margin-bottom: 8px;
`;

const ItemName = styled.span`
  font-size: 0.88rem;
  font-weight: 600;
  color: #333;
`;

const ItemQty = styled.span`
  font-size: 0.82rem;
  color: #888;
  font-weight: 500;
`;

const ItemTotal = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  color: #1F8F87;
`;

const PricingSection = styled.div`
  background: #f9f9f9;
  border-radius: 20px;
  padding: 20px 24px;
  text-align: left;
  margin-bottom: 28px;
  animation: ${fadeIn} 0.5s ease 0.7s both;
`;

const PricingRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
`;

const PricingLabel = styled.span`
  font-size: 0.88rem;
  color: ${p => p.$bold ? '#0D0D0D' : '#666'};
  font-weight: ${p => p.$bold ? '800' : '500'};
`;

const PricingValue = styled.span`
  font-size: ${p => p.$bold ? '1.15rem' : '0.9rem'};
  color: ${p => p.$bold ? '#1F8F87' : '#333'};
  font-weight: ${p => p.$bold ? '800' : '600'};
`;

const TotalDivider = styled.div`
  height: 2px;
  background: #e0e0e0;
  margin: 10px 0;
`;

const DeliveryInfo = styled.div`
  background: linear-gradient(135deg, rgba(242, 226, 5, 0.06), rgba(60, 207, 196, 0.06));
  border: 1px solid rgba(242, 226, 5, 0.2);
  border-radius: 16px;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
  animation: ${fadeIn} 0.5s ease 0.75s both;
`;

const DeliveryIcon = styled.span`
  font-size: 1.8rem;
  animation: ${float} 2s ease-in-out infinite;
`;

const DeliveryText = styled.div`
  font-size: 0.88rem;
  color: #555;
  font-weight: 500;
  line-height: 1.5;
  strong { color: #333; }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  animation: ${fadeIn} 0.5s ease 0.8s both;
`;

const PrimaryButton = styled.button`
  padding: 15px 32px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #3CCFC4, #1F8F87);
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(31, 143, 135, 0.35);
  }
`;

const SecondaryButton = styled.button`
  padding: 15px 32px;
  border-radius: 16px;
  border: 2px solid #e0e0e0;
  background: rgba(255,255,255,0.9);
  color: #555;
  font-weight: 700;
  font-size: 0.95rem;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    border-color: #3CCFC4;
    color: #1F8F87;
    transform: translateY(-2px);
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(242, 226, 5, 0.15);
  color: #b8860b;
  border: 1px solid rgba(242, 226, 5, 0.3);
`;

const confettiColors = ['#3CCFC4', '#1F8F87', '#F2E205', '#8DF2E8', '#ff6b6b', '#feca57', '#48dbfb'];

const OrderConfirmation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const order = location.state?.order;

    useEffect(() => {
        if (!order) {
            navigate('/user/shops', { replace: true });
        }
    }, [order, navigate]);

    if (!order) return null;

    const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 8 + 6,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        dur: Math.random() * 2 + 2.5,
        delay: Math.random() * 1.5,
        round: Math.random() > 0.5,
    }));

    return (
        <>
            <UserMarketplaceNav />
            <PageWrapper>
                {confettiPieces.map(p => (
                    <ConfettiPiece
                        key={p.id}
                        $left={p.left}
                        $size={p.size}
                        $color={p.color}
                        $dur={`${p.dur}`}
                        $delay={`${p.delay}`}
                        $round={p.round}
                    />
                ))}

                <ContentContainer>
                    <SuccessCard>
                        <SuccessIcon>✅</SuccessIcon>
                        <SuccessTitle>Order Placed Successfully!</SuccessTitle>
                        <SuccessSubtitle>
                            Thank you for your order. We're getting it ready for you.
                        </SuccessSubtitle>

                        <OrderRef>
                            <RefLabel>Order Reference</RefLabel>
                            <RefValue>#{String(order.id).padStart(6, '0')}</RefValue>
                        </OrderRef>

                        {/* Order Items */}
                        {order.items && order.items.length > 0 && (
                            <ItemsList>
                                <DetailTitle>📦 Order Items</DetailTitle>
                                {order.items.map((item, idx) => (
                                    <ItemRow key={idx}>
                                        <div>
                                            <ItemName>{item.name}</ItemName>
                                            <ItemQty> × {item.quantity}</ItemQty>
                                        </div>
                                        <ItemTotal>৳{parseFloat(item.total_price).toFixed(2)}</ItemTotal>
                                    </ItemRow>
                                ))}
                            </ItemsList>
                        )}

                        {/* Pricing Breakdown */}
                        <PricingSection>
                            <DetailTitle>💰 Pricing Breakdown</DetailTitle>
                            <PricingRow>
                                <PricingLabel>Subtotal</PricingLabel>
                                <PricingValue>৳{parseFloat(order.subtotal).toFixed(2)}</PricingValue>
                            </PricingRow>
                            <PricingRow>
                                <PricingLabel>Tax ({parseFloat(order.tax_rate)}%)</PricingLabel>
                                <PricingValue>৳{parseFloat(order.tax_amount).toFixed(2)}</PricingValue>
                            </PricingRow>
                            <PricingRow>
                                <PricingLabel>Delivery Fee</PricingLabel>
                                <PricingValue>৳{parseFloat(order.delivery_fee).toFixed(2)}</PricingValue>
                            </PricingRow>
                            <TotalDivider />
                            <PricingRow>
                                <PricingLabel $bold>Total Paid</PricingLabel>
                                <PricingValue $bold>৳{parseFloat(order.total_price).toFixed(2)}</PricingValue>
                            </PricingRow>
                        </PricingSection>

                        {/* Order Details */}
                        <OrderDetails>
                            <DetailTitle>📋 Order Details</DetailTitle>
                            <DetailRow>
                                <DetailLabel>Status</DetailLabel>
                                <StatusBadge>{order.status}</StatusBadge>
                            </DetailRow>
                            <DetailRow>
                                <DetailLabel>Payment</DetailLabel>
                                <DetailValue>{order.payment_method === 'cod' ? '💵 Cash on Delivery' : '💳 Online'}</DetailValue>
                            </DetailRow>
                            <DetailRow>
                                <DetailLabel>Delivery To</DetailLabel>
                                <DetailValue>{order.dropoff_address}</DetailValue>
                            </DetailRow>
                            {order.seller_name && (
                                <DetailRow>
                                    <DetailLabel>Seller</DetailLabel>
                                    <DetailValue>🏪 {order.seller_name}</DetailValue>
                                </DetailRow>
                            )}
                            {order.customer_note && (
                                <DetailRow>
                                    <DetailLabel>Note</DetailLabel>
                                    <DetailValue>{order.customer_note}</DetailValue>
                                </DetailRow>
                            )}
                            <DetailRow>
                                <DetailLabel>Ordered At</DetailLabel>
                                <DetailValue>{new Date(order.created_at).toLocaleString()}</DetailValue>
                            </DetailRow>
                        </OrderDetails>

                        <DeliveryInfo>
                            <DeliveryIcon>🚀</DeliveryIcon>
                            <DeliveryText>
                                <strong>Estimated Delivery:</strong> Your order will be prepared and delivered soon.
                                A rider will be assigned shortly. You'll receive notifications for status updates.
                            </DeliveryText>
                        </DeliveryInfo>

                        <ButtonGroup>
                            <PrimaryButton id="continue-shopping-btn" onClick={() => navigate('/user/shops')}>
                                Continue Shopping
                            </PrimaryButton>
                            <SecondaryButton id="view-orders-btn" onClick={() => navigate('/user/my-orders')}>
                                View My Orders
                            </SecondaryButton>
                        </ButtonGroup>
                    </SuccessCard>
                </ContentContainer>
            </PageWrapper>
            <Footer />
        </>
    );
};

export default OrderConfirmation;
