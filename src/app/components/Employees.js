'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../context/ApiProvider';
// Listbox removed as requested
import MarkQuestions from './MarkQuestions';
import ResignationForm from './ResignationForm';
import AlertCard from './AlertCard.js';
import ToastDisplay from './alert.js';
import Select from 'react-select';
import { TableSkeleton, LoadingButton, ModalSkeleton } from './Skeleton';

export default function Employees() {
    const { axios } = useApi();

    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const [selected, setSelected] = useState(null);
    const [posts, setposts] = useState(null);
    const [data, setdata] = useState([]);
    const [options_of_post, setoptions_of_post] = useState([]);
    const [editId, setEditId] = useState(null);
    const [editData, setEditdata] = useState(null);
    const [markEmpId, setMarkEmpId] = useState(null);
    const [resignEmpId, setResignEmpId] = useState(null);
    const [showdelete, setshowdelete] = useState(false);
    const [MultiOP, setMultiOP] = useState([]); // Bonus options
    const [MultiOP1, setMultiOP1] = useState([]); // Deduction options
    const [selectedBonuses, setSelectedBonuses] = useState([]); // Selected bonuses
    const [selectedDeductions, setSelectedDeductions] = useState([]); // Selected deductions
    const [targetId, setTargetId] = useState(null);
    const [selery, setSelery] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [ledgerSaving, setLedgerSaving] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    // Ledger states
    const [ledgers, setLedgers] = useState([]);
    const [selectedLedger, setSelectedLedger] = useState(null);
    const [showLedgerModal, setShowLedgerModal] = useState(false);
    const [ledgerError, setLedgerError] = useState('');
    const ledgerForm = useRef(null);

    // Controlled employee form fields (auto-filled from ledger)
    const [empFirstName, setEmpFirstName] = useState('');
    const [empLastName, setEmpLastName] = useState('');
    const [empEmail, setEmpEmail] = useState('');
    const [empPhone, setEmpPhone] = useState('');
    const [empAddress, setEmpAddress] = useState('');
    const [empSalary, setEmpSalary] = useState(0);

    useEffect(() => {
        setoptions_of_post(selected?.posts || []);
    }, [selected]);

    // Load bonus/deduction options when modal opens
    useEffect(() => {
        if (showModal) {
            get_b_d();
        }
    }, [showModal]);

    async function get_b_d() {
        try {
            const res = await axios.get('/bonus/get');
            const data = res.data;
            const formattedData = data.map(item => ({
                value: String(item.id),
                label: item.bonusName,
                price: item.baseValue
            }));

            const req = await axios.get('/deduction/get');
            const dat1a = req.data;
            const formattedData1 = dat1a.map(item => ({
                value: String(item.id),
                label: item.deduction_name,
                price: item.deduction_amount
            }));

            setMultiOP(formattedData);
            setMultiOP1(formattedData1);
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to load deduction data.' });
        }
    }

    const totalBonus = selectedBonuses ? selectedBonuses.reduce((sum, item) => sum + Number(item.price || item.baseValue), 0) : 0;
    const totalDeductions = selectedDeductions ? selectedDeductions.reduce((sum, item) => sum + Number(item.price || item.baseValue), 0) : 0;
    const netTotal = totalBonus - totalDeductions + (editData?.Salery || 0);

    useEffect(() => {
        async function get_all_info() {
            try {
                setLoading(true);
                const response = await axios.get('/Employees/get_info');
                setOptions(response.data);
            } catch (error) {
                setToast({ show: true, type: 'error', message: 'Failed to load departments.' });
            } finally {
                setLoading(false);
            }
        }
        get_all_info();
    }, []);

    async function fetchLedgers() {
        try {
            const res = await axios.get('/ledgers/get');
            const data = res.data || [];
            setLedgers(data.map(item => ({
                value: item.id,
                label: `${item.name} (${item.ledger_unique_id})`,
                ...item
            })));
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to load ledgers.' });
        }
    }
    useEffect(() => { fetchLedgers(); }, []);

    function handleLedgerChange(option) {
        setSelectedLedger(option);
        if (option && !editId) {
            setEmpFirstName(option.name || '');
            setEmpLastName(option.father_name || '');
            setEmpEmail(option.email || '');
            setEmpPhone(option.phone || '');
            setEmpAddress(option.cnic || '');
            setEmpSalary(option.salary || 0);
        }
    }

    async function handleLedgerSubmit(e) {
        e.preventDefault();
        setLedgerError('');
        const fd = new FormData(ledgerForm.current);
        const name = fd.get('ledger_name')?.trim();
        const father_name = fd.get('ledger_father_name')?.trim();
        const cnic = fd.get('ledger_cnic')?.trim();
        const email = fd.get('ledger_email')?.trim();
        const phone = fd.get('ledger_phone')?.trim();
        const salary = fd.get('ledger_salary')?.trim();

        if (!name) { setLedgerError('First Name is required.'); return; }

        try {
            setLedgerSaving(true);
            await axios.post('/ledgers/create',
                { name, father_name, cnic, email, phone, salary, status: 'employ_simple' },
                { headers: { 'Content-Type': 'application/json' } }
            );
            setShowLedgerModal(false);
            ledgerForm.current?.reset();
            
            setToast({ show: true, type: 'success', message: 'Ledger created!' });
            fetchLedgers();
        } catch (err) {
            setLedgerError(err?.response?.data?.message || 'Failed to create ledger.');
        } finally {
            setLedgerSaving(false);
        }
    }

    async function get_edit_data(id) {
        setEditId(id);
        try {
            setEditLoading(true);
            const response = await axios.get(`/Employees/get_data?id=${id}`);
            const data = response.data;
            setEditdata(data);
            const rawDed = (data.deductions || []).map(d => ({
                value: String(d.value || d.id),
                label: d.label || d.deduction_name,
                price: d.price || d.deduction_amount
            }));
            setSelectedDeductions(rawDed.filter((d, i, arr) => arr.findIndex(x => x.value === d.value) === i));

            const rawBon = (data.bonuses || []).map(b => ({
                value: String(b.value || b.id),
                label: b.label || b.bonusName,
                price: b.price || b.baseValue
            }));
            setSelectedBonuses(rawBon.filter((b, i, arr) => arr.findIndex(x => x.value === b.value) === i));

            setEmpFirstName(data.first_name || '');
            setEmpLastName(data.last_name || '');
            setEmpEmail(data.email || '');
            setEmpPhone(data.phone || '');
            setEmpAddress(data.address || '');
            setEmpSalary(data.Salery || 0);
           
            setSelected({
                department_id: data.department_id,
                department_name: data.department_name,
                posts: data.posts || []
            });
            setSelery(data.Salery);
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to load employee data.' });
        } finally {
            setEditLoading(false);
        }
    }

    async function handleEdit(id) {
        setShowModal(true);
        await get_edit_data(id);
    }

    async function handleDelete(id) {
        try {
            setDeleting(true);
            const response = await axios.delete(`/Employees/delete`, {
                data: { id: id },
            });
            setShowDeleteModal(false);
            setToast({ show: true, type: 'success', message: 'Employee deleted successfully.' });
            get_all_info_table();
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to delete employee.' });
        } finally {
            setDeleting(false);
        }
    }

    const form = useRef(null);
    async function post_data(e) {
        e.preventDefault();
        const formData = new FormData(form.current);

        formData.append('bonuses', JSON.stringify(selectedBonuses.map(b => b.value)));
        formData.append('deductions', JSON.stringify(selectedDeductions.map(d => d.value)));
        if (selectedLedger) formData.append('ledger_id', selectedLedger.value);
        try {
            setSaving(true);
            if (editId) formData.append('id', editId);
            const url = editId ? 'update' : 'create';
            const response = await axios.post(`/Employees/${url}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const data = response.data;
            if (data.success == true) {
                 setToast({ show: true, type: 'success', message: data.message });
            setShowModal(false);
            setEditId(null);
            setEditdata(null);
            setSelectedLedger(null);
            setEmpFirstName(''); setEmpLastName(''); setEmpEmail('');
            setEmpPhone(''); setEmpAddress(''); setEmpSalary(0);
            get_all_info_table();
            }
            else{
                setToast({ show: true, type: 'error', message: data.error || 'Failed to save employee.' });
            }
           
        } catch (error) {
            setToast({ show: true, type: 'error', message: error?.message || 'Error occurred' });
        } finally {
            setSaving(false);
        }
    }

    async function get_all_info_table() {
        try {
            setLoading(true);
            const response = await axios.get('/Employees/get');
            const data = response.data;
            setdata(data);
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to load employees.' });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        get_all_info_table();
    }, []);

    if (markEmpId) {
        return <MarkQuestions empId={markEmpId} onBack={() => setMarkEmpId(null)} />;
    }

    if (resignEmpId) {
        return <ResignationForm empId={resignEmpId} onBack={() => setResignEmpId(null)} />;
    }

    return (
        <div className="section-container">
            <div className="section-header">
                <div className="header-info">
                    <h2 className="section-title">Employee Directory</h2>
                    <p className="section-subtitle">Manage your workforce and their roles</p>
                </div>
                <button className="btn-add" onClick={() => setShowModal(true)}>
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add New Employee
                </button>
            </div>

            {loading ? (
                <TableSkeleton rows={5} columns={6} showHeader={false} />
            ) : (
                <div className="table-responsive">
                    <table className="simple-table">
                        <thead>
                            <tr>
                                <th>Emp ID</th>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((emp) => (
                                <tr key={emp.id}>
                                    <td>#EMP-00{emp.id}</td>
                                    <td>
                                        <div className="user-info">
                                            <span className="font-bold">{emp.first_name} {emp.last_name}</span>
                                            <small className="text-light">{emp.email}</small>
                                        </div>
                                    </td>
                                    <td>{emp.department_name}</td>
                                    <td>{emp.phone}</td>
                                    <td><span className="status-pill active-status">{emp.post_name}</span></td>
                                    <td className="text-right">
                                        <div className="action-btns-group">
                                            <div className="custom-dropdown">
                                                <button className="drop-btn">Actions</button>
                                                <div className="drop-content">
                                                    <button onClick={() => handleEdit(emp.id)}>Edit Employee Detail</button>
                                                    <button onClick={() => { setTargetId(emp.id); setShowDeleteModal(true); }}>Delete Employee</button>
                                                    <button onClick={() => setMarkEmpId(emp.id)}>Mark Questions</button>
                                                    <button onClick={() => setResignEmpId(emp.id)}>Resign Employee</button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="emp-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="emp-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="emp-modal-header">
                            <h3 className="emp-modal-title">{editId ? 'Edit Employee' : 'Add New Employee'}</h3>
                            <button className="close-btn" onClick={() => {
                                setShowModal(false);
                                setEditId(null);
                                setEditdata(null);
                                setSelectedLedger(null);
                                setEmpFirstName(''); setEmpLastName(''); setEmpEmail('');
                                setEmpPhone(''); setEmpAddress(''); setEmpSalary(0);
                                
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {editLoading ? (
                            <ModalSkeleton fields={8} showFooter={true} />
                        ) : (
                        <form className="emp-modal-form" ref={form} onSubmit={post_data}>
                            <div className="form-section">
                                <h4 className="form-section-title">Ledger Account</h4>
                                <div className="ledger-select-row">
                                    <div className="ledger-select-field">
                                        <label>Select Ledger</label>
                                        <Select
                                            instanceId="ledger-select"
                                            options={ledgers}
                                            value={selectedLedger}
                                            onChange={handleLedgerChange}
                                            placeholder="Search ledger..."
                                            
                                            classNamePrefix="select"

                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="ledger-add-btn"
                                        title="Create new ledger"
                                        onClick={() => setShowLedgerModal(true)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 5v14" /><path d="M5 12h14" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4 className="form-section-title">Personal Info</h4>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input type="text" placeholder="John" name='first_name' value={empFirstName} onChange={(e) => setEmpFirstName(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input type="text" placeholder="Doe" name='last_name' value={empLastName} onChange={(e) => setEmpLastName(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" placeholder="john@example.com" name='email' value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input type="tel" placeholder="+92 300 1234567" name='phone' value={empPhone} onChange={(e) => setEmpPhone(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Salary</label>
                                        <input type="number" placeholder="Enter salary" name='salary' value={empSalary} onChange={(e) => setEmpSalary(e.target.value)} />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Address</label>
                                        <input type="text" placeholder="House #, Street, City" name='address' value={empAddress} onChange={(e) => setEmpAddress(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4 className="form-section-title">Work Info</h4>
                                <div className="form-grid">
                                    {/* Department React Select */}
                                    <div className="form-group">
                                        <label>Department</label>
                                        <input type="hidden" name="department_id" value={selected?.department_id ?? ''} />
                                        <Select
                                            instanceId="dept-select"
                                            options={options}
                                            getOptionLabel={(opt) => opt.department_name}
                                            getOptionValue={(opt) => opt.department_id}
                                            value={selected}
                                            onChange={(val) => { setSelected(val); setposts(null); }}
                                            placeholder="Select Department"
                                            classNamePrefix="select"
                                            
                                        />
                                    </div>

                                    {/* Designation React Select */}
                                    <div className="form-group">
                                        <label>Designation</label>
                                        <input type="hidden" name="post_id" value={posts?.id ?? ''} />
                                        <Select
                                            instanceId="post-select"
                                            options={options_of_post}
                                            getOptionLabel={(opt) => opt.Post_name}
                                            getOptionValue={(opt) => opt.id}
                                            value={posts}
                                            onChange={(val) => setposts(val)}
                                            placeholder="Select Designation"
                                            classNamePrefix="select"
                                            noOptionsMessage={() => "Select a department first"}
                                        />
                                    </div>

                                    <div className="payroll-container">
                                        <div className="form-group">
                                            <label className='pos1'>Allowences</label>
                                            <div className="summary-line">
                                                <span>Total Bonus:</span>
                                                <span className="summary-value">$ {totalBonus}</span>
                                            </div>
                                            <Select
                                                isMulti
                                                menuPlacement="top"
                                                instanceId="bonus-multi-select"
                                                options={MultiOP}
                                                value={selectedBonuses}
                                                onChange={setSelectedBonuses}
                                                getOptionValue={(opt) => opt.value}
                                                placeholder="Select bonuses..."
                                                isClearable={false}
                                                classNamePrefix="select"
                                                formatOptionLabel={(option) => (
                                                    <div className="row-option">
                                                        <span>{option.label}</span>
                                                        <span className="item-price">${option.price || option.baseValue}</span>
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <div className="summary-line">
                                                <span>Total Deductions:</span>
                                                <span className="summary-value">$ {totalDeductions}</span>
                                            </div>
                                            <label className='pos2'>Deductions</label>
                                            <Select
                                                isMulti
                                                menuPlacement="top"
                                                instanceId="deduction-multi-select"
                                                options={MultiOP1}
                                                isClearable={false}
                                                value={selectedDeductions}
                                                onChange={setSelectedDeductions}
                                                getOptionValue={(opt) => opt.value}
                                                placeholder="Select deductions..."
                                                classNamePrefix="select"
                                                formatOptionLabel={(option) => (
                                                    <div className="row-option">
                                                        <span>{option.label}</span>
                                                        <span className="item-price">${option.price || option.baseValue}</span>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="summary-total">
                                <strong>Net Total:&nbsp;</strong>
                                <strong>$ {netTotal}</strong>
                            </div>
                            <div className="emp-modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => {
                                    setShowModal(false);
                                    setEditId(null);
                                    setEditdata(null);
                                    setSelectedLedger(null);
                                    setEmpFirstName(''); setEmpLastName(''); setEmpEmail('');
                                    setEmpPhone(''); setEmpAddress(''); setEmpSalary(0);
                                }}>Cancel</button>
                                <LoadingButton type="submit" className="btn-save" loading={saving} loadingText="Saving...">
                                    Save
                                </LoadingButton>
                            </div>
                        </form>
                        )}
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <AlertCard
                    title="Delete?"
                    message="Confirm delete employee. This action cannot be undone."
                    onCancel={() => setShowDeleteModal(false)}
                    onContinue={() => handleDelete(targetId)}
                    loading={deleting}
                />
            )}

            {showLedgerModal && (
                <div className="emp-modal-overlay" onClick={() => setShowLedgerModal(false)}>
                    <div className="emp-modal-content ledger-modal-size" onClick={(e) => e.stopPropagation()}>
                        <div className="emp-modal-header">
                            <h3 className="emp-modal-title">Create New Ledger</h3>
                            <button className="close-btn" onClick={() => setShowLedgerModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <form className="emp-modal-form" ref={ledgerForm} onSubmit={handleLedgerSubmit}>
                            {ledgerError && (
                                <div className="ledger-form-error">
                                    {ledgerError}
                                </div>
                            )}
                            <div className="form-section">
                                <h4 className="form-section-title">Ledger Information</h4>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>First Name <span className="required-star">*</span></label>
                                        <input type="text" name="ledger_name" placeholder="First name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input type="text" name="ledger_father_name" placeholder="Last name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input type="text" name="ledger_cnic" placeholder="eg: block D" />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" name="ledger_email" placeholder="email@example.com" />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input type="text" name="ledger_phone" placeholder="03xxxxxxxxx" />
                                    </div>
                                    <div className="form-group">
                                        <label>Salary</label>
                                        <input type="number" name="ledger_salary" placeholder="0" />
                                    </div>
                                </div>
                            </div>
                            <div className="emp-modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowLedgerModal(false)}>Cancel</button>
                                <LoadingButton type="submit" className="btn-save" loading={ledgerSaving} loadingText="Creating...">
                                    Create Ledger
                                </LoadingButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {toast.show && <ToastDisplay toast={toast} setToast={setToast} />}
        </div>
    );
}