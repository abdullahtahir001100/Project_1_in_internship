'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ToastDisplay from './alert.js';

export default function MarkQuestions({ empId, onBack }) {
    const [employee, setEmployee] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [ratings, setRatings] = useState({});
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [existingRatings, setExistingRatings] = useState({});

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const empRes = await axios.get(`http://localhost/react-backend/api/Employees/get_data.php?id=${empId}`);
                const emp = empRes.data;
                setEmployee(emp);

                const qRes = await axios.get(`http://localhost/react-backend/api/questions/get.php?department_id=${emp.department_id}`);
                const qData = qRes.data;

                await get_existing_rating();
                setQuestions(qData[0]?.posts.filter((res) => res.post_id === emp.post_id)[0]?.questions || []);
            } catch (error) {
                setToast({ show: true, type: 'error', message: 'Failed to load data.' });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [empId]);

    function handleRating(childId, value) {
        setRatings(prev => ({ ...prev, [childId]: value }));
    }

    async function handleSave() {
        try {
            setLoading(true);
            const payload = {
                employee_id: empId,
                ratings: ratings
            };
            const res = await axios.post('http://localhost/react-backend/api/questions/save_rating.php', payload);
            setToast({ show: true, type: 'success', message: res.data.message || 'Saved successfully!' });
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to save ratings.' });
        } finally {
            setLoading(false);
        }
    }

    async function get_existing_rating() {
        try {
            const res = await axios.get(
                `http://localhost/react-backend/api/questions/get_rating.php?employee_id=${empId}`
            );

            const dbRatings = res.data;

            const formatted = {};

            dbRatings.forEach(item => {
                if (item.question_id !== null) {
                    // Parent question
                    formatted[`q_${item.question_id}`] = item.rating;
                }

                if (item.sub_question_id !== null) {
                    // Child question
                    formatted[item.sub_question_id] = item.rating;
                }
            });

            setRatings(formatted);        // 🔥 set once
            setExistingRatings(dbRatings);

        } catch (error) {
            setToast({
                show: true,
                type: 'error',
                message: 'Failed to load existing ratings.'
            });
        }
    }



    if (loading) return <div className="section-container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="section-container">
            {/* Header with Back Button */}
            <div className="section-header">
                <div className="header-info">
                    <h2 className="section-title">Mark Questions</h2>
                    <p className="section-subtitle">Rate employee performance</p>
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
                            <span className="mark-emp-value">{employee.post_name}</span>
                        </div>
                        <div className="mark-emp-item">
                            <span className="mark-emp-label">Address</span>
                            <span className="mark-emp-value">{employee.address}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Questions Table */}
            <div className="mark-questions-area">
                <h4 className="mark-emp-heading">Questions & Rating</h4>
                {questions.length === 0 ? (
                    <p style={{ padding: '1rem', color: '#666', fontSize: '0.85rem' }}>No questions available for this designation.</p>
                ) : (
                    <table className="simple-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Question</th>
                                <th>Total Rating</th>
                                <th>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.map((q, qi) => (
                                <React.Fragment key={q.question_id}>
                                    {/* Parent Question Row */}
                                    <tr className="mark-parent-row">
                                        <td>{qi + 1}</td>
                                        <td>{q.question_name}</td>
                                        <td>{q.question_rating}</td>
                                        <td>
                                            {(!q.child_questions || q.child_questions.length === 0) && (
                                                <input
                                                    type="number"
                                                    className="qf-input qf-rating"
                                                    min="0"
                                                    max={q.question_rating}
                                                    placeholder="0"
                                                    value={ratings[`q_${q.question_id}`] || ''}
                                                    onChange={(e) => handleRating(`q_${q.question_id}`, e.target.value)}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                    {/* Child Question Rows */}
                                    {q.child_questions?.map((child, ci) => (
                                        <tr key={child.child_id} className="mark-child-row">
                                            <td className="mark-child-num">{qi + 1}.{ci + 1}</td>
                                            <td className="mark-child-text">{child.child_question_name}</td>
                                            <td className="mark-child-text">{child.child_rating}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="qf-input qf-rating"
                                                    min="0"
                                                    max={child.child_rating}
                                                    placeholder="0"
                                                    value={ratings[child.child_id] || ''}
                                                    onChange={(e) => handleRating(child.child_id, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer with Save */}
            <div className="emp-modal-footer">
                <button type="button" className="btn-cancel" onClick={onBack}>Cancel</button>
                <button type="button" className="btn-save" onClick={() => { handleSave(); onBack(); }}>Save Ratings</button>
            </div>
            <ToastDisplay toast={toast} setToast={setToast} />
        </div>
    );
}
