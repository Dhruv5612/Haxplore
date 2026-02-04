import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getCurrentLocation } from '../utils/helpers';
import { savePendingAction, isOnline } from '../utils/offline';

const AddMeeting = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [location, setLocation] = useState(null);
    const [photos, setPhotos] = useState([]);

    const [formData, setFormData] = useState({
        type: 'one-on-one',
        personName: '',
        village: '',
        category: 'farmer',
        attendeesCount: 1,
        notes: ''
    });

    useEffect(() => {
        // Auto-capture location on mount
        getCurrentLocation()
            .then(setLocation)
            .catch(console.error);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        setPhotos(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            if (location) {
                data.append('lat', location.lat);
                data.append('lng', location.lng);
            }

            photos.forEach(photo => {
                data.append('photos', photo);
            });

            if (isOnline()) {
                await api.post('/field/meeting', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // For offline, we can't upload photos, just save the data
                await savePendingAction({
                    method: 'post',
                    url: '/field/meeting',
                    data: { ...formData, lat: location?.lat, lng: location?.lng }
                });
                alert('Saved offline! Photos will need to be added when online.');
            }

            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add meeting');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page-container">
                <div className="success-card">
                    <div className="success-icon">✅</div>
                    <h2>Meeting Added!</h2>
                    <p>Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate('/dashboard')}>←</button>
                <h1>Add Meeting</h1>
            </header>

            <form className="page-content" onSubmit={handleSubmit}>
                {/* Location Status */}
                <div className="location-badge">
                    {location ? (
                        <span className="badge badge-success">📍 Location captured</span>
                    ) : (
                        <span className="badge badge-warning">⏳ Getting location...</span>
                    )}
                </div>

                <div className="form-group">
                    <label>Meeting Type</label>
                    <div className="radio-group">
                        <label className={`radio-card ${formData.type === 'one-on-one' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="type"
                                value="one-on-one"
                                checked={formData.type === 'one-on-one'}
                                onChange={handleChange}
                            />
                            <span>👤 One-on-One</span>
                        </label>
                        <label className={`radio-card ${formData.type === 'group' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="type"
                                value="group"
                                checked={formData.type === 'group'}
                                onChange={handleChange}
                            />
                            <span>👥 Group</span>
                        </label>
                    </div>
                </div>

                {formData.type === 'one-on-one' ? (
                    <div className="form-group">
                        <label>Person Name</label>
                        <input
                            type="text"
                            name="personName"
                            value={formData.personName}
                            onChange={handleChange}
                            placeholder="Enter person's name"
                            required
                        />
                    </div>
                ) : (
                    <>
                        <div className="form-group">
                            <label>Village/Location</label>
                            <input
                                type="text"
                                name="village"
                                value={formData.village}
                                onChange={handleChange}
                                placeholder="Enter village name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Number of Attendees</label>
                            <input
                                type="number"
                                name="attendeesCount"
                                value={formData.attendeesCount}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>
                    </>
                )}

                <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
                        <option value="farmer">🌾 Farmer</option>
                        <option value="seller">🏪 Seller</option>
                        <option value="distributor">🚛 Distributor</option>
                        <option value="other">📋 Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Add any notes..."
                        rows="3"
                    />
                </div>

                <div className="form-group">
                    <label>📷 Photos</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        capture="environment"
                        onChange={handlePhotoChange}
                        className="file-input"
                    />
                    {photos.length > 0 && (
                        <p className="file-count">{photos.length} photo(s) selected</p>
                    )}
                </div>

                {error && <div className="error-message">{error}</div>}

                <button
                    type="submit"
                    className="btn btn-primary btn-large btn-full"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : '✅ Save Meeting'}
                </button>
            </form>
        </div>
    );
};

export default AddMeeting;
