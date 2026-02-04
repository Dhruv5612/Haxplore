import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatTime } from '../utils/helpers';

const FieldDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dayStatus, setDayStatus] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dayRes, summaryRes] = await Promise.all([
                api.get('/field/today'),
                api.get('/field/summary')
            ]);
            setDayStatus(dayRes.data);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);

        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    const dayStarted = summary?.dayStarted;
    const dayEnded = summary?.dayEnded;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>👋 Hello, {user?.name}</h1>
                    <p className="subtitle">{user?.state} • {user?.district}</p>
                </div>
                <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
            </header>

            {/* Day Status Card */}
            {/* Day Status Card */}
            <div className="status-card">
                {!dayStarted ? (
                    <div className="status-not-started">
                        <span className="status-icon">🌅</span>
                        {dayEnded ? (
                            <p>Previous shift completed at {formatTime(summary?.lastEndedTime)}</p>
                        ) : (
                            <p>Day not started yet</p>
                        )}
                        <button
                            className="btn btn-primary btn-large"
                            onClick={() => navigate('/start-day')}
                        >
                            {dayEnded ? 'Start New Shift' : 'Start Your Day'}
                        </button>
                    </div>
                ) : dayEnded ? (
                    /* This case should practically not be reachable with new logic, but keeping for safety */
                    <div className="status-ended">
                        <span className="status-icon">🌙</span>
                        <p>Day completed</p>
                    </div>
                ) : (
                    <div className="status-active">
                        <span className="status-icon">☀️</span>
                        <p>Day started at {formatTime(dayStatus?.startTime)}</p>
                    </div>
                )}
            </div>

            {/* Today's Summary */}
            <div className="summary-grid">
                <div className="summary-card">
                    <span className="summary-icon">🤝</span>
                    <div className="summary-value">{summary?.meetingsCount || 0}</div>
                    <div className="summary-label">Meetings</div>
                </div>
                <div className="summary-card">
                    <span className="summary-icon">📦</span>
                    <div className="summary-value">{summary?.samplesCount || 0}</div>
                    <div className="summary-label">Samples</div>
                </div>
                <div className="summary-card">
                    <span className="summary-icon">💰</span>
                    <div className="summary-value">{summary?.salesCount || 0}</div>
                    <div className="summary-label">Sales</div>
                </div>
            </div>

            {/* Action Buttons */}
            {dayStarted && !dayEnded && (
                <div className="action-grid">
                    <button
                        className="action-card"
                        onClick={() => navigate('/add-meeting')}
                    >
                        <span className="action-icon">👥</span>
                        <span>Add Meeting</span>
                    </button>

                    <button
                        className="action-card"
                        onClick={() => navigate('/add-sample')}
                    >
                        <span className="action-icon">🎁</span>
                        <span>Add Sample</span>
                    </button>

                    <button
                        className="action-card"
                        onClick={() => navigate('/add-sale')}
                    >
                        <span className="action-icon">💵</span>
                        <span>Add Sale</span>
                    </button>

                    <button
                        className="action-card action-end"
                        onClick={() => navigate('/end-day')}
                    >
                        <span className="action-icon">🏁</span>
                        <span>End Day</span>
                    </button>
                </div>
            )}

            {/* Online Status */}
            <div className={`online-status ${navigator.onLine ? 'online' : 'offline'}`}>
                {navigator.onLine ? '🟢 Online' : '🔴 Offline - Data will sync when connected'}
            </div>
        </div>
    );
};

export default FieldDashboard;
