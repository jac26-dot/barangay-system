import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

// Uses the same backend as the rest of the admin app.
const API = 'https://barangay-system-xf6j.onrender.com/api';

const STATUS_TABS = ['Pending', 'Approved', 'Rejected'];

const ResidentRegistrations = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [actingId, setActingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // adjust key name if your admin app stores it differently
      const res = await axios.get(`${API}/admin/resident-accounts`, {
        params: { status: filterStatus },
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(res.data.data);
    } catch (err) {
      toast.error('Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    setActingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/admin/resident-accounts/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Account approved.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed.');
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this registration? The applicant will need to contact the barangay office.')) return;
    setActingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/admin/resident-accounts/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Account rejected.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Resident Account Registrations</h2>
          <p>{accounts.length} {filterStatus.toLowerCase()} registration{accounts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: 10 }}>
            {STATUS_TABS.map(s => (
              <button
                key={s}
                className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilterStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Email</th>
                  <th>Linked Resident</th>
                  <th>Address</th>
                  <th>Contact</th>
                  <th>Submitted</th>
                  {filterStatus === 'Pending' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty-state"><p>No {filterStatus.toLowerCase()} registrations found.</p></div>
                  </td></tr>
                ) : accounts.map(acc => (
                  <tr key={acc.id}>
                    <td><strong>{acc.name}</strong></td>
                    <td style={{ fontSize: 13 }}>{acc.email}</td>
                    <td>
                      {acc.Resident
                        ? `${acc.Resident.lastName}, ${acc.Resident.firstName} ${acc.Resident.middleName || ''}`
                        : <span style={{ color: '#c81e1e' }}>No match — new record</span>}
                    </td>
                    <td style={{ fontSize: 12 }}>{acc.Resident?.address || '—'}</td>
                    <td style={{ fontSize: 12 }}>{acc.Resident?.contactNumber || '—'}</td>
                    <td>{new Date(acc.createdAt).toLocaleDateString('en-PH')}</td>
                    {filterStatus === 'Pending' && (
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={actingId === acc.id}
                          onClick={() => handleApprove(acc.id)}
                        >
                          {actingId === acc.id ? '...' : 'Approve'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={actingId === acc.id}
                          onClick={() => handleReject(acc.id)}
                        >
                          Reject
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentRegistrations;
