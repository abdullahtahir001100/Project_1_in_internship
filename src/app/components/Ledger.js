'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../context/ApiProvider';
import Select from 'react-select';
import AlertCard from './AlertCard.js';
import ToastDisplay from './alert.js';
import { TableSkeleton, LoadingButton } from './Skeleton';

const statusOptions = [
    { value: 'vendor', label: 'Vendor' },
    { value: 'customer', label: 'Customer' },
];

export default function Ledger() {
    const { axios } = useApi();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [targetId, setTargetId] = useState(null);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Form fields
    const [formName, setFormName] = useState('');
    const [formLastName, setFormLastName] = useState('');
    const [formAddress, setFormAddress] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formStatus, setFormStatus] = useState(null);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchLedgers();
    }, []);

    async function fetchLedgers() {
        try {
            setLoading(true);
            const res = await axios.get('/ledgers/get_leger');
            setData(res.data || []);
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to load ledgers.' });
        } finally {
            setLoading(false);
        }
    }

    function openModal(item = null) {
        setFormError('');
        if (item) {
            setEditId(item.id);
            setFormName(item.name || '');
            setFormLastName(item.father_name || '');
            setFormAddress(item.cnic || '');
            setFormEmail(item.email || '');
            setFormPhone(item.phone || '');
            setFormStatus(item.status ? statusOptions.find(o => o.value === item.status) || null : null);
        } else {
            setEditId(null);
            setFormName('');
            setFormLastName('');
            setFormAddress('');
            setFormEmail('');
            setFormPhone('');
            setFormStatus(null);
        }
        setShowModal(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        setFormError('');

        const name = formName.trim();
        const father_name = formLastName.trim();
        const cnic = formAddress.trim();
        const email = formEmail.trim();
        const phone = formPhone.trim();
        const status = formStatus ? formStatus.value : '';

        if (!name) { setFormError('First Name is required.'); return; }

        const payload = { name, father_name, cnic, email, phone, status };
        // console.log(payload) 
        if (editId) payload.id = editId;

        const url = editId ? 'update' : 'create';
        const method = editId ? 'put' : 'post';

        try {
            setSaving(true);
            const res = await axios({
                method: method,
                url: `/ledgers/${url}`,
                data: payload,
                headers: { 'Content-Type': 'application/json' }
            });
            setShowModal(false);
            setToast({ show: true, type: 'success', message: res.data?.message || (editId ? 'Ledger updated!' : 'Ledger created!') });
            fetchLedgers();
        } catch (err) {
            setFormError(err?.response?.data?.message || 'Failed to save ledger.');
        } finally {
            setSaving(false);
            setLoading(false);
        }
    }

    async function handleDelete() {
        try {
            setDeleting(true);
            await axios.delete('/ledgers/delete', {
                data: { id: targetId }
            });
            setShowDeleteModal(false);
            setToast({ show: true, type: 'success', message: 'Ledger deleted.' });
            fetchLedgers();
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to delete ledger.' });
        } finally {
            setDeleting(false);
            setLoading(false);
        }
    }

    return (
        <div className="section-container">
            <div className="section-header">
                <div className="header-info">
                    <h2 className="section-title">Ledger Management</h2>
                    <p className="section-subtitle">View, create, edit and delete ledger accounts</p>
                </div>
                <button className="btn-add" onClick={() => openModal()}>
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add New Ledger
                </button>
            </div>

            {/* --- LEDGER TABLE --- */}
            {loading ? (
                <TableSkeleton rows={5} columns={9} showHeader={false} />
            ) : (
                <div className="table-responsive">
                    <table className="simple-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Unique ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Address</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                        No ledgers found.
                                    </td>
                                </tr>
                            )}
                            {data?.map((item) => (
                                <tr key={item.id}>
                                    <td>#{item.id}</td>
                                    <td><span className="status-pill active-status">{item.ledger_unique_id}</span></td>
                                    <td><span className="font-bold">{item.name}</span></td>
                                    <td>{item.father_name || '—'}</td>
                                    <td>{item.cnic || '—'}</td>
                                    <td>{item.email || '—'}</td>
                                    <td>{item.phone || '—'}</td>
                                    <td><span className="status-pill active-status">{item.status || '—'}</span></td>
                                    <td className="text-right">
                                        <div className="custom-dropdown">
                                            <button className="drop-btn">Actions</button>
                                            <div className="drop-content">
                                                <button onClick={() => openModal(item)}>Edit Ledger</button>
                                                <button onClick={() => { setTargetId(item.id); setShowDeleteModal(true); }}>Delete Ledger</button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- ADD/EDIT LEDGER MODAL --- */}
            {showModal && (
                <div className="emp-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="emp-modal-content ledger-modal-size" onClick={(e) => e.stopPropagation()}>
                        <div className="emp-modal-header">
                            <h3 className="emp-modal-title">{editId ? 'Edit' : 'Create'} Ledger</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <form className="emp-modal-form" onSubmit={handleSave}>
                            {formError && (
                                <div className="ledger-form-error">
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="error-icon">
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
                                    </svg>
                                    {formError}
                                </div>
                            )}
                            <div className="form-section">
                                <h4 className="form-section-title">Ledger Information</h4>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>First Name <span className="required-star">*</span></label>
                                        <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="First name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input type="text" value={formLastName} onChange={(e) => setFormLastName(e.target.value)} placeholder="Last name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input type="text" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="eg: block D" />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="text" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="example@company.com" />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+92 300 1234567" />
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <Select
                                            instanceId="ledger-status-select"
                                            options={statusOptions}
                                            value={formStatus}
                                            onChange={(val) => setFormStatus(val)}
                                            placeholder="Select status..."
                                            isClearable
                                            classNamePrefix="select"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="emp-modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <LoadingButton type="submit" className="btn-save" loading={saving} loadingText="Saving...">
                                    {editId ? 'Update' : 'Create'} Ledger
                                </LoadingButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteModal && (
                <AlertCard
                    title="Delete Ledger?"
                    message="This action cannot be undone. Are you sure?"
                    onCancel={() => setShowDeleteModal(false)}
                    onContinue={handleDelete}
                />
            )}

            <ToastDisplay toast={toast} setToast={setToast} />
        </div>
    );
}
