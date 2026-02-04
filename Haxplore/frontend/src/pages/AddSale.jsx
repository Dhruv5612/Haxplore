import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { savePendingAction, isOnline } from '../utils/offline';

const AddSale = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        product: '',
        quantity: 1,
        amount: 0,
        type: 'B2C',
        buyerName: ''
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
                await api.post('/field/sale', formData);
            } else {
                await savePendingAction({
                    method: 'post',
                    url: '/field/sale',
                    data: formData
                });
                alert('Saved offline! Will sync when connected.');
            }

            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add sale');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page-container">
                <div className="success-card">
                    <div className="success-icon">✅</div>
                    <h2>Sale Added!</h2>
                    <p>Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate('/dashboard')}>←</button>
                <h1>Add Sale</h1>
            </header>

            <form className="page-content" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Sale Type</label>
                    <div className="radio-group">
                        <label className={`radio-card ${formData.type === 'B2C' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="type"
                                value="B2C"
                                checked={formData.type === 'B2C'}
                                onChange={handleChange}
                            />
                            <span>👤 B2C (Consumer)</span>
                        </label>
                        <label className={`radio-card ${formData.type === 'B2B' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="type"
                                value="B2B"
                                checked={formData.type === 'B2B'}
                                onChange={handleChange}
                            />
                            <span>🏢 B2B (Business)</span>
                        </label>
                    </div>
                </div>

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

                <div className="form-row">
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
                        <label>Amount (₹)</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Buyer Name</label>
                    <input
                        type="text"
                        name="buyerName"
                        value={formData.buyerName}
                        onChange={handleChange}
                        placeholder="Enter buyer's name"
                        required
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button
                    type="submit"
                    className="btn btn-primary btn-large btn-full"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : '💰 Save Sale'}
                </button>
            </form>
        </div>
    );
};

export default AddSale;
