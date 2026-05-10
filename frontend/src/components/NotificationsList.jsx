import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import NotificationItem from './NotificationItem';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://127.0.0.1:8000';

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const MarkAllBtn = styled.button`
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  &:hover {
    text-decoration: underline;
  }
`;

const NotificationsList = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem('token') || localStorage.getItem('access_token');

    const fetchNotifications = async () => {
        try {
            const token = getToken();
            const res = await axios.get(`${API_BASE}/api/notifications/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.results || res.data);
        } catch (error) {
            console.error('Error fetching notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkRead = async (id) => {
        try {
            const token = getToken();
            await axios.patch(`${API_BASE}/api/notifications/${id}/mark_read/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, is_read: true } : notification));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = getToken();
            await axios.post(`${API_BASE}/api/notifications/mark_all_read/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    return (
        <div>
            <HeaderRow>
                <h2 style={{ margin: 0 }}>Notifications</h2>
                {notifications.some(n => !n.is_read) && (
                    <MarkAllBtn onClick={handleMarkAllRead}>Mark all as read</MarkAllBtn>
                )}
            </HeaderRow>
            
            {loading ? (
                <p>Loading...</p>
            ) : notifications.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>No notifications to display.</p>
            ) : (
                notifications.map(notification => (
                    <NotificationItem 
                        key={notification.id} 
                        notification={notification} 
                        onMarkRead={handleMarkRead} 
                    />
                ))
            )}
        </div>
    );
};

export default NotificationsList;
