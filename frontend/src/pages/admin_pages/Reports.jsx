import React from 'react';
import styled from 'styled-components';
import AdminNav from '../../components/AdminNav';

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 40px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  border-bottom: 4px solid #3CCFC4;
  h3 { font-size: 2rem; color: #3CCFC4; margin: 10px 0; }
`;

const AdminReports = () => {
    return (
        <>
            <AdminNav />
            <StatGrid>
                <StatCard>
                    <p>Total Users</p>
                    <h3>0</h3>
                </StatCard>
                <StatCard>
                    <p>Active Sellers</p>
                    <h3>0</h3>
                </StatCard>
                <StatCard>
                    <p>Total Deliveries</p>
                    <h3>0</h3>
                </StatCard>
            </StatGrid>
        </>
    );
};

export default AdminReports;