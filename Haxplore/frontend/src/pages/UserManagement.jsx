import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const UserManagement = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const activeFilter = searchParams.get('filter') === 'active';

    useEffect(() => {
        fetchUsers();
    }, [activeFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = activeFilter ? { active: true } : {};
            const res = await api.get('/admin/users', { params });
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (isActive) => {
        if (isActive) {
            setSearchParams({ filter: 'active' });
        } else {
            setSearchParams({});
        }
    };

    const handleEdit = (user) => {
        setEditingUser({ ...user });
    };

    const handleSave = async () => {
        try {
            await api.put(`/admin/users/${editingUser._id}`, editingUser);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    return (
        <div className="admin-container">
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate('/admin')}>←</button>
                <h1>👥 User Management</h1>
            </header>

            {/* Filter Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${!activeFilter ? 'active' : ''}`}
                    onClick={() => handleFilterChange(false)}
                >
                    All Staff
                </button>
                <button
                    className={`tab ${activeFilter ? 'active' : ''}`}
                    onClick={() => handleFilterChange(true)}
                >
                    Active Today 🟢
                </button>
            </div>

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>State</th>
                            <th>District</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                {editingUser?._id === user._id ? (
                                    <>
                                        <td>
                                            <input
                                                value={editingUser.name}
                                                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                value={editingUser.email}
                                                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                value={editingUser.role}
                                                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                            >
                                                <option value="field">Field</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                value={editingUser.state}
                                                onChange={(e) => setEditingUser({ ...editingUser, state: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                value={editingUser.district}
                                                onChange={(e) => setEditingUser({ ...editingUser, district: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <button className="btn btn-small btn-success" onClick={handleSave}>Save</button>
                                            <button className="btn btn-small btn-outline" onClick={() => setEditingUser(null)}>Cancel</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge badge-${user.role}`}>{user.role}</span>
                                        </td>
                                        <td>{user.state || '-'}</td>
                                        <td>{user.district || '-'}</td>
                                        <td>
                                            <button className="btn btn-small btn-outline" onClick={() => handleEdit(user)}>Edit</button>
                                            <button className="btn btn-small btn-danger" onClick={() => handleDelete(user._id)}>Delete</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
