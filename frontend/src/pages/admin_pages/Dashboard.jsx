import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import NearByLogo from '../../assets/NearByLogo.png';

const Page = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(242, 226, 5, 0.18), transparent 25%),
    radial-gradient(circle at top right, rgba(60, 207, 196, 0.16), transparent 24%),
    linear-gradient(135deg, #f8f9fa 0%, #eefcfb 100%);
  font-family: 'Poppins', sans-serif;
`;

const Shell = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 34px 20px 48px;
`;

const Hero = styled.div`
  background: rgba(255, 255, 255, 0.92);
  border-radius: 34px;
  border: 1px solid rgba(13, 13, 13, 0.06);
  box-shadow: 0 18px 50px rgba(13, 13, 13, 0.08);
  padding: 32px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.2rem);
`;

const Subtitle = styled.p`
  margin: 14px 0 0;
  color: #5f666b;
  max-width: 70ch;
`;

const Grid = styled.div`
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.button`
  border: none;
  text-align: left;
  padding: 24px;
  border-radius: 28px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fffe 100%);
  box-shadow: 0 14px 30px rgba(13, 13, 13, 0.05);
  border: 1px solid rgba(60, 207, 196, 0.14);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 36px rgba(13, 13, 13, 0.08);
  }
`;

const CardTitle = styled.h2`
  margin: 12px 0 8px;
  font-size: 1.2rem;
`;

const CardText = styled.p`
  margin: 0;
  color: #5f666b;
`;

const Pill = styled.span`
  display: inline-flex;
  padding: 7px 11px;
  border-radius: 999px;
  background: ${(props) => props.$tone};
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <Shell>
        <Hero>
          <img src={NearByLogo} alt="NearBy" style={{ width: '84px' }} />
          <Pill $tone="#1f8f87" style={{ marginTop: '18px' }}>Operations Hub</Pill>
          <Title>Handle rider reports and seller verification requests.</Title>
          <Subtitle>
            Jump into the rider support inbox or review seller verification submissions to keep the marketplace safe and reliable.
          </Subtitle>

          <Grid>
            <Card onClick={() => navigate('/admin/rider-reports')}>
              <Pill $tone="#3ccfc4">Rider reports</Pill>
              <CardTitle>Review rider complaints and feedback</CardTitle>
              <CardText>Open the rider support queue, respond to issues, and resolve reports quickly.</CardText>
            </Card>

            <Card onClick={() => navigate('/admin/verify-requests')}>
              <Pill $tone="#f39c12">Seller verification</Pill>
              <CardTitle>Process verification requests</CardTitle>
              <CardText>Approve or reject submissions, and keep seller onboarding compliant.</CardText>
            </Card>
          </Grid>
        </Hero>
      </Shell>
      <Footer />
    </Page>
  );
};

export default AdminDashboard;
