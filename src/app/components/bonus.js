'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ToastDisplay from './alert.js';
import AlertCard from './AlertCard.js';


export default function Bonus() {
    // Sirf ye state chahiye modal open/close ke liye
    const [isOpen, setIsOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [data, setdata] = useState([]);
    const [editId, setEditId] = useState(null);
    const [payload, setPayload] = useState({
        bonusName: '',
        baseValue: '',
        editId: null
    });




    async function handlePost() {

        try {
            const url = editId ? "update" : "create";
            const res = await axios.post(`/api/api/bonus/${url}`, payload);
            get_table_data();
            setIsOpen(false);
            res?.data?.message ? setToast({ show: true, type: 'success', message: res.data.message }) : setToast({ show: true, type: 'error', message: editId ? 'Failed to update Bonus!' : 'Bonus created!' });

        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to save bonus.' });
        }
    }
    const handleEdit = (item) => {
        setEditId(item.id);
        setIsOpen(true);
        get_edit_data(item.id);

    };
    async function get_edit_data(id) {
        try {
            const res = await axios.get(`/api/api/bonus/get?id=${id}`);
            const bonusData = res.data[0];

            setPayload({
                bonusName: bonusData?.bonusName || '',
                baseValue: bonusData?.baseValue || '',
                editId: id
            });
        } catch (err) { setToast({ show: true, type: 'error', message: 'Failed to load bonus data.' }); }
    }
    async function handleDelete(id) {
        try {
            const res = await axios.post(`/api/api/bonus/delete`, { id });
            setToast({ show: true, type: 'success', message: res?.data?.message || 'Bonus deleted!' });
            setIsDeleteOpen(false);
            get_table_data();
        }
        catch (err) {
            setToast({ show: true, type: 'error', message: 'Failed to delete bonus.' });
        }
    }
    async function get_table_data() {
        try {
            const res = await axios.get(`/api/api/bonus/get`);
            setdata(res.data);

        }
        catch (err) { setToast({ show: true, type: 'error', message: 'Failed to load bonus data.' }); }
    }

    useEffect(() => {
        get_table_data();
    }
        , []);


    return (
        <div className="section-container">
            <div className="section-header">
                <div className="header-info">
                    <h2 className="section-title">Bonuses</h2>
                </div>

                {/* Button jo modal kholega */}
                <button className="btn-add" onClick={() => {
                    setIsOpen(true);
                    setPayload({ bonusName: '', baseValue: '' });
                }}>
                    Add New Bonus
                </button>

                {/* Add/Edit Modal: Sirf tab dikhega jab isOpen true ho */}
                {isOpen && (
                    <div className="modal-overlay" style={{ display: 'flex' }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>{editId ? "Edit Bonus" : "Create Bonus"}</h3>

                                <span className="close-icon" onClick={() => setIsOpen(false)}>×</span>
                            </div>
                            <form className="modal-form">
                                <div className="form-group">
                                    <label>Allounces Name</label>
                                    <input type="text" required placeholder='eg: YearlyBonus' value={payload?.bonusName || ''} onChange={(e) => setPayload({ ...payload, bonusName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Base Value</label>
                                    <input type="number" required placeholder='eg : 50,000' value={payload?.baseValue || ''} onChange={(e) => setPayload({ ...payload, baseValue: e.target.value })} />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={() => setIsOpen(false)}>Cancel</button>
                                    <button type="button" className="btn-save" onClick={handlePost}>{editId ? "Update" : "Save"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Table with Mock Data */}
            <div className="table-responsive">
                <table className="simple-table">
                    <thead>
                        <tr><th>ID</th><th>Allowances Name</th><th>Base Value</th><th className="text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id}>
                                <td>#BON-{item.id}</td>
                                <td>{item.bonusName}</td>
                                <td>{item.baseValue}</td>

                                <td className="text-right">
                                    <div className="custom-dropdown">
                                        <button className="drop-btn">Actions</button>
                                        <div className="drop-content">
                                            <button onClick={() => handleEdit(item)}>
                                                Edit Detail
                                            </button>
                                            <button onClick={() => {
                                                setDeleteId(item.id);
                                                setIsDeleteOpen(true);
                                            }}>
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
            {isDeleteOpen && (
                <AlertCard
                    title="Delete?"
                    message="Confirm delete bonus. This action cannot be undone."
                    onCancel={() => setIsDeleteOpen(false)}
                    onContinue={() => handleDelete(deleteId)}
                />
            )}

            <ToastDisplay toast={toast} setToast={setToast} />
        </div >
    );
}