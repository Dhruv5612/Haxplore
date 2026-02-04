import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getCurrentLocation, formatDistance } from '../utils/helpers';
import { savePendingAction, isOnline } from '../utils/offline';

const EndDay = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [location, setLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('idle');
    const [result, setResult] = useState(null);

    const getLocation = async () => {
        setLocationStatus('getting');
        try {
            const loc = await getCurrentLocation();
            setLocation(loc);
            setLocationStatus('success');
        } catch (err) {
            setLocationStatus('error');
            setError('Unable to get location. Please enable GPS.');
        }
    };

    const handleEndDay = async () => {
        if (!location) {
            setError('Please capture your location first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isOnline()) {
                const res = await api.post('/field/end-day', {
                    lat: location.lat,
                    lng: location.lng
                });
                setResult(res.data);
            } else {
                await savePendingAction({
                    method: 'post',
                    url: '/field/end-day',
                    data: { lat: location.lat, lng: location.lng }
                });
                alert('Saved offline! Will sync when connected.');
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to end day');
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <div className="page-container">
                <div className="result-card">
                    <div className="result-icon">🎉</div>
                    <h1>Day Completed!</h1>
                    <div className="result-stats">
                        <div className="stat">
                            <span className="stat-label">Total Distance</span>
                            <span className="stat-value">{formatDistance(result.totalDistance || 0)}</span>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary btn-large"
                        onClick={() => navigate('/dashboard')}
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate('/dashboard')}>←</button>
                <h1>End Your Day</h1>
            </header>

            <div className="page-content">
                <div className="location-card">
                    <div className="location-icon">🏁</div>
                    <h2>Capture End Location</h2>
                    <p>Your total distance will be calculated.</p>

                    {locationStatus === 'idle' && (
                        <button className="btn btn-primary" onClick={getLocation}>
                            Get My Location
                        </button>
                    )}

                    {locationStatus === 'getting' && (
                        <div className="location-loading">
                            <div className="spinner"></div>
                            <p>Getting location...</p>
                        </div>
                    )}

                    {locationStatus === 'success' && (
                        <div className="location-success">
                            <div className="success-icon">✅</div>
                            <p>Location captured!</p>
                            <p className="location-coords">
                                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                            </p>
                        </div>
                    )}

                    {locationStatus === 'error' && (
                        <div className="location-error">
                            <p>{error}</p>
                            <button className="btn btn-outline" onClick={getLocation}>
                                Try Again
                            </button>
                        </div>
                    )}
                </div>

                {error && locationStatus !== 'error' && (
                    <div className="error-message">{error}</div>
                )}

                <button
                    className="btn btn-danger btn-large btn-full"
                    onClick={handleEndDay}
                    disabled={!location || loading}
                >
                    {loading ? 'Ending...' : '🌙 End Day'}
                </button>
            </div>
        </div>
    );
};

export default EndDay;
