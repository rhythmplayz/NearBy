import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import NearByLogo from '../../assets/NearByLogo.png';

const slideIn = keyframes`
  from { transform: translateY(-16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Page = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(242, 226, 5, 0.18), transparent 28%),
    radial-gradient(circle at top right, rgba(60, 207, 196, 0.16), transparent 26%),
    linear-gradient(135deg, #f8f9fa 0%, #eefcfb 100%);
  color: #0d0d0d;
  font-family: 'Poppins', sans-serif;
`;

const Shell = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px 48px;
`;

const Hero = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
  align-items: stretch;
  margin-bottom: 24px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const HeroCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(60, 207, 196, 0.16);
  box-shadow: 0 20px 50px rgba(13, 13, 13, 0.08);
  border-radius: 32px;
  padding: 28px;
  backdrop-filter: blur(10px);
`;

const Eyebrow = styled.p`
  margin: 0 0 10px;
  color: #1f8f87;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  font-weight: 700;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 1.02;
`;

const Subtitle = styled.p`
  margin: 14px 0 0;
  color: #5f666b;
  max-width: 62ch;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(180deg, #ffffff 0%, #f7fffe 100%);
  border-radius: 24px;
  padding: 22px;
  border: 1px solid rgba(31, 143, 135, 0.12);
  box-shadow: 0 14px 30px rgba(13, 13, 13, 0.05);
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #0d0d0d;
`;

const StatLabel = styled.div`
  margin-top: 8px;
  color: #697177;
  font-size: 0.92rem;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  background: rgba(255, 255, 255, 0.94);
  border-radius: 32px;
  border: 1px solid rgba(13, 13, 13, 0.06);
  box-shadow: 0 20px 50px rgba(13, 13, 13, 0.08);
  padding: 24px;
`;

const PanelTitle = styled.h2`
  margin: 0 0 10px;
  font-size: 1.25rem;
`;

const PanelNote = styled.p`
  margin: 0 0 18px;
  color: #697177;
  font-size: 0.95rem;
`;

const Form = styled.form`
  display: grid;
  gap: 14px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: grid;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  color: #1f8f87;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid rgba(13, 13, 13, 0.08);
  background: #f8fafb;
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 0.98rem;
  outline: none;

  &:focus {
    background: #fff;
    border-color: #3ccfc4;
    box-shadow: 0 0 0 4px rgba(60, 207, 196, 0.14);
  }
`;

const Select = styled.select`
  width: 100%;
  border: 1px solid rgba(13, 13, 13, 0.08);
  background: #f8fafb;
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 0.98rem;
  outline: none;

  &:focus {
    background: #fff;
    border-color: #3ccfc4;
    box-shadow: 0 0 0 4px rgba(60, 207, 196, 0.14);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 140px;
  resize: vertical;
  border: 1px solid rgba(13, 13, 13, 0.08);
  background: #f8fafb;
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 0.98rem;
  outline: none;

  &:focus {
    background: #fff;
    border-color: #3ccfc4;
    box-shadow: 0 0 0 4px rgba(60, 207, 196, 0.14);
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #3ccfc4, #1f8f87);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 10px 24px rgba(31, 143, 135, 0.28);

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const SecondaryButton = styled.button`
  border: 1px solid rgba(13, 13, 13, 0.1);
  border-radius: 999px;
  padding: 14px 20px;
  background: #fff;
  color: #0d0d0d;
  font-weight: 700;
  cursor: pointer;
`;

const ReportList = styled.div`
  display: grid;
  gap: 14px;
