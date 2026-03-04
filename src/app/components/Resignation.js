'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ToastDisplay from './alert.js';
import AlertCard from './AlertCard.js';
import Loading from './loading.js';

export default function Resignation() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [targetId, setTargetId] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [editReason, setEditReason] = useState('');
    const [editReasonType, setEditReasonType] = useState('');
    const [otherReason, setOtherReason] = useState('');

    const [reasonOptions] = useState([
        { id: 1, label: 'Better opportunity elsewhere' },
        { id: 2, label: 'Personal reasons' },
        { id: 3, label: 'Relocation' },
        { id: 4, label: 'Health issues' },
        { id: 5, label: 'Career change' },
        { id: 6, label: 'Retirement' },
        { id: 7, label: 'Dissatisfaction with work environment' },
        { id: 8, label: 'Other' }
    ]);

    useEffect(() => {
        getResignations();
    }, []);

    async function getResignations() {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost/react-backend/api/reasons/get);
            setData(response.data || []);
            
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to load resignation data.' });
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        try {
            setLoading(true);
            await axios.delete('http://localhost/react-backend/api/reasons/delete, {
                data: { id: id }
            });
            setShowDeleteModal(false);
            setToast({ show: true, type: 'success', message: 'Resignation record deleted successfully.' });
            getResignations();
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to delete resignation record.' });
        } finally {
            setLoading(false);
        }
    }

    function handleEdit(item) {
        setEditData(item);
        const isStandardReason = reasonOptions.find(opt => opt.label === item.reason_type);
        if (isStandardReason) {
            setEditReasonType(item.reason_type);
            setEditReason(item.reason);
                        setOtherReason(item.reason);

        } else {
            setEditReasonType('Other');
            setOtherReason(item.reason);
            console.log('Setting otherReason to:', item.reason); // Debugging log
        }
        setEditModal(true);
    }

    async function handleUpdate() {
        if (!editReasonType) {
            setToast({ show: true, type: 'error', message: 'Please select a reason.' });
            return;
        }

        if (editReasonType === 'Other' && !otherReason.trim()) {
            setToast({ show: true, type: 'error', message: 'Please provide details for your reason.' });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                id: editData.id,
                reason: editReasonType === 'Other' ? otherReason : editReasonType,
                reason_type: editReasonType
            };

            await axios.put('http://localhost/react-backend/api/reasons/update, payload);
            setToast({ show: true, type: 'success', message: 'Resignation updated successfully.' });
            setEditModal(false);
            setEditData(null);
            getResignations();
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to update resignation.' });
        } finally {
            setLoading(false);
        }
    }
     // Debugging log to check fetched data
     console.log('Fetched resignation data:', otherReason);

    return (
        <div className="section-container">
            {loading && <Loading />}
            <div className="section-header">
                <div className="header-info">
                    <h2 className="section-title">Resignations</h2>
                    <p className="section-subtitle">View all employee resignations</p>
                </div>
            </div>

            {/* --- RESIGNATIONS TABLE --- */}
            <div className="table-responsive">
                <table className="simple-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Reason</th>
                            <th>Resignation Date</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                    No resignation records found.
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="user-info">
                                            <span className="font-bold">{item.first_name} {item.last_name}</span>
                                            <small className="text-light">{item.email}</small>
                                        </div>
                                    </td>
                                    <td>{item.department_name}</td>
                                    <td>{item.post_name}</td>
                                    <td>
                                        <span className="resignation-reason-badge">
                                            {item.reason_type === 'Other' ? item.reason : item.reason_type}
                                        </span>
                                    </td>
                                    <td>{item.created_at}</td>
                                    <td className="text-right">
                                        <div className="action-btns-group">
                                            <div className="custom-dropdown">
                                                <button className="drop-btn">Actions</button>
                                                <div className="drop-content">
                                                    <button onClick={() => handleEdit(item)}>Edit Reason</button>
                                                    <button onClick={() => { setTargetId(item.id); setShowDeleteModal(true); }}>Delete Record</button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editModal && (
                <div className="emp-modal-overlay" onClick={() => setEditModal(false)}>
                    <div className="emp-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="emp-modal-header">
                            <h3 className="emp-modal-title">Edit Resignation Reason</h3>
                            <button className="close-btn" onClick={() => { setEditModal(false); setEditData(null); }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="emp-modal-form">
                            <div className="form-section">
                                <h4 className="form-section-title">Employee: {editData?.first_name} {editData?.last_name}</h4>
                                
                                <div className="resignation-options">
                                    {reasonOptions.map((option) => (
                                        <label key={option.id} className="resignation-radio-item">
                                            <input
                                                type="radio"
                                                name="editReasonType"
                                                value={option.label}
                                                checked={editReasonType === option.label}
                                                onChange={(e) => setEditReasonType(e.target.value)}
                                            />
                                            <span className="radio-label">{option.label}</span>
                                        </label>
                                    ))}
                                </div>

                                {editReasonType === 'Other' && (
                                    <div className="other-reason-container">
                                        <label className="other-reason-label">Please specify your reason:</label>
                                        <textarea
                                            className="other-reason-textarea"
                                            placeholder="Enter your reason for resignation..."
                                            value={otherReason}
                                            onChange={(e) => setOtherReason(e.target.value)}
                                            rows={4}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="emp-modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => { setEditModal(false); setEditData(null); }}>Cancel</button>
                                <button type="button" className="btn-save" onClick={handleUpdate}>Update</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <AlertCard
                    title="Delete?"
                    message="Are you sure you want to delete this resignation record? This action cannot be undone."
                    onCancel={() => setShowDeleteModal(false)}
                    onContinue={() => handleDelete(targetId)}
                />
            )}
            <ToastDisplay toast={toast} setToast={setToast} />
        </div>
    );
}
