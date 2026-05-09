import React from 'react';
import styled from 'styled-components';
import RiderNav from '../../components/RiderNav';
import Footer from '../../components/Footer';

const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 40px;
  font-family: 'Poppins', sans-serif;
`;

const Container = styled.div`
  padding: 40px;
  background-color: #f9f9f9;
  min-height: calc(100vh - 80px);
  font-family: 'Poppins', sans-serif;
`;

const RiderReports = () => {
    return (
        <>
            <RiderNav />
            <Container>
                <ReportGrid>
                    <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '15px' }}>
                        <h3>Weekly Earnings</h3>
                        <p>$0.00</p>
                    </div>
                    <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '15px' }}>
                        <h3>Completed Trips</h3>
                        <p>0</p>
                    </div>
                </ReportGrid>
            </Container>
            <Footer />
        </>
    );
};

export default RiderReports;