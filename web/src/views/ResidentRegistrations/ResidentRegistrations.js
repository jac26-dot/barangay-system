import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const API_BASE = process.env.REACT_APP_API_URL || '';

const ResidentRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/resident-accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load resident registrations');
      const data = await res.json();
      setRegistrations(Array.isArray(data) ? data : data.registrations || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load resident registrations');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleAction = async (id, action) => {
    setActionId(id);
    try {
      const res = await fetch(`${API_BASE}/admin/resident-accounts/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to ${action} registration`);
      toast.success(action === 'approve' ? 'Registration approved' : 'Registration rejected');
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error(err.message || `Failed to ${action} registration`);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading resident registrations...</div>;
  }

  return (
    <div className="resident-registrations">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Resident Registrations</h2>
        <button className="btn btn-ghost btn-sm" onClick={fetchRegistrations}>
          Refresh
        </button>
      </div>

      {registrations.length === 0 ? (
        <div className="empty-state" style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>
          No pending resident registrations.
        </div>
      ) : (
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Contact No.</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Date Registered</th>
              <th style={{ textAlign: 'right', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid #374151' }}>
                <td style={{ padding: 8 }}>{r.name || r.fullName}</td>
                <td style={{ padding: 8 }}>{r.email}</td>
                <td style={{ padding: 8 }}>{r.contactNumber || r.phone || '—'}</td>
                <td style={{ padding: 8 }}>
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                </td>
                <td style={{ padding: 8, textAlign: 'right' }}>
                  <button
                    className="btn btn-sm btn-success"
                    disabled={actionId === r.id}
                    onClick={() => handleAction(r.id, 'approve')}
                    style={{ marginRight: 8 }}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={actionId === r.id}
                    onClick={() => handleAction(r.id, 'reject')}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ResidentRegistrations;
