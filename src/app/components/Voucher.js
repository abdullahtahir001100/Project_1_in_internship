'use client'
import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import axios from 'axios';
import ToastDisplay from './alert.js';
import AlertCard from './AlertCard.js';
import Loading from './loading.js';

const API_BASE = '/api/api/vouchers';

// Generate JV number
function generateJVNumber(type = 'JV') {
    let currentNumber;
      const STORAGE_KEY = "jv_sequence";

        currentNumber = parseInt(localStorage.getItem(STORAGE_KEY), 10);
          if (isNaN(currentNumber)) {
            currentNumber = 100000;
        }
    if (type == 'gen') {


      

        if (isNaN(currentNumber)) {
            currentNumber = 100000;
        } else {
            currentNumber += 1;
        }

        localStorage.setItem(STORAGE_KEY, currentNumber);


    }
   
    return String(currentNumber);

}

// Get today's date parts
function getTodayParts() {
    const today = new Date();
    return {
        day: String(today.getDate()).padStart(2, '0'),
        month: String(today.getMonth() + 1).padStart(2, '0'),
        year: String(today.getFullYear()),
    };
}

// Parse YYYY-MM-DD to parts
function parseDateParts(dateStr) {
    if (!dateStr) return getTodayParts();
    const parts = dateStr.split('-');
    return {
        year: parts[0] || '',
        month: parts[1] || '',
        day: parts[2] || '',
    };
}

// Custom styles for react-select to match project
const selectStyles = {
    control: (base) => ({
        ...base,
        minHeight: '38px',
        fontSize: '0.85rem',
        borderColor: '#ddd',
        borderRadius: '1px',
        boxShadow: 'none',
        '&:hover': { borderColor: '#999' },
    }),
    option: (base, { isFocused, isSelected }) => ({
        ...base,
        fontSize: '0.85rem',
        backgroundColor: isSelected ? '#555' : isFocused ? '#f5f5f5' : '#fff',
        color: isSelected ? '#fff' : '#222',
    }),
    placeholder: (base) => ({ ...base, color: '#999' }),
    menu: (base) => ({ ...base, borderRadius: '1px', zIndex: 20 }),
};

