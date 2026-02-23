'use client'
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Listbox } from "@headlessui/react";
import MarkQuestions from './MarkQuestions';
import AlertCard from './AlertCard.js';
import ToastDisplay from './alert.js';
import Select from 'react-select';
import Loading from './loading.js';
export default function Employees() {

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
    const [showdelete, setshowdelete] = useState(false);
    const [MultiOP, setMultiOP] = useState([]); // Bonus options
    const [MultiOP1, setMultiOP1] = useState([]); // Deduction options
    const [selectedBonuses, setSelectedBonuses] = useState([]); // Selected bonuses
    const [selectedDeductions, setSelectedDeductions] = useState([]); // Selected deductions
    const [targetId, setTargetId] = useState(null);
    const [selery, setSelery] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
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
            const res = await axios.get('http://localhost/react-backend/api/bonus/get.php');

            const data = res.data;

            const formattedData = data.map(item => ({
                value: item.id,
                label: item.bonusName,
                price: item.baseValue
            }));

            const req = await axios.get('http://localhost/react-backend/api/deduction/get.php');

            const dat1a = req.data;

            const formattedData1 = dat1a.map(item => ({
                value: item.id,
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
                const response = await axios.get('http://localhost/react-backend/api/Employees/get_info.php');
                const data = response.data;
                setOptions(data);



            } catch (error) {
                setToast({ show: true, type: 'error', message: 'Failed to load departments.' });
            } finally {
                setLoading(false);
            }
        }
        get_all_info();
    }, []);
    async function get_edit_data(id) {
        setEditId(id);
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost/react-backend/api/Employees/get_data.php?id=${id}`);
            const data = response.data;
            setEditdata(data);
            setSelectedDeductions(data.deductions || []);
            setSelectedBonuses(data.bonuses || []);
           
            setSelected({
                department_id: data.department_id,
                department_name: data.department_name,
                posts: data.posts || []
            });
            setSelery(data.Salery);
            
          

            // setposts(data?.post_name)



        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to load employee data.' });
        } finally {
            setLoading(false);
        }
    }
    async function handleEdit(id) {
        setShowModal(true);
        await get_edit_data(id);
    }
    async function handleDelete(id) {
        try {
            const response = await axios.delete(`http://localhost/react-backend/api/Employees/delete.php`, {
                data: { id: id },
            });
            const data = response.data;
            setShowDeleteModal(false);
            setToast({ show: true, type: 'success', message: 'Employee deleted successfully.' });
            get_all_info_table();
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to delete employee.' });
        }
    }
    const form = useRef(null);
    async function post_data(e) {
        e.preventDefault();
        const formData = new FormData(form.current);

        formData.append('bonuses', JSON.stringify(selectedBonuses.map(b => b.value)));
        formData.append('deductions', JSON.stringify(selectedDeductions.map(d => d.value)));
        try {
            setLoading(true);
            if (editId) formData.append('id', editId);
            const url = editId ? 'update.php' : 'create.php';
            const response = await axios.post(`http://localhost/react-backend/api/Employees/${url}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const data = response.data;
            setToast({ show: true, type: 'success', message: data.message });
            setShowModal(false);
            setEditId(null);
            setEditdata(null);
            get_all_info_table();
        } catch (error) {
            setToast({ show: true, type: 'error', message: error?.message || 'Error occurred' });
        } finally {
            setLoading(false);
        }
    }
    async function get_all_info_table() {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost/react-backend/api/Employees/get.php');
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
    


    return (
        <div className="section-container">
            {loading && <Loading />}
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

            {/* --- EMPLOYEES TABLE --- */}
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
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- EMPLOYEE MODAL POPUP --- */}
            {showModal && (
                <div className="emp-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="emp-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="emp-modal-header">
                            <h3 className="emp-modal-title">Add New Employee</h3>
                            <button className="close-btn" onClick={() => {
                                setShowModal(false);
                                setEditId(null);
                                setEditdata(null);
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form className="emp-modal-form" ref={form} onSubmit={post_data}>
                            <div className="form-section">
                                <h4 className="form-section-title">Personal Info</h4>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input type="text" placeholder="John" name='first_name' defaultValue={editId ? editData?.first_name : ""} />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input type="text" placeholder="Doe" name='last_name' defaultValue={editId ? editData?.last_name : ""} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" placeholder="john@example.com" name='email' defaultValue={editId ? editData?.email : ""} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input type="tel" placeholder="+92 300 1234567" name='phone' defaultValue={editId ? editData?.phone : ""} />
                                    </div>
                                    <div className="form-group">
                                        <label>Salary</label>
                                        <input type="number" placeholder="Enter salary" name='salary' defaultValue={selery} />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Address</label>
                                        <input type="text" placeholder="House #, Street, City" name='address' defaultValue={editId ? editData?.address : ""} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4 className="form-section-title">Work Info</h4>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Department</label>
                                        <Listbox value={selected} onChange={setSelected}>
                                            <div className="custom-select-container">
                                                <input type="hidden" name="department_id" value={selected?.department_id ?? ''} />
                                                <Listbox.Button className="select-trigger">
                                                    <span>{selected ? selected?.department_name : "Select"}</span>
                                                    <svg className="chevron-icon" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                                    </svg>
                                                </Listbox.Button>
                                                <Listbox.Options className="select-options">
                                                    {options.map((opt) => (
                                                        <Listbox.Option key={opt.department_id} value={opt} className={({ active }) => `option-item ${active ? 'active' : ''}`}>
                                                            {opt.department_name}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </div>
                                        </Listbox>
                                    </div>
                                    <div className="form-group">
                                        <label>Designation</label>
                                        <Listbox value={posts} onChange={setposts}>
                                            <div className="custom-select-container">
                                                <input type="hidden" name="post_id" value={posts?.id ?? ''} />
                                                <Listbox.Button className="select-trigger">
                                                    <span>{posts ? posts?.Post_name : "Select"}</span>
                                                    <svg className="chevron-icon" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                                    </svg>
                                                </Listbox.Button>
                                                <Listbox.Options className="select-options">
                                                    {options_of_post.map((opt) => (
                                                        <Listbox.Option key={opt.id} value={opt} className={({ active }) => `option-item ${active ? 'active' : ''}`}>
                                                            {opt.Post_name}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </div>
                                        </Listbox>
                                    </div>

                                    <div className="payroll-container">
                                        <div className="form-group">
                                            <label className='pos1'>Allowences</label>
                                            <div className="summary-line">
                                                <span>Total Bonus:</span>
                                                <span className="summary-value">$ {totalBonus}</span>
                                            </div>
                                            <div className="custom-select-container">
                                                <Select
                                                    isMulti
                                                    menuPlacement="top"
                                                    instanceId="bonus-multi-select"
                                                    options={MultiOP}
                                                    value={selectedBonuses}
                                                    onChange={setSelectedBonuses}
                                                    placeholder="Select bonuses..."
                                                    classNamePrefix="select"
                                                    formatOptionLabel={(option) => (
                                                        <div className="row-option">
                                                            <span>{option.label}</span>
                                                            <span className="item-price">${option.price || option.baseValue}</span>
                                                        </div>
                                                    )}
                                                    components={{ DropdownIndicator: null, IndicatorSeparator: null, ClearIndicator: null }}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <div className="summary-line">
                                                <span>Total Deductions:</span>
                                                <span className="summary-value">$ {totalDeductions}</span>
                                            </div>
                                            <label className='pos2'>Deductions</label>
                                            <div className="custom-select-container">
                                                <Select
                                                    isMulti
                                                    menuPlacement="top"
                                                    instanceId="deduction-multi-select"
                                                    options={MultiOP1}
                                                    value={selectedDeductions}
                                                    onChange={setSelectedDeductions}
                                                    placeholder="Select deductions..."
                                                    classNamePrefix="select"
                                                    formatOptionLabel={(option) => (
                                                        <div className="row-option">
                                                            <span>{option.label}</span>
                                                            <span className="item-price">${option.price || option.baseValue}</span>
                                                        </div>
                                                    )}
                                                    components={{ DropdownIndicator: null, IndicatorSeparator: null, ClearIndicator: null }}
                                                />
                                            </div>
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
                                }}
                                >Cancel</button>
                                <button type="submit" className="btn-save">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showDeleteModal && (
                <AlertCard
                    title="Delete?"
                    message="Confirm delete department. This Task Not Be Undone"
                    onCancel={() => setShowDeleteModal(false)}
                    onContinue={() => handleDelete(targetId)} // Pass targetId directly
                />
            )}
            <ToastDisplay toast={toast} setToast={setToast} />
        </div>
    );
}