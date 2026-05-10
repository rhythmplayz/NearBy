import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import AdminNav from '../../components/AdminNav';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  min-height: calc(100vh - 80px);
  padding: 28px;
  background:
    radial-gradient(circle at top left, rgba(60, 207, 196, 0.14), transparent 28%),
    linear-gradient(180deg, #f6fbfb 0%, #eef6f6 100%);
  font-family: 'Poppins', sans-serif;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Shell = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  gap: 20px;
`;

const Hero = styled.section`
  background: linear-gradient(135deg, #0f3b45 0%, #155e67 48%, #3ccfc4 100%);
  color: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 20px 60px rgba(12, 52, 58, 0.16);
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-end;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeroCopy = styled.div`
  max-width: 720px;
`;

const Eyebrow = styled.div`
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.72);
  margin-bottom: 10px;
`;

const Heading = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.25rem);
  line-height: 1.05;
  font-weight: 800;
`;

const Subtitle = styled.p`
  margin: 12px 0 0;
  max-width: 62ch;
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.86);
`;

const HeroActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 900px) {
    justify-content: flex-start;
  }
`;

const Button = styled.button`
  border: none;
  border-radius: 14px;
  cursor: pointer;
  padding: 12px 18px;
  font-weight: 700;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }
`;

const PrimaryButton = styled(Button)`
  background: #ffffff;
  color: #0f3b45;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.12);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.18);
`;

const Surface = styled.section`
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(15, 59, 69, 0.08);
  backdrop-filter: blur(14px);
  border-radius: 24px;
  box-shadow: 0 18px 42px rgba(25, 55, 58, 0.08);
`;

const Toolbar = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(180px, 0.7fr) minmax(180px, 0.7fr) auto auto;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid rgba(15, 59, 69, 0.08);

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.84rem;
  font-weight: 700;
  color: #24464d;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid rgba(15, 59, 69, 0.16);
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 0.98rem;
  background: white;
  outline: none;

  &:focus {
    border-color: #3ccfc4;
    box-shadow: 0 0 0 4px rgba(60, 207, 196, 0.14);
  }
`;

const Select = styled.select`
  width: 100%;
  border: 1px solid rgba(15, 59, 69, 0.16);
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 0.98rem;
  background: white;
  outline: none;

  &:focus {
    border-color: #3ccfc4;
    box-shadow: 0 0 0 4px rgba(60, 207, 196, 0.14);
  }
`;

const FilterActions = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;

  @media (max-width: 1100px) {
    align-items: stretch;
  }
`;

const ToolbarButton = styled(Button)`
  background: #0f3b45;
  color: white;
  min-height: 52px;
  box-shadow: 0 12px 26px rgba(15, 59, 69, 0.18);
`;

const GhostButton = styled(Button)`
  background: white;
  color: #0f3b45;
  border: 1px solid rgba(15, 59, 69, 0.16);
  min-height: 52px;
`;

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfb 100%);
  border: 1px solid rgba(15, 59, 69, 0.08);
  border-radius: 20px;
  padding: 18px;
`;

const MetricLabel = styled.div`
  font-size: 0.85rem;
  color: #597278;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  line-height: 1;
  font-weight: 800;
  color: #0f3b45;
`;

const MetricHint = styled.div`
  margin-top: 8px;
  color: #6c8186;
  font-size: 0.92rem;
`;

const ListPanel = styled.div`
  padding: 0 20px 20px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) 130px 170px 180px 120px 120px;
  gap: 12px;
  padding: 14px 18px;
  color: #60767b;
  font-size: 0.83rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;

  @media (max-width: 1100px) {
    display: none;
  }
`;

const ReportList = styled.div`
  display: grid;
  gap: 12px;
`;

const ReportCard = styled.button`
  border: 1px solid rgba(15, 59, 69, 0.08);
  background: white;
  border-radius: 20px;
  padding: 18px;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 10px 28px rgba(31, 58, 64, 0.05);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) 130px 170px 180px 120px 120px;
  gap: 12px;
  align-items: start;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 34px rgba(31, 58, 64, 0.09);
    border-color: rgba(60, 207, 196, 0.35);
  }

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const CardBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardLabel = styled.div`
  display: none;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7b8f94;

  @media (max-width: 1100px) {
    display: block;
  }
`;

