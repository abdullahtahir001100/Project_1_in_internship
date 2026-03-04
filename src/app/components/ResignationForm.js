'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ToastDisplay from './alert.js';
import Loading from './loading.js';

export default function ResignationForm({ empId, onBack }) {
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [selectedReason, setSelectedReason] = useState('');
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
        async function fetchData() {
            try {
                setLoading(true);
                const empRes = await axios.get(`http://localhost/react-backend/api/Employees/get_data?id=${empId}`);
                const emp = empRes.data;
                setEmployee(emp);
            } catch (error) {
                setToast({ show: true, type: 'error', message: 'Failed to load employee data.' });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [empId]);

    async function handleSave() {
        if (!selectedReason) {
            setToast({ show: true, type: 'error', message: 'Please select a reason for resignation.' });
            return;
        }

        if (selectedReason === 'Other' && !otherReason.trim()) {
            setToast({ show: true, type: 'error', message: 'Please provide details for your resignation reason.' });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                employee_id: empId,
                reason: selectedReason === 'Other' ? otherReason : selectedReason,
                reason_type: selectedReason,
                resignation_date: new Date().toISOString().split('T')[0]
            };

            const res = await axios.post('http://localhost/react-backend/api/reasons/save, payload);
            setToast({ show: true, type: 'success', message: res.data.message || 'Resignation submitted successfully!' });
            
            setTimeout(() => {
                onBack();
            }, 1500);
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to submit resignation.' });
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <Loading />;

    return (
        <div className="section-container">
            {/* Header with Back Button */}
            <div className="section-header">
                <div className="header-info">
                    <h2 className="section-title">Employee Resignation</h2>
                    <p className="section-subtitle">Submit resignation details</p>
                </div>
                <button className="btn-back" onClick={onBack}>← Back to Employees</button>
            </div>

            {/* Employee Details - Display Only */}
            {employee && (
                <div className="mark-emp-details">
                    <h4 className="mark-emp-heading">Employee Information</h4>
                    <div className="mark-emp-grid">
                        <div className="mark-emp-item">
                            <span className="mark-emp-label">Full Name</span>
                            <span className="mark-emp-value">{employee.first_name} {employee.last_name}</span>
                        </div>
                        <div className="mark-emp-item">
                            <span className="mark-emp-label">Email</span>
                            <span className="mark-emp-value">{employee.email}</span>
                        </div>
                        <div className="mark-emp-item">
                            <span className="mark-emp-label">Phone</span>
                            <span className="mark-emp-value">{employee.phone}</span>
                        </div>
                        <div className="mark-emp-item">
                            <span className="mark-emp-label">Department</span>
                            <span className="mark-emp-value">{employee.department_name}</span>
                        </div>
                        <div className="mark-emp-item">
                            <span className="mark-emp-label">Designation</span>
                            <span className="mark-emp-value">{employee.Post_name}</span>
                        </div>
                        <div className="mark-emp-item">
                            <span className="mark-emp-label">Address</span>
                            <span className="mark-emp-value">{employee.address}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Resignation Reason Form */}
            <div className="resignation-form-area">
                <h4 className="mark-emp-heading">Reason for Resignation</h4>
                <p className="resignation-subtitle">Please select the reason for your resignation</p>
                
                <div className="resignation-options">
                    {reasonOptions.map((option) => (
                        <label key={option.id} className="resignation-radio-item">
                            <input
                                type="radio"
                                name="resignationReason"
                                value={option.label}
                                checked={selectedReason === option.label}
                                onChange={(e) => setSelectedReason(e.target.value)}
                            />
                            <span className="radio-label">{option.label}</span>
                        </label>
                    ))}
                </div>

                {/* Other reason text box */}
                {selectedReason === 'Other' && (
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

            {/* Footer with Save */}
            <div className="emp-modal-footer">
                <button type="button" className="btn-cancel" onClick={onBack}>Cancel</button>
                <button type="button" className="btn-save resignation-btn" onClick={handleSave}>Submit Resignation</button>
            </div>
            <ToastDisplay toast={toast} setToast={setToast} />
        </div>
    );
}
