import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import RiderNav from '../../components/RiderNav';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 24px 40px;
`;

const Panel = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const List = styled.ul`
  list-style:none; padding:0; margin:0;
`;

const Item = styled.li`
  display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f0f0f0;
`;

const Button = styled.button`
  background:#3CCFC4; border:none; color:white; padding:8px 12px; border-radius:8px; cursor:pointer;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  margin-top: 4px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: Poppins, sans-serif;
  font-size: 0.95rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  margin-top: 4px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: Poppins, sans-serif;
  font-size: 0.95rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  margin-top: 4px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: Poppins, sans-serif;
  font-size: 0.95rem;
`;

const RiderReports = () => {
    const [title, setTitle] = useState('');
    const [reportType, setReportType] = useState('complaint');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [file, setFile] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(()=>{ fetchReports(); }, []);

    function apiHeaders(){
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    }

    const fetchReports = async () => {
        try {
            if(!token){
                navigate('/rider/login');
                return;
            }
            const res = await fetch('/api/riders/reports/', { headers: apiHeaders() });
            if(res.ok){
                const data = await res.json();
                setReports(data.results || data);
            } else {
                if(res.status === 401){
                    // token invalid or expired
                    localStorage.removeItem('token');
                    navigate('/rider/login');
                    return;
                }
                console.error('Failed to fetch reports:', res.status);
            }
        } catch (err) {
            console.error('Fetch reports error:', err);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = { title, report_type: reportType, description, location };
        try {
            if(!token){ navigate('/rider/login'); return; }
            const res = await fetch('/api/riders/reports/', { method:'POST', headers: apiHeaders(), body: JSON.stringify(payload) });
            const responseText = await res.text();
            
            if(res.ok){
                const created = JSON.parse(responseText);
                if(file){
                    const form = new FormData();
                    form.append('file', file);
                    await fetch(`/api/riders/reports/${created.id}/attachments/`, { method:'POST', headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }, body: form });
                }
                setTitle(''); setDescription(''); setLocation(''); setFile(null);
                fetchReports();
                alert('Report submitted successfully!');
            } else {
                try {
                    const err = JSON.parse(responseText);
                    alert('Failed: ' + (err.error || JSON.stringify(err)));
                } catch {
                    alert(`Failed with status ${res.status}: ${responseText}`);
                }
                console.error('Response:', res.status, responseText);
            }
        } catch (err) {
            alert('Error: ' + err.message);
            console.error('Submit error:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <RiderNav />
            <Container>
                <Panel>
                    <h3>Submit a Report</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{marginBottom:8}}>
                            <label><strong>Type</strong></label><br />
                            <Select value={reportType} onChange={e=>setReportType(e.target.value)}>
                                <option value="complaint">Complaint</option>
                                <option value="feedback">Feedback</option>
                                <option value="incident">Incident</option>
                                <option value="inquiry">Inquiry</option>
                            </Select>
                        </div>
                        <div style={{marginBottom:8}}>
                            <label><strong>Title</strong></label><br />
                            <Input value={title} onChange={e=>setTitle(e.target.value)} required />
                        </div>
                        <div style={{marginBottom:8}}>
                            <label><strong>Description</strong></label><br />
                            <Textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} required />
                        </div>
                        <div style={{marginBottom:8}}>
                            <label><strong>Location (optional)</strong></label><br />
                            <Input value={location} onChange={e=>setLocation(e.target.value)} />
                        </div>
                        <div style={{marginBottom:8}}>
                            <label><strong>Attachment (optional)</strong></label><br />
                            <Input type="file" onChange={e=>setFile(e.target.files[0])} />
                        </div>
                        <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</Button>
                    </form>
                </Panel>

                <Panel>
                    <h3>Your Reports</h3>
                    <List>
                        {reports.map(r=> (
                            <Item key={r.id}>
                                <div style={{maxWidth: '75%'}}>
                                    <strong>{r.title}</strong>
                                    <div style={{fontSize:'0.9rem', color:'#666'}}>{r.report_type} • {r.status} • {r.created_at ? new Date(r.created_at).toLocaleString() : ''}</div>
                                    <div style={{marginTop:6, color:'#333'}}>{r.description}</div>
                                    {Array.isArray(r.attachments) && r.attachments.length>0 && (
                                        <div style={{marginTop:8}}>
                                            {r.attachments.map(att => {
                                                const file = att && att.file ? att.file : '';
                                                const url = file.startsWith('http') ? file : (file ? window.location.origin + file : '');
                                                return file ? (<div key={att.id}><a href={url} target="_blank" rel="noreferrer">View attachment</a></div>) : null;
                                            })}
                                        </div>
                                    )}
                                    {r.admin_response ? (
                                        <div style={{marginTop:10, background:'#f8f9fa', padding:10, borderRadius:8, border:'1px solid #e9ecef'}}>
                                            <div style={{fontSize:'0.85rem', fontWeight:700, marginBottom:6}}>Admin Response</div>
                                            <div style={{whiteSpace:'pre-wrap', color:'#2c3e50'}}>{r.admin_response}</div>
                                        </div>
                                    ) : null}
                                </div>
                                <div>
                                    {/* status/actions column - reserved */}
                                </div>
                            </Item>
                        ))}
                    </List>
                </Panel>
            </Container>
            <Footer />
        </>
    );
};

export default RiderReports;