const CardTitle = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 6px;
`;

const ReportName = styled.div`
  font-size: 1.08rem;
  font-weight: 800;
  color: #0f3b45;
`;

const ReportExcerpt = styled.p`
  margin: 0;
  color: #567077;
  font-size: 0.94rem;
  line-height: 1.6;
`;

const MetaLine = styled.div`
  color: #6f848a;
  font-size: 0.92rem;
  line-height: 1.5;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: ${({ status }) => {
    if (status === 'resolved') return '#12734c';
    if (status === 'in_progress') return '#9c6512';
    if (status === 'closed') return '#5c6a70';
    return '#8d2d29';
  }};
  background: ${({ status }) => {
    if (status === 'resolved') return 'rgba(18, 115, 76, 0.12)';
    if (status === 'in_progress') return 'rgba(156, 101, 18, 0.12)';
    if (status === 'closed') return 'rgba(92, 106, 112, 0.12)';
    return 'rgba(141, 45, 41, 0.12)';
  }};
`;

const DetailButton = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(15, 59, 69, 0.06);
  color: #0f3b45;
  font-weight: 700;
`;

const EmptyState = styled.div`
  padding: 36px 20px 48px;
  text-align: center;
  color: #5c7177;
`;

const Pager = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 18px 20px 24px;
  border-top: 1px solid rgba(15, 59, 69, 0.08);

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PagerMeta = styled.div`
  color: #5d747a;
  font-size: 0.95rem;
`;

const PagerControls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const PagerButton = styled(Button)`
  background: white;
  border: 1px solid rgba(15, 59, 69, 0.16);
  color: #0f3b45;
  min-width: 92px;
`;

const PagerBadge = styled.div`
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(15, 59, 69, 0.06);
  color: #0f3b45;
  font-weight: 700;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(8, 25, 29, 0.56);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 2000;
`;

const ModalCard = styled.div`
  width: min(1040px, 100%);
  max-height: min(90vh, 980px);
  overflow: auto;
  background: #ffffff;
  border-radius: 28px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 26px 26px 20px;
  border-bottom: 1px solid rgba(15, 59, 69, 0.08);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.4rem, 2.4vw, 2rem);
  color: #0f3b45;
`;

const ModalSubtext = styled.p`
  margin: 8px 0 0;
  color: #5c7177;
  line-height: 1.6;
`;

const CloseButton = styled(Button)`
  background: rgba(15, 59, 69, 0.08);
  color: #0f3b45;
`;

