import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import RiderNav from '../../components/RiderNav';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';

const API = 'http://127.0.0.1:8000/api/riders/reports/';

const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;

const PageWrap = styled.div`
  background: linear-gradient(135deg, #f8fffe 0%, #e8f8f5 50%, #f2f2f2 100%);
  min-height: calc(100vh - 80px);
  font-family: 'Poppins', sans-serif;
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 20px;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  color: #1a1a2e;
  margin: 0 0 6px;
  animation: ${fadeIn} 0.4s ease;
`;

const Sub = styled.p`
  color: #888;
  margin: 0 0 28px;
  animation: ${fadeIn} 0.4s ease 0.05s both;
`;

const Panel = styled.div`
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
  animation: ${fadeIn} 0.4s ease 0.1s both;
`;

const PanelTitle = styled.h3`
  font-size: 1.15rem;
  color: #1a1a2e;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #444;
  font-size: 0.88rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8f0ef;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  color: #333;
  background: #fafcfb;
  outline: none;
  transition: all 0.2s ease;
  &:focus {
    border-color: #3CCFC4;
    background: white;
    box-shadow: 0 0 0 4px rgba(60, 207, 196, 0.08);
  }
  &::placeholder { color: #bbb; }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8f0ef;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  color: #333;
  background: #fafcfb;
  outline: none;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;
  &:focus {
    border-color: #3CCFC4;
    background: white;
    box-shadow: 0 0 0 4px rgba(60, 207, 196, 0.08);
  }
  &::placeholder { color: #bbb; }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8f0ef;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  color: #333;
  background: #fafcfb;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  &:focus {
    border-color: #3CCFC4;
    box-shadow: 0 0 0 4px rgba(60, 207, 196, 0.08);
  }
`;

const FileInput = styled.div`
  position: relative;
  label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #e8f8f5, #f0faf8);
    border: 2px dashed #b8e8e3;
    border-radius: 12px;
    cursor: pointer;
    font-size: 0.88rem;
    color: #3CCFC4;
    font-weight: 600;
    transition: all 0.2s;
    &:hover {
      background: linear-gradient(135deg, #d4f2ed, #e8f8f5);
      border-color: #3CCFC4;
    }
  }
  input { display: none; }
  span { font-size: 0.82rem; color: #888; margin-left: 12px; }
`;

const Btn = styled.button`
  background: ${p => p.$bg || '#3CCFC4'};
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(60, 207, 196, 0.3);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ReportCard = styled.div`
  background: #fafcfb;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.35s ease both;
  animation-delay: ${p => p.$i * 0.04}s;
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    border-color: rgba(60, 207, 196, 0.15);
  }
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
`;

const ReportTitle = styled.div`
  font-weight: 600;
  color: #1a1a2e;
  font-size: 1rem;
`;

const TypeBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${p => {
    const m = { complaint: '#fff3cd', feedback: '#d1ecf1', incident: '#f8d7da', inquiry: '#e2e3f1' };
    return m[p.$t] || '#f0f0f0';
  }};
  color: ${p => {
    const m = { complaint: '#856404', feedback: '#0c5460', incident: '#721c24', inquiry: '#383d6e' };
    return m[p.$t] || '#666';
  }};
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  background: ${p => {
    const m = { pending: '#fff3cd', resolved: '#d4edda', in_progress: '#cce5ff' };
    return m[p.$s] || '#f0f0f0';
  }};
  color: ${p => {
    const m = { pending: '#856404', resolved: '#155724', in_progress: '#004085' };
    return m[p.$s] || '#666';
  }};
`;

const ReportMeta = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 4px;
  flex-wrap: wrap;
`;

const ReportDesc = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-top: 10px;
  line-height: 1.6;
`;

const AdminResponse = styled.div`
  margin-top: 14px;
  background: white;
  padding: 14px 16px;
  border-radius: 12px;
  border-left: 4px solid #3CCFC4;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 50px 20px;
  color: #999;
`;

const SuccessBanner = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 14px 20px;
  border-radius: 14px;
  margin-bottom: 16px;
  animation: ${fadeIn} 0.3s ease;
`;

const ErrBanner = styled.div`
  background: #fff0f0;
  border: 1px solid #ffd0d0;
  color: #c00;
  padding: 14px 20px;
  border-radius: 14px;
  margin-bottom: 16px;
  animation: ${fadeIn} 0.3s ease;
