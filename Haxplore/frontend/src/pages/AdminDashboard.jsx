import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    const salesPieData = [
        { name: 'B2C', value: stats?.salesBreakdown?.b2c || 0 },
        { name: 'B2B', value: stats?.salesBreakdown?.b2b || 0 }
    ];

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1>📊 Admin Dashboard</h1>
                    <p>Welcome, {user?.name}</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-outline" onClick={() => navigate('/admin/users')}>
                        👥 Users
                    </button>
                    <button className="btn btn-outline" onClick={() => navigate('/admin/reports')}>
                        📋 Reports
                    </button>
                    <button className="btn btn-outline" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div
                    className="stat-card clickable"
                    onClick={() => navigate('/admin/users')}
                >
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{stats?.totalFieldOfficers || 0}</div>
                    <div className="stat-label">Field Officers</div>
                </div>
                <div
                    className="stat-card clickable"
                    onClick={() => navigate('/admin/users?filter=active')}
                >
                    <div className="stat-icon">✅</div>
                    <div className="stat-value">{stats?.activeToday || 0}</div>
                    <div className="stat-label">Active Today</div>
                </div>
                <div
                    className="stat-card clickable"
                    onClick={() => navigate('/admin/reports?tab=meetings')}
                >
                    <div className="stat-icon">🤝</div>
                    <div className="stat-value">{stats?.totalMeetingsToday || 0}</div>
                    <div className="stat-label">Meetings Today</div>
                </div>
                <div
                    className="stat-card clickable"
                    onClick={() => navigate('/admin/reports?tab=sales')}
                >
                    <div className="stat-icon">💰</div>
                    <div className="stat-value">{stats?.totalSalesToday || 0}</div>
                    <div className="stat-label">Sales Today</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📍</div>
                    <div className="stat-value">{(stats?.totalDistanceToday || 0).toFixed(1)} km</div>
                    <div className="stat-label">Total Distance</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                {/* Weekly Meetings Chart */}
                <div className="chart-card">
                    <h3>📈 Weekly Meetings</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={stats?.weeklyMeetings || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Sales Breakdown */}
                <div className="chart-card">
                    <h3>🥧 Sales Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={salesPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label
                            >
                                {salesPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* State-wise Activity */}
            <div className="table-card">
                <h3>🗺️ State-wise Activity (Last 30 Days)</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>State</th>
                            <th>Meetings</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats?.stateWiseActivity?.map((item, index) => (
                            <tr key={index}>
                                <td>{item._id || 'Unknown'}</td>
                                <td>{item.count}</td>
                            </tr>
                        ))}
                        {(!stats?.stateWiseActivity || stats.stateWiseActivity.length === 0) && (
                            <tr>
                                <td colSpan="2" className="empty-row">No data available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