`;

const ReportCard = styled.div`
  border-radius: 24px;
  padding: 18px;
  border: 1px solid rgba(13, 13, 13, 0.08);
  background: linear-gradient(180deg, #ffffff 0%, #fbfffe 100%);
  animation: ${slideIn} 0.28s ease both;
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
`;

const ReportTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
`;

const Meta = styled.p`
  margin: 6px 0 0;
  color: #697177;
  font-size: 0.9rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #fff;
  background: ${(props) => {
    if (props.$tone === 'resolved') return '#1f8f87';
    if (props.$tone === 'in_progress') return '#f39c12';
    if (props.$tone === 'complaint' || props.$tone === 'safety_concern') return '#ff4d4d';
    if (props.$tone === 'feedback') return '#2c7be5';
    return '#3ccfc4';
  }};
`;

const Toast = styled.div`
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 1000;
  padding: 14px 18px;
  border-radius: 14px;
  color: white;
  font-weight: 700;
  background: ${(props) => (props.$kind === 'success' ? '#1f8f87' : '#ff4d4d')};
  box-shadow: 0 12px 26px rgba(13, 13, 13, 0.18);
  animation: ${slideIn} 0.25s ease both;
`;

const API_BASE = 'http://127.0.0.1:8000/api/riders';

const RiderDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', kind: 'success' });
  const [formData, setFormData] = useState({
    report_type: 'complaint',
    subject: '',
    description: '',
    location: '',
    attachment: null,
  });

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((report) => report.status === 'pending').length,
    resolved: reports.filter((report) => report.status === 'resolved').length,
  }), [reports]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/rider/login');
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await axios.get(`${API_BASE}/reports/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(response.data);
      } catch (error) {
        setToast({ show: true, message: 'Unable to load your reports.', kind: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [navigate]);

  useEffect(() => {
    if (!toast.show) return undefined;
    const timer = setTimeout(() => setToast((current) => ({ ...current, show: false })), 3200);
    return () => clearTimeout(timer);
  }, [toast.show]);

  const handleFileChange = (event) => {
    setFormData((current) => ({ ...current, attachment: event.target.files?.[0] || null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/rider/login');
      return;
    }

    setSubmitting(true);
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        payload.append(key, value);
      }
    });

    try {
      await axios.post(`${API_BASE}/reports/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setToast({ show: true, message: 'Report submitted. We will review it shortly.', kind: 'success' });
      setFormData({
        report_type: 'complaint',
        subject: '',
        description: '',
        location: '',
        attachment: null,
      });
      const response = await axios.get(`${API_BASE}/reports/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(response.data);
    } catch (error) {
      const message = error.response?.data?.detail || 'Submission failed. Please try again.';
      setToast({ show: true, message, kind: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      {toast.show ? <Toast $kind={toast.kind}>{toast.message}</Toast> : null}
      <Shell>
        <Hero>
          <HeroCard>
            <img src={NearByLogo} alt="NearBy" style={{ width: '88px', marginBottom: '18px' }} />
            <Eyebrow>Rider Support Center</Eyebrow>
            <Title>Submit issues, track responses, and keep every trip accountable.</Title>
            <Subtitle>
              Use this space for complaints, feedback, safety incidents, service delays, or app-related problems.
              Each report is tracked with status updates so you know what happens next.
            </Subtitle>
          </HeroCard>

          <StatGrid>
            <StatCard>
              <StatValue>{stats.total}</StatValue>
              <StatLabel>Total reports submitted</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.pending}</StatValue>
              <StatLabel>Still awaiting review</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.resolved}</StatValue>
              <StatLabel>Marked resolved</StatLabel>
            </StatCard>
          </StatGrid>
        </Hero>

        <Layout>
          <Panel>
            <PanelTitle>New report</PanelTitle>
            <PanelNote>
              Give a short subject, enough detail to act on, and attach evidence if relevant.
            </PanelNote>

            <Form onSubmit={handleSubmit}>
              <Row>
                <Field>
                  <Label htmlFor="report_type">Report type</Label>
                  <Select
                    id="report_type"
                    value={formData.report_type}
                    onChange={(event) => setFormData((current) => ({ ...current, report_type: event.target.value }))}
                    required
                  >
                    <option value="complaint">Complaint</option>
                    <option value="feedback">Feedback</option>
                    <option value="inquiry">Inquiry</option>
                    <option value="service_delay">Service Delay</option>
                    <option value="safety_concern">Safety Concern</option>
                    <option value="app_issue">App Issue</option>
                    <option value="other">Other</option>
                  </Select>
                </Field>

                <Field>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(event) => setFormData((current) => ({ ...current, subject: event.target.value }))}
                    placeholder="Short summary of the issue"
                    required
                  />
                </Field>
              </Row>

              <Field>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Explain what happened, when it happened, and any impact on your trip."
                  required
                />
              </Field>

              <Row>
                <Field>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))}
                    placeholder="Optional location reference"
                  />
                </Field>

                <Field>
                  <Label htmlFor="attachment">Attachment</Label>
                  <Input id="attachment" type="file" onChange={handleFileChange} />
                </Field>
              </Row>

              <ActionRow>
                <PrimaryButton type="submit" disabled={submitting}>
                  {submitting ? 'Submitting report...' : 'Submit report'}
                </PrimaryButton>
                <SecondaryButton type="button" onClick={() => navigate('/rider/login')}>
                  Back to login
                </SecondaryButton>
              </ActionRow>
            </Form>
          </Panel>

          <Panel>
            <PanelTitle>Report history</PanelTitle>
            <PanelNote>
              Follow the status of your requests and review any admin response in one place.
            </PanelNote>

            {loading ? (
              <p>Loading reports...</p>
            ) : reports.length === 0 ? (
              <p style={{ color: '#697177' }}>You have not submitted a report yet.</p>
            ) : (
              <ReportList>
                {reports.map((report) => (
                  <ReportCard key={report.id}>
                    <ReportHeader>
                      <div>
                        <ReportTitle>{report.subject}</ReportTitle>
                        <Meta>
                          {report.report_type_label} · {new Date(report.submitted_at).toLocaleString()}
                        </Meta>
                      </div>
                      <Badge $tone={report.status}>{report.status_label}</Badge>
                    </ReportHeader>
                    <Meta>{report.description}</Meta>
                    {report.location ? <Meta>Location: {report.location}</Meta> : null}
                    {report.admin_response ? (
                      <div style={{ marginTop: '12px', padding: '14px', borderRadius: '18px', background: '#f5fffd', border: '1px solid rgba(60, 207, 196, 0.18)' }}>
                        <strong style={{ display: 'block', marginBottom: '6px' }}>Admin response</strong>
                        <span style={{ color: '#45545a' }}>{report.admin_response}</span>
                      </div>
                    ) : null}
                    {report.attachment_url ? (
                      <Meta style={{ marginTop: '10px' }}>
                        Attachment: <a href={report.attachment_url} target="_blank" rel="noreferrer">Open file</a>
                      </Meta>
                    ) : null}
                  </ReportCard>
                ))}
              </ReportList>
            )}
          </Panel>
        </Layout>
      </Shell>
      <Footer />
    </Page>
  );
};

export default RiderDashboard;