`;

const RiderReports = () => {
    const [title, setTitle] = useState('');
    const [reportType, setReportType] = useState('complaint');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [file, setFile] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => { fetchReports(); }, []);

    const apiHeaders = () => ({
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });

    const fetchReports = async () => {
        try {
            if (!token) { navigate('/rider/login'); return; }
            const res = await fetch(API, { headers: apiHeaders() });
            if (res.ok) {
                const data = await res.json();
                setReports(data.results || data);
            } else {
                if (res.status === 401) { localStorage.removeItem('token'); navigate('/rider/login'); return; }
            }
        } catch (err) { console.error('Fetch reports error:', err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        const payload = { title, report_type: reportType, description, location };
        try {
            if (!token) { navigate('/rider/login'); return; }
            const res = await fetch(API, { method: 'POST', headers: apiHeaders(), body: JSON.stringify(payload) });
            const responseText = await res.text();

            if (res.ok) {
                const created = JSON.parse(responseText);
                if (file) {
                    const form = new FormData();
                    form.append('file', file);
                    await fetch(`${API}${created.id}/attachments/`, {
                        method: 'POST',
                        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                        body: form
                    });
                }
                setTitle(''); setDescription(''); setLocation(''); setFile(null);
                fetchReports();
                setSuccess('Report submitted successfully!');
                setTimeout(() => setSuccess(''), 4000);
            } else {
                try {
                    const err = JSON.parse(responseText);
                    setError(err.error || JSON.stringify(err));
                } catch {
                    setError(`Failed with status ${res.status}`);
                }
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <RiderNav />
            <PageWrap>
                <Container>
                    <Title>📝 Reports</Title>
                    <Sub>Submit reports and track their progress</Sub>

                    {success && <SuccessBanner>{success}</SuccessBanner>}
                    {error && <ErrBanner>{error} <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', float: 'right', fontSize: '1.1rem' }}>✕</button></ErrBanner>}

                    {/* Submit Report */}
                    <Panel>
                        <PanelTitle>📋 Submit a Report</PanelTitle>
                        <form onSubmit={handleSubmit}>
                            <FormGrid>
                                <FormGroup>
                                    <Label>Report Type</Label>
                                    <Select value={reportType} onChange={e => setReportType(e.target.value)}>
                                        <option value="complaint">Complaint</option>
                                        <option value="feedback">Feedback</option>
                                        <option value="incident">Incident</option>
                                        <option value="inquiry">Inquiry</option>
                                    </Select>
                                </FormGroup>
                                <FormGroup>
                                    <Label>Title</Label>
                                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief title for your report" required />
                                </FormGroup>
                            </FormGrid>

                            <FormGroup>
                                <Label>Description</Label>
                                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the issue in detail..." required />
                            </FormGroup>

                            <FormGrid>
                                <FormGroup>
                                    <Label>Location (optional)</Label>
                                    <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Where did this happen?" />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Attachment (optional)</Label>
                                    <FileInput>
                                        <label>
                                            📎 {file ? 'Change File' : 'Attach File'}
                                            <input type="file" onChange={e => setFile(e.target.files[0])} />
                                        </label>
                                        {file && <span>{file.name}</span>}
                                    </FileInput>
                                </FormGroup>
                            </FormGrid>

                            <Btn type="submit" disabled={loading}>
                                {loading ? 'Submitting...' : '🚀 Submit Report'}
                            </Btn>
                        </form>
                    </Panel>

                    {/* Report List */}
                    <Panel style={{ animationDelay: '0.2s' }}>
                        <PanelTitle>📂 Your Reports</PanelTitle>

                        {reports.length === 0 && (
                            <EmptyState>
                                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
                                <h3 style={{ color: '#555' }}>No reports yet</h3>
                                <p>You haven't submitted any reports.</p>
                            </EmptyState>
                        )}

                        {reports.map((r, i) => (
                            <ReportCard key={r.id} $i={i}>
                                <ReportHeader>
                                    <ReportTitle>{r.title}</ReportTitle>
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                        <TypeBadge $t={r.report_type}>{r.report_type}</TypeBadge>
                                        <StatusBadge $s={r.status}>{r.status}</StatusBadge>
                                    </div>
                                </ReportHeader>
                                <ReportMeta>
                                    <span style={{ fontSize: '.8rem', color: '#bbb' }}>🕐 {r.created_at ? new Date(r.created_at).toLocaleString() : ''}</span>
                                    {r.location && <span style={{ fontSize: '.8rem', color: '#bbb' }}>📍 {r.location}</span>}
                                </ReportMeta>
                                <ReportDesc>{r.description}</ReportDesc>

                                {Array.isArray(r.attachments) && r.attachments.length > 0 && (
                                    <div style={{ marginTop: 10 }}>
                                        {r.attachments.map(att => {
                                            const file = att && att.file ? att.file : '';
                                            const url = file.startsWith('http') ? file : (file ? 'http://127.0.0.1:8000' + file : '');
                                            return file ? (
                                                <a key={att.id} href={url} target="_blank" rel="noreferrer"
                                                   style={{ fontSize: '.85rem', color: '#3CCFC4', fontWeight: 600, textDecoration: 'none' }}>
                                                    📎 View attachment
                                                </a>
                                            ) : null;
                                        })}
                                    </div>
                                )}

                                {r.admin_response && (
                                    <AdminResponse>
                                        <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#3CCFC4', marginBottom: 6 }}>💬 Admin Response</div>
                                        <div style={{ whiteSpace: 'pre-wrap', color: '#444', fontSize: '.9rem', lineHeight: 1.6 }}>{r.admin_response}</div>
                                    </AdminResponse>
                                )}
                            </ReportCard>
                        ))}
                    </Panel>
                </Container>
            </PageWrap>
            <Footer />
        </>
    );
};

export default RiderReports;