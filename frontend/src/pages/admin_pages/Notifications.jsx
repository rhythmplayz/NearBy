import React from 'react';
import AdminNav from '../../components/AdminNav';

const AdminNotifications = () => {
    return (
        <>
            <AdminNav />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ color: '#ccc' }}>No New Notifications</h2>
                    <p style={{ color: '#888' }}>Everything looks good!</p>
                </div>
            </div>
        </>
    );
};

export default AdminNotifications;