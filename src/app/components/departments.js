'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../context/ApiProvider';
import { Listbox } from "@headlessui/react";
import AlertCard from './AlertCard.js';
import ToastDisplay from './alert.js';
import { TableSkeleton, LoadingButton, ModalSkeleton } from './Skeleton';

export default function Departments() {
    const { axios } = useApi();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deptName, setDeptName] = useState('');
    const [toast, setToast] = useState({
        show: false,
        type: "",
        message: ""
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [targetId, setTargetId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const options = [
        {
            id: 1,
            name: "Active"
        },
        {
            id: 0,
            name: "Inactive"
        }
    ];
    const [selectedStatus, setSelectedStatus] = useState(options[0]);

    const modalCheck = useRef(null);
    const formRef = useRef(null);


    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/Posts/get_department');
            setData(res.data);
        }
        catch (err) {
            setToast({ show: true, type: 'error', message: 'Failed to load departments.' });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const openModal = async (id = null) => {
        setEditId(id);
        setShowModal(true);
        if (id) {
            setEditLoading(true);
            try {
                const res = await axios.get(`/departments/get?id=${id}`);
                const department = res?.data?.[0] || {};
                setDeptName(department.department_name || ''); // Ensure deptName is always a string
                const statusValue = Number(department.status ?? 1);
                setSelectedStatus(statusValue === 1 ? options[0] : options[1]);
            } catch (error) {
                setToast({
                    show: true,
                    type: "error",
                    message: "Failed to load department data."
                });
                setShowModal(false);
            } finally {
                setEditLoading(false);
            }
        } else {
            setDeptName(''); // Reset to default values for new department
            setSelectedStatus(options[0]);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(formRef.current);
        fd.append('status', selectedStatus.id);
        if (editId) fd.append('id', editId);

        const url = editId ? "update" : "create";
        try {
            const res = await axios.post(`/departments/${url}`, fd);

            modalCheck.current.checked = false;
            setShowModal(false);
            fetchAll();
            setToast({
                show: true,
                type: "success",
                message: res.data.message
            });
        }
        catch (err) {
            setToast({
                show: true,
                type: "error",
                message: "Error saving data"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete('/departments/delete', { data: { id: targetId } });
            setShowDeleteModal(false);
            fetchAll();
        } finally {
            setDeleting(false);
        }
    };

    return (
        
        <div className="section-container">
            <div className="section-header">
                <div className="header-info">
                    <h2 className="section-title">Departments</h2>
                </div>

                {/* --- Add/Edit Modal Logic --- */}
                <div className="modal-wrapper">
                    <input type="checkbox" id="modal-toggle" ref={modalCheck} hidden checked={showModal} onChange={() => {}} />
                    <button className="btn-add" onClick={() => openModal()}>Add New Department</button>

                    {showModal && (
                        <div className="modal-overlay" style={{ display: 'flex' }}>
                            <div className="modal-content">
                                {editLoading ? (
                                    <>
                                        <div className="modal-header">
                                            <div className="skeleton-box" style={{ width: '150px', height: '20px' }}></div>
                                            <span className="close-icon" onClick={() => setShowModal(false)}>×</span>
                                        </div>
                                        <div className="modal-form" style={{ padding: '20px' }}>
                                            <div className="skeleton-form-field" style={{ marginBottom: '16px' }}>
                                                <div className="skeleton-box" style={{ width: '100px', height: '14px', marginBottom: '8px' }}></div>
                                                <div className="skeleton-box" style={{ width: '100%', height: '38px' }}></div>
                                            </div>
                                            <div className="skeleton-form-field" style={{ marginBottom: '16px' }}>
                                                <div className="skeleton-box" style={{ width: '60px', height: '14px', marginBottom: '8px' }}></div>
                                                <div className="skeleton-box" style={{ width: '100%', height: '38px' }}></div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                <div className="skeleton-box" style={{ width: '80px', height: '38px' }}></div>
                                                <div className="skeleton-box" style={{ width: '80px', height: '38px' }}></div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="modal-header">
                                            <h3>{editId ? "Edit" : "Create"} Department</h3>
                                            <span className="close-icon" onClick={() => setShowModal(false)}>×</span>
                                        </div>
                                        <form className="modal-form" ref={formRef} onSubmit={handleSave}>
                                            <div className="form-group">
                                                <label>Department Name</label>
                                                <input name='Department_name' value={deptName} onChange={(e) => setDeptName(e.target.value)} type="text" required />
                                            </div>
                                            <div className="form-group">
                                                <label>Status</label>
                                                <Listbox value={selectedStatus} onChange={setSelectedStatus}>
                                                    <div className="custom-select-container">
                                                        <Listbox.Button className="select-trigger">{selectedStatus.name}</Listbox.Button>
                                                        <Listbox.Options className="select-options">
                                                            {options.map(opt => <Listbox.Option key={opt.id} value={opt} className="option-item">{opt.name}</Listbox.Option>)}
                                                        </Listbox.Options>
                                                    </div>
                                                </Listbox>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                                <LoadingButton type="submit" className="btn-save" loading={saving} loadingText="Saving...">
                                                    Save
                                                </LoadingButton>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Table --- */}
            {loading ? (
                <TableSkeleton rows={5} columns={4} showHeader={false} />
            ) : (
                <div className="table-responsive">
                    <table className="simple-table">
                        <thead>
                            <tr><th>ID</th><th>Name</th><th>Status</th><th className="text-right">Actions</th></tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.id}>
                                    <td>#DEP-{item.id}</td>
                                    <td>{item.department_name}</td>
                                    <td><span className="status-pill">{item.status == 1 ? "Active" : "Inactive"}</span></td>
                                    <td className="text-right">
                                        <div className="custom-dropdown">
                                            <button className="drop-btn">Actions</button>
                                            <div className="drop-content">
                                                <button onClick={() => openModal(item.id)}>
                                                    Edit Detail
                                                </button>
                                                <button onClick={() => { setTargetId(item.id); setShowDeleteModal(true); }}>
                                                    Delete Detail
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showDeleteModal && (
                <AlertCard title="Delete?" message="Confirm delete department. This Task Not Be Undone" onCancel={() => setShowDeleteModal(false)} onContinue={handleDelete} loading={deleting} />
            )}
            <ToastDisplay toast={toast} setToast={setToast} />
            
        </div>
    );
}