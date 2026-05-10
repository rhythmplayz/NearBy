import React from 'react';
import styled from 'styled-components';
import { 
  FaInfoCircle, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaBell, 
  FaBullhorn, 
  FaBox, 
  FaChartLine 
} from 'react-icons/fa';

const NotificationWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: ${({ $isRead }) => ($isRead ? 'rgba(255, 255, 255, 0.6)' : '#fff')};
  box-shadow: ${({ $isRead }) => ($isRead ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.05)')};
  border: 1px solid ${({ $isRead }) => ($isRead ? '#eee' : 'transparent')};
  border-left: 4px solid ${({ $color }) => $color};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }
`;

const IconWrapper = styled.div`
  font-size: 24px;
  color: ${({ $color }) => $color};
  margin-right: 16px;
  margin-top: 4px;
`;

const ContentWrapper = styled.div`
  flex: 1;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const Title = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: ${({ $isRead }) => ($isRead ? '500' : '700')};
  color: #333;
`;

const TimeText = styled.span`
  font-size: 12px;
  color: #888;
`;

const Message = styled.p`
  margin: 0;
  font-size: 14px;
  color: #555;
  line-height: 1.4;
`;

const getNotificationConfig = (type, priority) => {
  let config = { icon: <FaInfoCircle />, color: '#3498db' }; // Default INFO

  switch (type) {
    case 'SUCCESS':
      config = { icon: <FaCheckCircle />, color: '#2ecc71' };
      break;
    case 'WARNING':
      config = { icon: <FaExclamationTriangle />, color: '#f39c12' };
      break;
    case 'ERROR':
      config = { icon: <FaTimesCircle />, color: '#e74c3c' };
      break;
    case 'REMINDER':
      config = { icon: <FaBell />, color: '#9b59b6' };
      break;
    case 'SYSTEM':
    case 'COMMUNITY_UPDATE':
      config = { icon: <FaBullhorn />, color: '#1abc9c' };
      break;
    case 'ORDER_STATUS':
      config = { icon: <FaBox />, color: '#2980b9' };
      break;
    case 'STOCK_ALERT':
      config = { icon: <FaChartLine />, color: '#d35400' };
      break;
    case 'EMERGENCY':
      config = { icon: <FaExclamationTriangle />, color: '#c0392b' }; // Darker red for emergency
      break;
    default:
      break;
  }

  // Override color if high priority but keep the icon based on type
  if (priority === 'HIGH' && type !== 'EMERGENCY' && type !== 'ERROR') {
    config.color = '#e67e22'; // High priority orange
  }

  return config;
};

const NotificationItem = ({ notification, onMarkRead }) => {
  const { id, title, message, notification_type, priority, is_read, created_at } = notification;
  const config = getNotificationConfig(notification_type, priority);

  const date = new Date(created_at);
  const timeString = isNaN(date.getTime()) ? '' : date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <NotificationWrapper 
      $isRead={is_read} 
      $color={config.color}
      onClick={() => !is_read && onMarkRead && onMarkRead(id)}
      title={!is_read ? 'Click to mark as read' : ''}
    >
      <IconWrapper $color={config.color}>
        {config.icon}
      </IconWrapper>
      <ContentWrapper>
        <HeaderRow>
          <Title $isRead={is_read}>{title}</Title>
          <TimeText>{timeString}</TimeText>
        </HeaderRow>
        <Message>{message}</Message>
      </ContentWrapper>
    </NotificationWrapper>
  );
};

export default NotificationItem;
