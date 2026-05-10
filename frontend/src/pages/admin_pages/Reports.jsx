import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import AdminNav from '../../components/AdminNav';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 24px 40px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
`;

const Panel = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
`;

const Heading = styled.h3`
    margin: 0 0 12px 0;
    font-size: 1.1rem;
    color: #0D0D0D;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const Item = styled.li`
    display:flex;
    justify-content:space-between;
    padding: 14px 0;
    border-bottom: 1px solid #f6f6f6;
    align-items: flex-start;
`;

const Button = styled.button`
  background:#3CCFC4; border:none; color:white; padding:8px 12px; border-radius:8px; cursor:pointer;
`;

const AdminReportsContent = () => {
    const [riderReports, setRiderReports] = useState([]);
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState(null);
    const [adminResponses, setAdminResponses] = useState({});

    const token = localStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://127.0.0.1:8000';

    useEffect(()=>{
        fetchRiderReports();
        fetchVerifications();
    },[]);

    function apiHeaders(){
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    }

    const fetchRiderReports = async () => {
        const params = new URLSearchParams();
        if(search) params.append('search', search);
        if(statusFilter) params.append('status', statusFilter);
        if(page) params.append('page', page);
        try{
            if(!token){ navigate('/admin/login'); return; }
            const url = `${API_BASE}/api/riders/admin/reports/?` + params.toString();
            console.log('Fetching rider reports', url, apiHeaders());
            const res = await fetch(url, { headers: apiHeaders() });
            if(res.status === 401){ localStorage.removeItem('token'); navigate('/admin/login'); return; }
            if(res.ok){
                const data = await res.json();
                const list = data.results || data;
                setRiderReports(list);
                if(typeof data.count !== 'undefined') setTotal(data.count);
                const respMap = {};
                list.forEach(rr => { respMap[rr.id] = rr.admin_response || '' });
                setAdminResponses(respMap);
            } else {
                const text = await res.text();
                setError(`Failed to load rider reports: ${res.status} ${text}`);
                console.error('Rider reports error', res.status, text);
            }
        }catch(err){
            console.error('Fetch rider reports exception', err);
            setError('Network or runtime error fetching rider reports: ' + (err.message || err));
        }
    }

    const fetchVerifications = async () => {
        try{
            if(!token){ return; }
            const url = `${API_BASE}/api/verifications/admin/verifications/`;
            console.log('Fetching verifications', url, apiHeaders());
            const res = await fetch(url, { headers: apiHeaders() });
            if(res.status === 401){ localStorage.removeItem('token'); navigate('/admin/login'); return; }
            if(res.ok){
                const data = await res.json();
                setVerifications(data.results || data);
            } else {
                const text = await res.text();
                setError(`Failed to load verifications: ${res.status} ${text}`);
                console.error('Verifications error', res.status, text);
            }
        }catch(err){
            console.error('Fetch verifications exception', err);
            setError('Network or runtime error fetching verifications: ' + (err.message || err));
        }
    }

    const updateRiderReportStatus = async (id, status) => {
        setLoading(true);
        try{
            if(!token){ navigate('/admin/login'); return; }
            const url = `${API_BASE}/api/riders/admin/reports/${id}/status/`;
            console.log('PATCH status', url, apiHeaders(), { status });
            const res = await fetch(url, {
                method: 'PATCH',
                headers: apiHeaders(),
                body: JSON.stringify({ status })
            });
            if(res.status === 401){ localStorage.removeItem('token'); navigate('/admin/login'); return; }
            if(res.ok){
                await fetchRiderReports();
            } else {
                const err = await res.json();
                alert('Error: ' + (err.detail || 'failed'))
            }
        }catch(e){
            alert('Network error');
        }
        setLoading(false);
    }

    const saveAdminResponse = async (id, response) => {
        setLoading(true);
        try{
            if(!token){ navigate('/admin/login'); return; }
            const url = `${API_BASE}/api/riders/admin/reports/${id}/status/`;
            console.log('PATCH admin_response', url, apiHeaders(), { admin_response: response });
            const res = await fetch(url, {
                method: 'PATCH',
                headers: apiHeaders(),
                body: JSON.stringify({ admin_response: response })
            });
            if(res.status === 401){ localStorage.removeItem('token'); navigate('/admin/login'); return; }
            if(res.ok){
                await fetchRiderReports();
            } else {
                const err = await res.json();
                alert('Error: ' + (err.detail || 'failed'))
            }
        }catch(e){
            alert('Network error');
        }
        setLoading(false);
    }

    return (
        <>
            <AdminNav />
            <Container>
                {error ? (
                    <div style={{padding:40}}>
                        <h2 style={{color:'#D9534F'}}>Error loading admin reports</h2>
                        <pre style={{whiteSpace:'pre-wrap', background:'#fff3f3', padding:12, borderRadius:8, border:'1px solid #ffd1d1'}}>{error}</pre>
                        <div style={{marginTop:12}}>Check browser console and network tab for details.</div>
                    </div>
                ) : (
                <Grid>
                    <Panel style={{gridColumn: '1 / span 1'}}>
                        <Heading>Rider Reports</Heading>
                        <div style={{display:'flex', gap:8, marginBottom:12}}>
                            <input placeholder="Search title or description" value={search} onChange={(e)=>{setSearch(e.target.value); setPage(1);}} style={{flex:1,padding:8,borderRadius:8,border:'1px solid #eee'}} />
                            <select value={statusFilter} onChange={(e)=>{setStatusFilter(e.target.value); setPage(1);}} style={{padding:8,borderRadius:8}}>
                                <option value="">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                            <button onClick={()=>{setPage(1); fetchRiderReports();}} style={{padding:'8px 12px',borderRadius:8,background:'#3CCFC4',color:'#fff',border:'none'}}>Filter</button>
                        </div>

                        <List>
                            {riderReports.map(r=> (
                                <Item key={r.id}>
                                    <div style={{maxWidth: '70%'}}>
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                                            <strong style={{fontSize:'1rem'}}>{r.title}</strong>
                                            <div style={{fontSize:'0.75rem', color:'#999'}}>{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</div>
                                        </div>
                                        <div style={{marginTop:6, fontSize:'0.9rem', color:'#444'}}>{r.description}</div>
                                        <div style={{marginTop:8, fontSize:'0.8rem', color:'#666'}}>Reporter: {r.reporter ? (r.reporter.full_name || r.reporter.username) : r.reporter} {r.reporter ? `(${r.reporter.email || ''})` : ''} • Type: {r.report_type} • Assigned: {r.assigned_to || '—'}</div>

                                        {Array.isArray(r.attachments) && r.attachments.length > 0 && (
                                            <div style={{marginTop:10}}>
                                                <div style={{fontSize:'0.85rem', fontWeight:700, marginBottom:6}}>Attachments</div>
                                                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                                                    {r.attachments.map(att => {
                                                        const file = att && att.file ? att.file : '';
                                                        const url = file.startsWith('http') ? file : (file ? window.location.origin + file : '');
                                                        const isImage = file.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                                        return (
                                                            <div key={att.id} style={{background:'#fafafa', padding:8, borderRadius:8, border:'1px solid #f0f0f0'}}>
                                                                {isImage ? (
                                                                    <a href={url} target="_blank" rel="noreferrer"><img src={url} alt="att" style={{width:120, height:80, objectFit:'cover', borderRadius:6}}/></a>
                                                                ) : (
                                                                    <a href={url} target="_blank" rel="noreferrer" style={{color:'#0D6EFD'}}>Download</a>
                                                                )}
                                                                <div style={{fontSize:'0.7rem', color:'#888', marginTop:6}}>{att.uploaded_at ? new Date(att.uploaded_at).toLocaleString() : ''}</div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        <div style={{marginTop:10}}>
                                            <div style={{fontSize:'0.85rem', fontWeight:700, marginBottom:6}}>Admin Response</div>
                                            <textarea value={adminResponses[r.id] || ''} onChange={(e)=> setAdminResponses(prev=>({...prev, [r.id]: e.target.value}))} style={{width:'100%', minHeight:80, padding:8, borderRadius:8, border:'1px solid #eee'}} />
                                            <div style={{marginTop:8}}>
                                                <Button onClick={()=>{ const val = adminResponses[r.id] || ''; saveAdminResponse(r.id, val); }} disabled={loading}>Save Response</Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{display:'flex', gap:8, alignItems:'center'}}>
                                        <div style={{fontSize:'0.85rem', color:'#666'}}>Status</div>
                                        <select defaultValue={r.status} onChange={(e)=>updateRiderReportStatus(r.id, e.target.value)} disabled={loading}>
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                </Item>
                            ))}
                        </List>

                        <div style={{display:'flex', justifyContent:'space-between', marginTop:12, alignItems:'center'}}>
                            <div style={{color:'#666'}}>{total} results</div>
                            <div style={{display:'flex', gap:8}}>
                                <button onClick={()=>{ if(page>1){ setPage(p=>p-1); fetchRiderReports(); } }} disabled={page<=1} style={{padding:'6px 10px',borderRadius:6}}>Prev</button>
                                <div style={{padding:'6px 10px', background:'#f6f6f6', borderRadius:6}}>{page}</div>
                                <button onClick={()=>{ setPage(p=>p+1); fetchRiderReports(); }} style={{padding:'6px 10px',borderRadius:6}}>Next</button>
                            </div>
                        </div>
                    </Panel>

                    <Panel style={{gridColumn: '2 / span 1'}}>
                        <Heading>Seller Verification Requests</Heading>
                        <List>
                            {verifications.map(v=> (
                                <Item key={v.id}>
                                    <div>
                                        <strong>{v.seller_name || v.seller_email}</strong>
                                        <div style={{fontSize:'0.85rem', color:'#666', marginTop:6}}>Applied: {v.created_at ? new Date(v.created_at).toLocaleString() : ''}</div>
                                        <div style={{fontSize:'0.85rem', color:'#666', marginTop:6}}>Status: {v.verification_status}</div>
                                    </div>
                                    <div>
                                        <Button onClick={()=>navigate(`/admin/verifications/review/${v.id}`)}>Review</Button>
                                    </div>
                                </Item>
                            ))}
                        </List>
                    </Panel>
                </Grid>
                )}
            </Container>
        </>
    )
}

class ErrorBoundary extends React.Component {
    constructor(props){
        super(props);
        this.state = { hasError: false, error: null, info: null };
    }
    static getDerivedStateFromError(error){
        return { hasError: true, error };
    }
    componentDidCatch(error, info){
        this.setState({ error, info });
        console.error('AdminReports render error', error, info);
    }
    render(){
        if(this.state.hasError){
            return (
                <Container>
                    <h2 style={{color:'#D9534F'}}>A rendering error occurred in AdminReports</h2>
                    <pre style={{whiteSpace:'pre-wrap', background:'#fff3f3', padding:12, borderRadius:8, border:'1px solid #ffd1d1'}}>{String(this.state.error)}</pre>
                    <div style={{marginTop:12}}>Open console for stacktrace. The error has been logged.</div>
                </Container>
            )
        }
        return this.props.children;
    }
}

export default function AdminReports(){
    return (
        <ErrorBoundary>
            <AdminReportsContent />
        </ErrorBoundary>
    )
}