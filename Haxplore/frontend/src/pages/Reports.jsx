import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { formatDate, formatTime } from '../utils/helpers';

const Reports = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState(null);
    const [filters, setFilters] = useState({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'meetings');

    useEffect(() => {
        fetchReports();
    }, [filters]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/reports', { params: filters });
            setReports(res.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="admin-container">
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate('/admin')}>←</button>
                <h1>📋 Reports</h1>
            </header>

            {/* Filters */}
            <div className="filters-card">
                <div className="filter-group">
                    <label>Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="filter-group">
                    <label>End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                    />
                </div>
            </div>

            {/* Summary Cards */}
            {reports?.summary && (
                <div className="summary-row">
                    <div className="summary-item">
                        <span className="summary-value">{reports.summary.totalMeetings}</span>
                        <span className="summary-label">Meetings</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-value">{reports.summary.totalSamples}</span>
                        <span className="summary-label">Samples</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-value">{reports.summary.totalSales}</span>
                        <span className="summary-label">Sales</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-value">{reports.summary.totalDays}</span>
                        <span className="summary-label">Work Days</span>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'meetings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('meetings')}
                >
                    Meetings
                </button>
                <button
                    className={`tab ${activeTab === 'samples' ? 'active' : ''}`}
                    onClick={() => setActiveTab('samples')}
                >
                    Samples
                </button>
                <button
                    className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales')}
                >
                    Sales
                </button>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="loading">Loading reports...</div>
            ) : (
                <div className="table-card">
                    {activeTab === 'meetings' && (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Officer</th>
                                    <th>Type</th>
                                    <th>Person/Village</th>
                                    <th>Category</th>
                                    <th>Attendees</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports?.meetings?.map((m) => (
                                    <tr key={m._id}>
                                        <td>{formatDate(m.timestamp)}</td>
                                        <td>{m.userId?.name}</td>
                                        <td>{m.type}</td>
                                        <td>{m.personName || m.village}</td>
                                        <td>{m.category}</td>
                                        <td>{m.attendeesCount}</td>
                                    </tr>
                                ))}
                                {reports?.meetings?.length === 0 && (
                                    <tr><td colSpan="6" className="empty-row">No meetings found</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'samples' && (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Officer</th>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Receiver</th>
                                    <th>Purpose</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports?.samples?.map((s) => (
                                    <tr key={s._id}>
                                        <td>{formatDate(s.date)}</td>
                                        <td>{s.userId?.name}</td>
                                        <td>{s.product}</td>
                                        <td>{s.quantity}</td>
                                        <td>{s.receiverName}</td>
                                        <td>{s.purpose}</td>
                                    </tr>
                                ))}
                                {reports?.samples?.length === 0 && (
                                    <tr><td colSpan="6" className="empty-row">No samples found</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'sales' && (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Officer</th>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Amount</th>
                                    <th>Type</th>
                                    <th>Buyer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports?.sales?.map((s) => (
                                    <tr key={s._id}>
                                        <td>{formatDate(s.date)}</td>
                                        <td>{s.userId?.name}</td>
                                        <td>{s.product}</td>
                                        <td>{s.quantity}</td>
                                        <td>₹{s.amount}</td>
                                        <td><span className={`badge badge-${s.type}`}>{s.type}</span></td>
                                        <td>{s.buyerName}</td>
                                    </tr>
                                ))}
                                {reports?.sales?.length === 0 && (
                                    <tr><td colSpan="7" className="empty-row">No sales found</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;
