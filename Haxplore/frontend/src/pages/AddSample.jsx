import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { savePendingAction, isOnline } from '../utils/offline';

const AddSample = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        product: '',
        quantity: 1,
        receiverName: '',
        purpose: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isOnline()) {
                await api.post('/field/sample', formData);
            } else {
                await savePendingAction({
                    method: 'post',
                    url: '/field/sample',
                    data: formData
                });
                alert('Saved offline! Will sync when connected.');
            }

            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add sample');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page-container">
                <div className="success-card">
                    <div className="success-icon">✅</div>
                    <h2>Sample Added!</h2>
                    <p>Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate('/dashboard')}>←</button>
                <h1>Add Sample Distribution</h1>
            </header>

            <form className="page-content" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Product Name</label>
                    <input
                        type="text"
                        name="product"
                        value={formData.product}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Quantity</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Receiver Name</label>
                    <input
                        type="text"
                        name="receiverName"
                        value={formData.receiverName}
                        onChange={handleChange}
                        placeholder="Who received the sample?"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Purpose</label>
                    <textarea
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        placeholder="Why was the sample given?"
                        rows="3"
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button
                    type="submit"
                    className="btn btn-primary btn-large btn-full"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : '📦 Save Sample'}
                </button>
            </form>
        </div>
    );
};

export default AddSample;
