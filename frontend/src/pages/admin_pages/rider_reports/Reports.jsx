import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../components/Footer';
import NearByLogo from '../../../assets/NearByLogo.png';

const slideIn = keyframes`
  from { transform: translateY(-12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Page = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(242, 226, 5, 0.18), transparent 26%),
    radial-gradient(circle at top right, rgba(60, 207, 196, 0.16), transparent 25%),
    linear-gradient(135deg, #f8f9fa 0%, #eefcfb 100%);
  color: #0d0d0d;
  font-family: 'Poppins', sans-serif;
`;

const Shell = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 20px 48px;
`;

const Hero = styled.div`
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(13, 13, 13, 0.06);
  box-shadow: 0 20px 50px rgba(13, 13, 13, 0.08);
  border-radius: 32px;
  padding: 28px;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
`;

const Subtitle = styled.p`
  margin: 12px 0 0;
  color: #5f666b;
  max-width: 80ch;
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 22px;

  @media (max-width: 1080px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(180deg, #ffffff 0%, #f7fffe 100%);
  border: 1px solid rgba(31, 143, 135, 0.12);
  border-radius: 24px;
  padding: 20px;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
`;

const StatLabel = styled.div`
  margin-top: 8px;
  color: #697177;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 20px;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  background: rgba(255, 255, 255, 0.94);
  border-radius: 30px;
  border: 1px solid rgba(13, 13, 13, 0.06);
  box-shadow: 0 20px 50px rgba(13, 13, 13, 0.08);
  padding: 24px;
`;

const PanelTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 1.2rem;
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
`;

const Th = styled.th`
  text-align: left;
  padding: 14px 12px;
  color: #1f8f87;
  border-bottom: 2px solid rgba(60, 207, 196, 0.16);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Td = styled.td`
  padding: 14px 12px;
  border-bottom: 1px solid rgba(13, 13, 13, 0.06);
  vertical-align: top;
  color: #3a4044;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: white;
  background: ${(props) => {
    if (props.$tone === 'resolved') return '#1f8f87';
    if (props.$tone === 'in_progress') return '#f39c12';
    if (props.$tone === 'pending') return '#2c7be5';
    return '#3ccfc4';
  }};
`;

const Select = styled.select`
  width: 100%;
  margin-bottom: 8px;
  border-radius: 14px;
  border: 1px solid rgba(13, 13, 13, 0.08);
  background: #f8fafb;
  padding: 11px 12px;
  outline: none;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 88px;
  border-radius: 14px;
  border: 1px solid rgba(13, 13, 13, 0.08);
  background: #f8fafb;
  padding: 11px 12px;
  resize: vertical;
  outline: none;
`;

const Button = styled.button`
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #3ccfc4, #1f8f87);
  color: white;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(31, 143, 135, 0.24);
`;

const Small = styled.p`
  margin: 8px 0 0;
  color: #697177;
  font-size: 0.88rem;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Chip = styled.span`
  padding: 10px 14px;
  border-radius: 999px;
  background: #f4fbfa;
  border: 1px solid rgba(60, 207, 196, 0.18);
  color: #1f8f87;
  font-weight: 700;
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

const AdminRiderReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', kind: 'success' });
  const [drafts, setDrafts] = useState({});

  const summary = useMemo(() => ({
    total: analytics?.summary?.total_reports || 0,
    open: analytics?.summary?.open_reports || 0,
    resolved: analytics?.summary?.resolved_reports || 0,
    averageResolution: analytics?.average_resolution_hours ?? 'n/a',
  }), [analytics]);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const [reportsResponse, analyticsResponse] = await Promise.all([
        axios.get(`${API_BASE}/admin/reports/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/admin/reports/analytics/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setReports(reportsResponse.data);
      setAnalytics(analyticsResponse.data);

      const nextDrafts = {};
      reportsResponse.data.forEach((report) => {
        nextDrafts[report.id] = {
          status: report.status,
          admin_response: report.admin_response || '',
        };
      });
      setDrafts(nextDrafts);
    } catch (error) {
      setToast({ show: true, message: 'Unable to load rider reports.', kind: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!toast.show) return undefined;
    const timer = setTimeout(() => setToast((current) => ({ ...current, show: false })), 3200);
    return () => clearTimeout(timer);
  }, [toast.show]);

  const updateDraft = (reportId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [reportId]: {
        ...current[reportId],
        [field]: value,
      },
    }));
  };

  const handleUpdate = async (reportId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(
        `${API_BASE}/admin/reports/${reportId}/status/`,
        drafts[reportId],
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setToast({ show: true, message: 'Report updated successfully.', kind: 'success' });
      await loadData();
    } catch (error) {
      setToast({ show: true, message: error.response?.data?.detail || 'Update failed.', kind: 'error' });
    }
  };

  return (
    <Page>
      {toast.show ? <Toast $kind={toast.kind}>{toast.message}</Toast> : null}
      <Shell>
        <Hero>
          <img src={NearByLogo} alt="NearBy" style={{ width: '84px' }} />
          <Title style={{ marginTop: '14px' }}>Rider support reports</Title>
          <Subtitle>
            Review rider complaints, respond with context, and update the lifecycle from pending to resolved.
          </Subtitle>

          <AnalyticsGrid>
            <StatCard>
              <StatValue>{summary.total}</StatValue>
              <StatLabel>Total reports</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{summary.open}</StatValue>
              <StatLabel>Open reports</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{summary.resolved}</StatValue>
              <StatLabel>Resolved reports</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{summary.averageResolution}</StatValue>
              <StatLabel>Average resolution hours</StatLabel>
            </StatCard>
          </AnalyticsGrid>
        </Hero>

        <Layout>
          <Panel>
            <PanelTitle>Queue</PanelTitle>
            <Small>Update status and add a response directly from the table. Changes will be reflected in the rider dashboard.</Small>

            {loading ? (
              <p style={{ marginTop: '18px' }}>Loading reports...</p>
            ) : (
              <TableWrap>
                <Table>
                  <thead>
                    <tr>
                      <Th>Rider</Th>
                      <Th>Report</Th>
                      <Th>Status</Th>
                      <Th>Response</Th>
                      <Th>Save</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <Td>
                          <strong>{report.rider_name}</strong>
                          <Small>@{report.rider_username}</Small>
                        </Td>
                        <Td>
                          <strong>{report.subject}</strong>
                          <Small>{report.report_type_label}</Small>
                          <Small>{new Date(report.submitted_at).toLocaleString()}</Small>
                          {report.location ? <Small>Location: {report.location}</Small> : null}
                          {report.attachment_url ? <Small><a href={report.attachment_url} target="_blank" rel="noreferrer">Attachment</a></Small> : null}
                        </Td>
                        <Td>
                          <Badge $tone={report.status}>{report.status_label}</Badge>
                          <div style={{ marginTop: '10px' }}>
                            <Select
                              value={drafts[report.id]?.status || report.status}
                              onChange={(event) => updateDraft(report.id, 'status', event.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In progress</option>
                              <option value="resolved">Resolved</option>
                            </Select>
                          </div>
                        </Td>
                        <Td>
                          <Textarea
                            value={drafts[report.id]?.admin_response || ''}
                            onChange={(event) => updateDraft(report.id, 'admin_response', event.target.value)}
                            placeholder="Add a response for the rider"
                          />
                        </Td>
                        <Td>
                          <Button onClick={() => handleUpdate(report.id)}>Save</Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>
            )}
          </Panel>

          <Panel>
            <PanelTitle>Issue mix</PanelTitle>
            <Small>Frequent issue categories help guide service fixes and operational follow-up.</Small>
            <ChipRow style={{ marginTop: '18px' }}>
              {analytics ? Object.entries(analytics.type_counts || {}).map(([type, count]) => (
                <Chip key={type}>{type.split('_').join(' ')}: {count}</Chip>
              )) : null}
            </ChipRow>

            <div style={{ marginTop: '24px' }}>
              <PanelTitle style={{ marginBottom: '10px' }}>Recent reports</PanelTitle>
              {(analytics?.recent_reports || []).map((report) => (
                <div key={report.id} style={{ padding: '14px 0', borderBottom: '1px solid rgba(13, 13, 13, 0.06)' }}>
                  <strong>{report.subject}</strong>
                  <Small>{report.rider_name} · {report.report_type_label}</Small>
                </div>
              ))}
            </div>
          </Panel>
        </Layout>
      </Shell>
      <Footer />
    </Page>
  );
};

export default AdminRiderReports;
