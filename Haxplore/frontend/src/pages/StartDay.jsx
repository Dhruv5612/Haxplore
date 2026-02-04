import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getCurrentLocation } from '../utils/helpers';
import { savePendingAction, isOnline } from '../utils/offline';

const StartDay = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [location, setLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('idle');

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

    const handleStartDay = async () => {
        if (!location) {
            setError('Please capture your location first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isOnline()) {
                await api.post('/field/start-day', {
                    lat: location.lat,
                    lng: location.lng
                });
            } else {
                await savePendingAction({
                    method: 'post',
                    url: '/field/start-day',
                    data: { lat: location.lat, lng: location.lng }
                });
                alert('Saved offline! Will sync when connected.');
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start day');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate('/dashboard')}>←</button>
                <h1>Start Your Day</h1>
            </header>

            <div className="page-content">
                <div className="location-card">
                    <div className="location-icon">📍</div>
                    <h2>Capture Your Location</h2>
                    <p>We need your current location to track your work day.</p>

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
                    className="btn btn-primary btn-large btn-full"
                    onClick={handleStartDay}
                    disabled={!location || loading}
                >
                    {loading ? 'Starting...' : '🌅 Start Day'}
                </button>
            </div>
        </div>
    );
};

export default StartDay;