const ModalBody = styled.div`
  padding: 24px 26px 26px;
  display: grid;
  gap: 18px;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const DetailBox = styled.div`
  border: 1px solid rgba(15, 59, 69, 0.08);
  background: linear-gradient(180deg, #fbfefe 0%, #f4fafa 100%);
  border-radius: 20px;
  padding: 16px;
`;

const DetailKey = styled.div`
  color: #6a8086;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
`;

const DetailValue = styled.div`
  color: #11383f;
  line-height: 1.65;
  white-space: pre-wrap;
`;

const AttachmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`;

const AttachmentTile = styled.a`
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-decoration: none;
  border-radius: 18px;
  border: 1px solid rgba(15, 59, 69, 0.08);
  background: white;
  overflow: hidden;
  color: #0f3b45;
`;

const AttachmentPreview = styled.div`
  height: 120px;
  background: linear-gradient(135deg, rgba(60, 207, 196, 0.16), rgba(15, 59, 69, 0.08));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f3b45;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const AttachmentImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
`;

const AttachmentMeta = styled.div`
  padding: 0 12px 12px;
  color: #60767b;
  font-size: 0.84rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 140px;
  border: 1px solid rgba(15, 59, 69, 0.16);
  border-radius: 16px;
  padding: 14px 16px;
  resize: vertical;
  font-size: 0.98rem;
  outline: none;

  &:focus {
    border-color: #3ccfc4;
    box-shadow: 0 0 0 4px rgba(60, 207, 196, 0.14);
  }
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const InlineActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const CardSpacer = styled.div`
  height: 8px;
`;

const AdminReportsContent = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortKey, setSortKey] = useState('-created_at');
    const [adminResponses, setAdminResponses] = useState({});
    const [selectedReportId, setSelectedReportId] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://127.0.0.1:8000';

    const selectedReport = reports.find((report) => report.id === selectedReportId) || null;

    const apiHeaders = () => ({
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    });

    const formatDate = (value) => {
        if (!value) return '—';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
    };

    const formatLabel = (value) => {
        if (!value) return '—';
        return value
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (character) => character.toUpperCase());
    };

    const resolveFileUrl = (filePath) => {
        if (!filePath) return '';
        try {
            return new URL(filePath, API_BASE).toString();
        } catch (error) {
            return filePath;
        }
    };

    const fetchRiderReports = async () => {
        const params = new URLSearchParams();

        if (searchQuery) params.append('search', searchQuery);
        if (statusFilter) params.append('status', statusFilter);
        if (sortKey) params.append('ordering', sortKey);
        params.append('page', String(page));

        try {
            if (!token) {
                navigate('/admin/login');
                return;
            }

            const response = await fetch(`${API_BASE}/api/riders/admin/reports/?${params.toString()}`, {
                headers: apiHeaders()
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/admin/login');
                return;
            }

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Failed to load reports: ${response.status} ${text}`);
            }

            const data = await response.json();
            const list = data.results || data;

            setReports(list);
            setTotal(typeof data.count === 'number' ? data.count : list.length);
            setAdminResponses((current) => {
                const next = { ...current };
                list.forEach((report) => {
                    next[report.id] = report.admin_response || next[report.id] || '';
                });
                return next;
            });

            if (selectedReportId && !list.some((report) => report.id === selectedReportId)) {
                setSelectedReportId(null);
            }
        } catch (requestError) {
            setError(requestError.message || 'Network or runtime error fetching reports');
        }
    };

    useEffect(() => {
        fetchRiderReports();
    }, [page, searchQuery, sortKey, statusFilter]);

    const updateRiderReportStatus = async (id, status) => {
        setLoading(true);

        try {
            if (!token) {
                navigate('/admin/login');
                return;
            }

            const response = await fetch(`${API_BASE}/api/riders/admin/reports/${id}/status/`, {
                method: 'PATCH',
                headers: apiHeaders(),
                body: JSON.stringify({ status })
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/admin/login');
                return;
            }

            if (!response.ok) {
                const details = await response.json().catch(() => ({}));
                throw new Error(details.detail || 'Failed to update status');
            }

            await fetchRiderReports();
        } catch (requestError) {
            alert(requestError.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const saveAdminResponse = async (id, responseText) => {
        setLoading(true);

        try {
            if (!token) {
                navigate('/admin/login');
                return;
            }

            const response = await fetch(`${API_BASE}/api/riders/admin/reports/${id}/status/`, {
                method: 'PATCH',
                headers: apiHeaders(),
                body: JSON.stringify({ admin_response: responseText })
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/admin/login');
                return;
            }

            if (!response.ok) {
                const details = await response.json().catch(() => ({}));
                throw new Error(details.detail || 'Failed to save response');
            }

            setAdminResponses((current) => ({ ...current, [id]: responseText }));
            if (selectedReportId === id) {
                setReports((current) => current.map((report) => (report.id === id ? { ...report, admin_response: responseText } : report)));
            }
        } catch (requestError) {
            alert(requestError.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const exportReports = async () => {
        const params = new URLSearchParams();

        if (searchQuery) params.append('search', searchQuery);
        if (statusFilter) params.append('status', statusFilter);
        if (sortKey) params.append('ordering', sortKey);

        try {
            const response = await fetch(`${API_BASE}/api/riders/admin/reports/export/?${params.toString()}`, {
                headers: apiHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to export reports');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');

            anchor.href = downloadUrl;
            anchor.download = 'rider_reports.csv';
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (requestError) {
            alert(requestError.message || 'Network error during export');
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();
        setPage(1);
        setSearchQuery(searchInput.trim());
    };

    const clearFilters = () => {
        setSearchInput('');
        setSearchQuery('');
        setStatusFilter('');
        setSortKey('-created_at');
        setPage(1);
    };

    const openReport = (report) => {
        setSelectedReportId(report.id);
    };

    const closeReport = () => {
        setSelectedReportId(null);
    };

    const visibleCount = reports.length;

    return (
        <>
            <AdminNav />
            <Container>
                {error ? (
                    <Shell>
                        <Surface>
                            <EmptyState>
                                <h2 style={{color: '#b32020', marginTop: 0}}>Error loading submitted reports</h2>
                                <p style={{marginBottom: 0, whiteSpace: 'pre-wrap'}}>{error}</p>
                            </EmptyState>
                        </Surface>
                    </Shell>
                ) : (
                    <Shell>
                        <Hero>
                            <HeroCopy>
                                <Eyebrow>Admin reports</Eyebrow>
                                <Heading>Submitted reports dashboard</Heading>
                                <Subtitle>
                                    Review every submitted rider report in one place, filter by status, sort by date, and open a secure detail panel for response, attachment review, and export.
                                </Subtitle>
                            </HeroCopy>

                            <HeroActions>
                                <PrimaryButton onClick={exportReports} disabled={loading || visibleCount === 0}>Download CSV</PrimaryButton>
                                <SecondaryButton onClick={clearFilters}>Reset filters</SecondaryButton>
                            </HeroActions>
                        </Hero>

                        <Surface>
                            <Toolbar>
                                <Field style={{gridColumn: '1 / -1'}}>
                                    <Label htmlFor="report-search">Search reports</Label>
                                    <form onSubmit={handleSearch}>
                                        <Input
                                            id="report-search"
                                            placeholder="Search by title, description, location, or reporter"
                                            value={searchInput}
                                            onChange={(event) => setSearchInput(event.target.value)}
                                        />
                                    </form>
                                </Field>

                                <Field>
                                    <Label htmlFor="report-status">Status</Label>
                                    <Select
                                        id="report-status"
                                        value={statusFilter}
                                        onChange={(event) => {
                                            setPage(1);
                                            setStatusFilter(event.target.value);
                                        }}
                                    >
                                        <option value="">All statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </Select>
                                </Field>

                                <Field>
                                    <Label htmlFor="report-sort">Sort by</Label>
                                    <Select
                                        id="report-sort"
                                        value={sortKey}
                                        onChange={(event) => {
                                            setPage(1);
                                            setSortKey(event.target.value);
                                        }}
                                    >
                                        <option value="-created_at">Newest first</option>
                                        <option value="created_at">Oldest first</option>
                                        <option value="status">Status A to Z</option>
                                        <option value="-status">Status Z to A</option>
                                    </Select>
                                </Field>

                                <FilterActions>
                                    <ToolbarButton onClick={handleSearch} disabled={loading}>Search</ToolbarButton>
                                    <GhostButton onClick={clearFilters} type="button">Clear</GhostButton>
                                </FilterActions>
                            </Toolbar>

                            <Metrics>
                                <MetricCard>
                                    <MetricLabel>Total submitted reports</MetricLabel>
                                    <MetricValue>{total}</MetricValue>
                                    <MetricHint>Across the current filtered result set.</MetricHint>
                                </MetricCard>
                                <MetricCard>
                                    <MetricLabel>Visible on this page</MetricLabel>
                                    <MetricValue>{visibleCount}</MetricValue>
                                    <MetricHint>Fast scanning without leaving the dashboard.</MetricHint>
                                </MetricCard>
                                <MetricCard>
                                    <MetricLabel>Current page</MetricLabel>
                                    <MetricValue>{page}</MetricValue>
                                    <MetricHint>Use pagination to move through large datasets.</MetricHint>
                                </MetricCard>
                            </Metrics>

                            <ListPanel>
                                <TableHeader>
                                    <div>Report</div>
                                    <div>Type</div>
                                    <div>Creator</div>
                                    <div>Submitted</div>
                                    <div>Status</div>
                                    <div>Details</div>
                                </TableHeader>

                                <ReportList>
                                    {reports.length > 0 ? reports.map((report) => (
                                        <ReportCard key={report.id} type="button" onClick={() => openReport(report)}>
                                            <CardBlock>
                                                <CardLabel>Report</CardLabel>
                                                <CardTitle>
                                                    <ReportName>{report.title || `Report #${report.id}`}</ReportName>
                                                    <StatusBadge status={report.status}>{formatLabel(report.status)}</StatusBadge>
                                                </CardTitle>
                                                <ReportExcerpt>{report.description || 'No description was provided for this report.'}</ReportExcerpt>
                                                <MetaLine>{report.location ? `Location: ${report.location}` : 'Location not supplied'}</MetaLine>
                                            </CardBlock>

                                            <CardBlock>
                                                <CardLabel>Type</CardLabel>
                                                <MetaLine>{formatLabel(report.report_type)}</MetaLine>
                                            </CardBlock>

                                            <CardBlock>
                                                <CardLabel>Creator</CardLabel>
                                                <MetaLine>
                                                    {report.reporter ? (report.reporter.full_name || report.reporter.username || `User ${report.reporter.id}`) : '—'}
                                                </MetaLine>
                                                <MetaLine>{report.reporter?.email || '—'}</MetaLine>
                                            </CardBlock>

                                            <CardBlock>
                                                <CardLabel>Submitted</CardLabel>
                                                <MetaLine>{formatDate(report.created_at)}</MetaLine>
                                            </CardBlock>

                                            <CardBlock>
                                                <CardLabel>Status</CardLabel>
                                                <MetaLine>{formatLabel(report.status)}</MetaLine>
                                            </CardBlock>

                                            <CardBlock>
                                                <CardLabel>Details</CardLabel>
                                                <DetailButton>Open view</DetailButton>
                                            </CardBlock>
                                        </ReportCard>
                                    )) : (
                                        <EmptyState>
                                            <h3 style={{marginTop: 0, color: '#0f3b45'}}>No reports match the current filters.</h3>
                                            <p style={{marginBottom: 0}}>Clear filters or broaden the search to find more submissions.</p>
                                        </EmptyState>
                                    )}
                                </ReportList>
                            </ListPanel>

                            <Pager>
                                <PagerMeta>
                                    Showing {visibleCount} of {total} reports
                                </PagerMeta>
                                <PagerControls>
                                    <PagerButton
                                        type="button"
                                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                                        disabled={page <= 1 || loading}
                                    >
                                        Prev
                                    </PagerButton>
                                    <PagerBadge>Page {page}</PagerBadge>
                                    <PagerButton
                                        type="button"
                                        onClick={() => setPage((current) => current + 1)}
                                        disabled={loading || visibleCount === 0}
                                    >
                                        Next
                                    </PagerButton>
                                </PagerControls>
                            </Pager>
                        </Surface>
                    </Shell>
                )}

                {selectedReport && (
                    <ModalBackdrop onClick={closeReport} role="presentation">
                        <ModalCard onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="report-detail-title">
                            <ModalHeader>
                                <div>
                                    <ModalTitle id="report-detail-title">{selectedReport.title || `Report #${selectedReport.id}`}</ModalTitle>
                                    <ModalSubtext>
                                        A secure, read-focused view of the submitted report, including status controls, attachments, metadata, and the admin response trail.
                                    </ModalSubtext>
                                </div>

                                <CloseButton type="button" onClick={closeReport}>Close</CloseButton>
                            </ModalHeader>

                            <ModalBody>
                                <DetailGrid>
                                    <DetailBox>
                                        <DetailKey>Reporter</DetailKey>
                                        <DetailValue>
                                            {selectedReport.reporter ? (
                                                <>
                                                    {selectedReport.reporter.full_name || selectedReport.reporter.username || `User ${selectedReport.reporter.id}`}
                                                    <br />
                                                    {selectedReport.reporter.email || 'No email provided'}
                                                </>
                                            ) : '—'}
                                        </DetailValue>
                                    </DetailBox>

                                    <DetailBox>
                                        <DetailKey>Submission</DetailKey>
                                        <DetailValue>{formatDate(selectedReport.created_at)}</DetailValue>
                                    </DetailBox>

                                    <DetailBox>
                                        <DetailKey>Type</DetailKey>
                                        <DetailValue>{formatLabel(selectedReport.report_type)}</DetailValue>
                                    </DetailBox>

                                    <DetailBox>
                                        <DetailKey>Status</DetailKey>
                                        <DetailValue>{formatLabel(selectedReport.status)}</DetailValue>
                                    </DetailBox>

                                    <DetailBox>
                                        <DetailKey>Location</DetailKey>
                                        <DetailValue>{selectedReport.location || '—'}</DetailValue>
                                    </DetailBox>

                                    <DetailBox>
                                        <DetailKey>Assigned to</DetailKey>
                                        <DetailValue>{selectedReport.assigned_to || '—'}</DetailValue>
                                    </DetailBox>
                                </DetailGrid>

                                <DetailBox>
                                    <DetailKey>Description</DetailKey>
                                    <DetailValue>{selectedReport.description || 'No description was supplied for this report.'}</DetailValue>
                                </DetailBox>

                                {selectedReport.metadata && Object.keys(selectedReport.metadata).length > 0 && (
                                    <DetailBox>
                                        <DetailKey>Metadata</DetailKey>
                                        <DetailValue as="pre" style={{margin: 0, fontFamily: 'inherit'}}>{JSON.stringify(selectedReport.metadata, null, 2)}</DetailValue>
                                    </DetailBox>
                                )}

                                <DetailBox>
                                    <DetailKey>Attachments</DetailKey>
                                    {Array.isArray(selectedReport.attachments) && selectedReport.attachments.length > 0 ? (
                                        <AttachmentGrid>
                                            {selectedReport.attachments.map((attachment) => {
                                                const fileUrl = resolveFileUrl(attachment.file);
                                                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.file || '');

                                                return (
                                                    <AttachmentTile key={attachment.id} href={fileUrl} target="_blank" rel="noreferrer">
                                                        {isImage ? (
                                                            <AttachmentImage src={fileUrl} alt="Report attachment" />
                                                        ) : (
                                                            <AttachmentPreview>File</AttachmentPreview>
                                                        )}
                                                        <AttachmentMeta>{formatDate(attachment.uploaded_at)}</AttachmentMeta>
                                                    </AttachmentTile>
                                                );
                                            })}
                                        </AttachmentGrid>
                                    ) : (
                                        <DetailValue>No attachments were uploaded with this report.</DetailValue>
                                    )}
                                </DetailBox>

                                <DetailBox>
                                    <DetailKey>Admin response</DetailKey>
                                    <Textarea
                                        value={adminResponses[selectedReport.id] || ''}
                                        onChange={(event) => setAdminResponses((current) => ({ ...current, [selectedReport.id]: event.target.value }))}
                                        placeholder="Add the internal response visible to admins only"
                                    />

                                    <CardSpacer />

                                    <ActionRow>
                                        <InlineActions>
                                            <Label htmlFor="detail-status" style={{marginBottom: 0, alignSelf: 'center'}}>Update status</Label>
                                            <Select
                                                id="detail-status"
                                                value={selectedReport.status}
                                                onChange={(event) => updateRiderReportStatus(selectedReport.id, event.target.value)}
                                                disabled={loading}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="closed">Closed</option>
                                            </Select>
                                        </InlineActions>

                                        <PrimaryButton
                                            type="button"
                                            onClick={() => saveAdminResponse(selectedReport.id, adminResponses[selectedReport.id] || '')}
                                            disabled={loading}
                                        >
                                            Save response
                                        </PrimaryButton>
                                    </ActionRow>
                                </DetailBox>
                            </ModalBody>
                        </ModalCard>
                    </ModalBackdrop>
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