export default function Voucher() {
    const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // Delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    // ---- Form state ----
    const [editId, setEditId] = useState(null);
    const [jvNumber, setJvNumber] = useState(generateJVNumber());
    const [referenceNo, setReferenceNo] = useState('');
    const [dateDay, setDateDay] = useState(getTodayParts().day);
    const [dateMonth, setDateMonth] = useState(getTodayParts().month);
    const [dateYear, setDateYear] = useState(getTodayParts().year);

    const [debitRows, setDebitRows] = useState([
        { id: 1, ledger: null, description: '', amount: '' },
    ]);
    const [creditRows, setCreditRows] = useState([
        { id: 1, ledger: null, description: '', amount: '' },
    ]);

    const [narration, setNarration] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [attachmentPreview, setAttachmentPreview] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const fileRef = useRef(null);

    // ---- Ledgers ----
    const [ledgers, setLedgers] = useState([]);

    useEffect(() => {
        fetchLedgers();
        fetchVouchers();
    }, []);

    async function fetchLedgers() {
        try {
            const res = await axios.get('/api/api/Employees/get');
            setLedgers(res.data || []);
        } catch (err) {
            /* silent */
        }
    }

    const ledgerOptions = ledgers.map((l) => ({
        value: l.id,
        label: `${l.first_name}${l.last_name} - (${l.phone})`,
        data: l,
    }));

    // =============================
    // FETCH ALL VOUCHERS (GET)
    // =============================
    async function fetchVouchers() {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/get`);
            setVouchers(res.data || []);
        } catch (err) {
            setToast({ show: true, type: 'error', message: 'Failed to load vouchers.' });
        } finally {
            setLoading(false);
        }
    }

    // =============================
    // FETCH SINGLE VOUCHER (GET_SINGLE)
    // =============================
    async function fetchSingleVoucher(id) {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/get_single?id=${id}`);
            return res.data;
        } catch (err) {
            setToast({ show: true, type: 'error', message: 'Failed to load voucher details.' });
            return null;
        } finally {
            setLoading(false);
        }
    }

    // =============================
    // DELETE VOUCHER
    // =============================
    async function handleDelete() {
        if (!deleteTargetId) return;
        try {
            setLoading(true);
            const res = await axios.delete(`${API_BASE}/delete`, {
                data: { id: deleteTargetId },
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.data.success) {
                setToast({ show: true, type: 'success', message: 'Voucher deleted successfully!' });
                fetchVouchers();
            } else {
                setToast({ show: true, type: 'error', message: res.data.message || 'Failed to delete.' });
            }
        } catch (err) {
            setToast({ show: true, type: 'error', message: 'Something went wrong while deleting!' });
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setDeleteTargetId(null);
        }
    }

    // =============================
    // OPEN EDIT — populate form from API
    // =============================
    async function openEdit(id) {
        const data = await fetchSingleVoucher(id);
        if (!data) return;

        setEditId(data.id);
        setJvNumber(data.jv_number || '');
        setReferenceNo(data.reference_no || '');

        const dp = parseDateParts(data.date);
        setDateDay(dp.day);
        setDateMonth(dp.month);
        setDateYear(dp.year);

        setNarration(data.narration || '');

        // Map debit entries
        if (data.debit_entries && data.debit_entries.length > 0) {
            setDebitRows(
                data.debit_entries.map((entry, idx) => {
                    const matchedLedger = ledgerOptions.find((o) => String(o.value) === String(entry.ledger_id));
                    return {
                        id: idx + 1,
                        ledger: matchedLedger || { value: entry.ledger_id, label: `${entry.ledger_id} - ${entry.ledger_name || 'Unknown'}` },
                        description: entry.description || '',
                        amount: entry.amount || '',
                    };
                })
            );
        } else {
            setDebitRows([{ id: 1, ledger: null, description: '', amount: '' }]);
        }

        // Map credit entries
        if (data.credit_entries && data.credit_entries.length > 0) {
            setCreditRows(
                data.credit_entries.map((entry, idx) => {
                    const matchedLedger = ledgerOptions.find((o) => String(o.value) === String(entry.ledger_id));
                    return {
                        id: idx + 1,
                        ledger: matchedLedger || { value: entry.ledger_id, label: `${entry.ledger_id} - ${entry.ledger_name || 'Unknown'}` },
                        description: entry.description || '',
                        amount: entry.amount || '',
                    };
                })
            );
        } else {
            setCreditRows([{ id: 1, ledger: null, description: '', amount: '' }]);
        }

        // Image
        setAttachment(null);
        if (data.image) {
            setExistingImage(data.image);
            setAttachmentPreview(`/api/${data.image}`);
        } else {
            setExistingImage(null);
            setAttachmentPreview(null);
        }

        setView('edit');
    }

    // ---- Debit row helpers ----
    const addDebitRow = () => {
        setDebitRows([
            ...debitRows,
            { id: Date.now(), ledger: null, description: '', amount: '' },
        ]);
    };
    const removeDebitRow = (id) => {
        if (debitRows.length === 1) return;
        setDebitRows(debitRows.filter((r) => r.id !== id));
    };
    const updateDebitRow = (id, field, value) => {
        setDebitRows(debitRows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    };

    // ---- Credit row helpers ----
    const addCreditRow = () => {
        setCreditRows([
            ...creditRows,
            { id: Date.now(), ledger: null, description: '', amount: '' },
        ]);
    };
    const removeCreditRow = (id) => {
        if (creditRows.length === 1) return;
        setCreditRows(creditRows.filter((r) => r.id !== id));
    };
    const updateCreditRow = (id, field, value) => {
        setCreditRows(creditRows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    };

    // ---- Totals ----
    const debitTotal = debitRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const creditTotal = creditRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    // ---- Image handler ----
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachment(file);
            setAttachmentPreview(URL.createObjectURL(file));
            setExistingImage(null);
        }
    };
    const removeImage = () => {
        setAttachment(null);
        setAttachmentPreview(null);
        setExistingImage(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    // ---- Reset form ----
    const resetForm = () => {
        setEditId(null);
        setJvNumber(generateJVNumber());
        setReferenceNo('');
        const today = getTodayParts();
        setDateDay(today.day);
        setDateMonth(today.month);
        setDateYear(today.year);
        setDebitRows([{ id: 1, ledger: null, description: '', amount: '' }]);
        setCreditRows([{ id: 1, ledger: null, description: '', amount: '' }]);
        setNarration('');
        setAttachment(null);
        setAttachmentPreview(null);
        setExistingImage(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    // =============================
    // CREATE / UPDATE SUBMIT
    // =============================
    const handleSubmit = async () => {
        // Validation
        if (!referenceNo.trim()) {
            setToast({ show: true, type: 'warning', message: 'Please enter a reference number.' });
            return;
        }
        if (debitRows.some((r) => !r.ledger || !r.amount)) {
            setToast({ show: true, type: 'warning', message: 'Please fill all debit rows (ledger & amount).' });
            return;
        }
        if (creditRows.some((r) => !r.ledger || !r.amount)) {
            setToast({ show: true, type: 'warning', message: 'Please fill all credit rows (ledger & amount).' });
            return;
        }
        if (debitTotal !== creditTotal) {
            setToast({ show: true, type: 'warning', message: 'Please fill all credit and debts equally' });
            return;
        }

        const isUpdate = view === 'edit' && editId;

        const payload = {
            ...(isUpdate ? { id: editId } : {}),
            jv_number: jvNumber,
            reference_no: referenceNo,
            date: `${dateYear}-${dateMonth}-${dateDay}`,
            debit_entries: debitRows.map((r) => ({
                ledger_id: r.ledger.value,
                description: r.description,
                amount: Number(r.amount),
            })),
            credit_entries: creditRows.map((r) => ({
                ledger_id: r.ledger.value,
                description: r.description,
                amount: Number(r.amount),
            })),
            narration: narration,
        };

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('payload', JSON.stringify(payload));
            if (attachment) {
                formData.append('attachment', attachment);
            }

            const url = isUpdate
                ? `${API_BASE}/update`
                : `${API_BASE}/create`;

            const res = await axios.post(url, formData);

            if (res.data.success) {
                setToast({
                    show: true,
                    type: 'success',
                    message: isUpdate ? 'Voucher updated successfully!' : 'Voucher saved successfully!',
                });
                resetForm();
                fetchVouchers();
                setView('list');
                generateJVNumber('gen'); // Increment JV number for next entry
            } else {
                setToast({ show: true, type: 'error', message: res.data.message || res.data.error || 'Failed to save voucher.' });
            }
        } catch (err) {
            setToast({ show: true, type: 'error', message: 'Something went wrong while saving!' });
        } finally {
            setLoading(false);
        }
    };

    // ---- LIST VIEW ----
    if (view === 'list') {
        return (
            <div className="section-container">
                {loading && <Loading />}

                {showDeleteModal && (
                    <AlertCard
                        title="Delete Voucher"
                        message="Are you sure you want to delete this voucher? This action cannot be undone."
                        onCancel={() => { setShowDeleteModal(false); setDeleteTargetId(null); }}
                        onContinue={handleDelete}
                    />
                )}

                <div className="section-header">
                    <div className="header-info">
                        <h2 className="section-title">Journal Vouchers</h2>
                        <p className="section-subtitle">Manage journal voucher entries</p>
                    </div>
                    <button className="btn-add" onClick={() => { resetForm(); setView('add'); }}>
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                        Create Voucher
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="simple-table">
                        <thead>
                            <tr>
                                <th>JV Number</th>
                                <th>Reference No</th>
                                <th>Date</th>
                                <th>Debit Total</th>
                                <th>Credit Total</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                        No vouchers yet. Click &quot;Create Voucher&quot; to add one.
                                    </td>
                                </tr>
                            ) : (
                                vouchers.map((v) => (
                                    <tr key={v.id}>
                                        <td>{v.jv_number}</td>
                                        <td>{v.reference_no}</td>
                                        <td>{v.date}</td>
                                        <td>{Number(v.debit_total || 0).toLocaleString()}</td>
                                        <td>{Number(v.credit_total || 0).toLocaleString()}</td>
                                        <td className="text-right">
                                            <div className="custom-dropdown">
                                                <button className="drop-btn">Actions</button>
                                                <div className="drop-content">
                                                    <button onClick={() => openEdit(v.id)}>Edit</button>
                                                    <button onClick={() => { setDeleteTargetId(v.id); setShowDeleteModal(true); }}>Delete</button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <ToastDisplay toast={toast} setToast={setToast} />
            </div>
        );
    }

    // ---- ADD / EDIT FORM VIEW ----
    const isEditMode = view === 'edit';

    return (
        <div className="voucher-form-wrapper">
            {loading && <Loading />}

            {/* Header */}
            <div className="vf-header">
                <div>
                    <h2 className="vf-title">{isEditMode ? 'Edit Journal Voucher' : 'Journal Voucher'}</h2>
                    <p className="vf-subtitle">{isEditMode ? 'Update voucher entry' : 'Create a new journal entry'}</p>
                </div>
                <button className="btn-back" onClick={() => { resetForm(); setView('list'); }}>← Back</button>
            </div>

            {/* Top Row — JV Number, Reference, Date */}
            <div className="vf-top-row">
                <div className="vf-field">
                    <label>JV Series / Number</label>
                    <div className="flex">
                        <input type="text" className="vf-input" value={'JV'} readOnly />
                        <input type="text" className="vf-input" value={jvNumber} readOnly />
                    </div>
                </div>

                <div className="vf-field">
                    <label>Reference No</label>
                    <input
                        type="text"
                        className="vf-input"
                        placeholder="Enter reference..."
                        value={referenceNo}
                        onChange={(e) => setReferenceNo(e.target.value)}
                    />
                </div>
                <div className="vf-field vf-date-group">
                    <label>Date</label>
                    <div className="vf-date-inputs">
                        <input
                            type="text"
                            className="vf-input vf-date-input"
                            placeholder="DD"
                            maxLength={2}
                            value={dateDay}
                            onChange={(e) => setDateDay(e.target.value)}
                        />
                        <span className="vf-date-sep">/</span>
                        <input
                            type="text"
                            className="vf-input vf-date-input"
                            placeholder="MM"
                            maxLength={2}
                            value={dateMonth}
                            onChange={(e) => setDateMonth(e.target.value)}
                        />
                        <span className="vf-date-sep">/</span>
                        <input
                            type="text"
                            className="vf-input vf-date-input vf-date-year"
                            placeholder="YYYY"
                            maxLength={4}
                            value={dateYear}
                            onChange={(e) => setDateYear(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ===== DEBIT TABLE ===== */}
            <div className="vf-section">
                <div className="vf-section-head">
                    <h3 className="vf-section-title">Debit</h3>
                    <span className="vf-section-total">Total: {debitTotal.toLocaleString()}</span>
                </div>
                <table className="vf-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Ledger</th>
                            <th>Description</th>
                            <th style={{ width: '140px' }}>Amount</th>
                            <th style={{ width: '100px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {debitRows.map((row, idx) => (
                            <tr key={row.id}>
                                <td className="vf-num">{idx + 1}</td>
                                <td>
                                    <Select
                                        styles={selectStyles}
                                        options={ledgerOptions}
                                        value={row.ledger}
                                        onChange={(val) => updateDebitRow(row.id, 'ledger', val)}
                                        placeholder="Select ledger..."
                                        isClearable={false}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="vf-input"
                                        placeholder="Description..."
                                        value={row.description}
                                        onChange={(e) => updateDebitRow(row.id, 'description', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="vf-input vf-amount"
                                        placeholder="0"
                                        value={row.amount}
                                        onChange={(e) => updateDebitRow(row.id, 'amount', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <div className="vf-row-actions">
                                        <button className="vf-btn-add" onClick={addDebitRow} title="Add row">+</button>
                                        <button
                                            className="vf-btn-del"
                                            onClick={() => removeDebitRow(row.id)}
                                            title="Remove row"
                                            disabled={debitRows.length === 1}
                                        >×</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ===== CREDIT TABLE ===== */}
            <div className="vf-section">
                <div className="vf-section-head">
                    <h3 className="vf-section-title">Credit</h3>
                    <span className="vf-section-total">Total: {creditTotal.toLocaleString()}</span>
                </div>
                <table className="vf-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Ledger</th>
                            <th>Description</th>
                            <th style={{ width: '140px' }}>Amount</th>
                            <th style={{ width: '100px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {creditRows.map((row, idx) => (
                            <tr key={row.id}>
                                <td className="vf-num">{idx + 1}</td>
                                <td>
                                    <Select
                                        styles={selectStyles}
                                        options={ledgerOptions}
                                        value={row.ledger}
                                        onChange={(val) => updateCreditRow(row.id, 'ledger', val)}
                                        placeholder="Select ledger..."
                                        isClearable={false}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="vf-input"
                                        placeholder="Description..."
                                        value={row.description}
                                        onChange={(e) => updateCreditRow(row.id, 'description', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="vf-input vf-amount"
                                        placeholder="0"
                                        value={row.amount}
                                        onChange={(e) => updateCreditRow(row.id, 'amount', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <div className="vf-row-actions">
                                        <button className="vf-btn-add" onClick={addCreditRow} title="Add row">+</button>
                                        <button
                                            className="vf-btn-del"
                                            onClick={() => removeCreditRow(row.id)}
                                            title="Remove row"
                                            disabled={creditRows.length === 1}
                                        >×</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ===== BALANCE INDICATOR ===== */}
            <div className={`vf-balance ${debitTotal === creditTotal && debitTotal > 0 ? 'balanced' : 'unbalanced'}`}>
                <span>Debit: {debitTotal.toLocaleString()}</span>
                <span className="vf-balance-divider">|</span>
                <span>Credit: {creditTotal.toLocaleString()}</span>
                <span className="vf-balance-divider">|</span>
                <span>
                    {debitTotal === creditTotal
                        ? (debitTotal > 0 ? '✓ Balanced' : 'Enter amounts')
                        : `Difference: ${Math.abs(debitTotal - creditTotal).toLocaleString()}`
                    }
                </span>
            </div>

            {/* ===== NARRATION & IMAGE ===== */}
            <div className="vf-bottom-section">
                <div className="vf-narration">
                    <label>Narration / Notes</label>
                    <textarea
                        className="vf-textarea"
                        placeholder="Enter narration or additional notes..."
                        rows={4}
                        value={narration}
                        onChange={(e) => setNarration(e.target.value)}
                    />
                </div>

                <div className="vf-attachment">
                    <label>Attachment</label>
                    <div className="vf-file-area">
                        {attachmentPreview ? (
                            <div className="vf-preview">
                                <img src={attachmentPreview} alt="Attachment" />
                                <button className="vf-preview-remove" onClick={removeImage}>×</button>
                            </div>
                        ) : (
                            <div className="vf-file-placeholder" onClick={() => fileRef.current?.click()}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="m21 15-5-5L5 21" />
                                </svg>
                                <span>Click to upload image</span>
                            </div>
                        )}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleImageChange}
                        />
                    </div>
                </div>
            </div>

            {/* ===== FOOTER ===== */}
            <div className="vf-footer">
                <button className="btn-cancel" onClick={() => { resetForm(); setView('list'); }}>Cancel</button>
                <button className="btn-save" onClick={handleSubmit}>
                    {isEditMode ? 'Update Voucher' : 'Save Voucher'}
                </button>
            </div>

            <ToastDisplay toast={toast} setToast={setToast} />
        </div>
    );
}
