'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Loading from './loading.js';
import ToastDisplay from './alert.js';

const Select = dynamic(() => import('react-select'), { ssr: false });

const AttendanceCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [leaveData, setLeaveData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedDateData, setSelectedDateData] = useState(null);
    const [actionType, setActionType] = useState('leave');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    // Fetch employees
    const fetchEmployees = async () => {
        try {
            const res = await axios.get('http://localhost/react-backend/api/Employees/get.php');
            if (res.data) {
                const empOptions = res.data.map(emp => ({
                    value: emp.id,
                    label: `${emp.first_name} ${emp.last_name}`,
                    ...emp
                }));
                setEmployees(empOptions);
            }
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to load employees.' });
        }
    };

    // Fetch leave/absent data
    const fetchLeaveData = async () => {
        try {
            setIsLoading(true);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            let url = `http://localhost/react-backend/api/leave/l.php?year=${year}&month=${month}`;
            if (selectedEmployee) {
                url += `&emp_id=${selectedEmployee.value}`;
            }
            const res = await axios.get(url);
            if (res.data && res.data.success) {
                setLeaveData(res.data.data || []);
            } else {
                setLeaveData([]);
            }
        } catch (error) {
            setLeaveData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchLeaveData();
    }, [currentDate, selectedEmployee]);

    // Calendar helpers
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const isSunday = (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return date.getDay() === 0;
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
    };

    const getDateString = (day) => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${month}-${dayStr}`;
    };

    const getLeaveForDate = (day) => {
        const dateStr = getDateString(day);
        return leaveData.filter(item => item.date === dateStr);
    };

    // Navigation
    const goToPrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // View Details
    const handleViewDetails = (day) => {
        const leaves = getLeaveForDate(day);
        setSelectedDateData({
            date: getDateString(day),
            day: day,
            leaves: leaves
        });
        setShowDetailsModal(true);
    };

    // Action (Add Leave/Absent)
    const handleAction = (day) => {
        setSelectedDateData({
            date: getDateString(day),
            day: day
        });
        setActionType('leave');
        setEditMode(false);
        setEditId(null);
        setShowActionModal(true);
    };

    // Edit
    const handleEdit = (item) => {
        setSelectedDateData({
            date: item.date,
            emp_id: item.emp_id
        });
        setActionType(item.type);
        setEditMode(true);
        setEditId(item.id);
        setShowDetailsModal(false);
        setShowActionModal(true);
    };

    // Delete
    const handleDelete = async (id) => {
        // if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            setIsLoading(true);
            await axios.delete(`http://localhost/react-backend/api/leave/l.php?id=${id}`);
            setToast({ show: true, type: 'success', message: 'Record deleted successfully.' });
            fetchLeaveData();
            setShowDetailsModal(false);
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to delete record.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Save (Create/Update)
    const handleSave = async () => {
        if (!selectedEmployee && !editMode) {
            setToast({ show: true, type: 'error', message: 'Please select an employee.' });
            return;
        }

        try {
            setIsLoading(true);
            const payload = {
                emp_id: editMode ? selectedDateData.emp_id : selectedEmployee.value,
                date: selectedDateData.date,
                type: actionType
            };

            if (editMode) {
                payload.id = editId;
                await axios.put('http://localhost/react-backend/api/leave/l.php', payload);
                setToast({ show: true, type: 'success', message: 'Record updated successfully.' });
            } else {
                await axios.post('http://localhost/react-backend/api/leave/l.php', payload);
                setToast({ show: true, type: 'success', message: 'Record added successfully.' });
            }
            fetchLeaveData();
            setShowActionModal(false);
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to save record.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Render calendar
    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const weeks = [];
        let days = [];

        // Empty cells for days before the first day
        for (let i = 0; i < firstDay; i++) {
            days.push(<td key={`empty-${i}`} className="cal-day empty-day"></td>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const sunday = isSunday(day);
            const today = isToday(day);
            const leaves = getLeaveForDate(day);
            const hasLeave = leaves.some(l => l.type === 'leave');
            const hasAbsent = leaves.some(l => l.type === 'absent');

            days.push(
                <td key={day} className={`cal-day ${sunday ? 'sunday' : ''} ${today ? 'today' : ''}`}>
                    <div className="day-content">
                        <span className="day-number">{day}</span>
                        
                        <div className="day-indicators">
                            {hasLeave && <span className="indicator leave-indicator">L</span>}
                            {hasAbsent && <span className="indicator absent-indicator">A</span>}
                            {leaves.length > 1 && <span className="indicator count-indicator">+{leaves.length}</span>}
                        </div>

                        {!sunday && (
                            <div className="day-actions">
                                <button 
                                    className="btn-view" 
                                    onClick={() => handleViewDetails(day)}
                                    title="View Details"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                                <button 
                                    className="btn-action" 
                                    onClick={() => handleAction(day)}
                                    title="Add Leave/Absent"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M5 12h14"/>
                                    </svg>
                                </button>
                            </div>
                        )}

                        {sunday && <span className="sunday-label">Holiday</span>}
                    </div>
                </td>
            );

            if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
                // Fill remaining cells if last week
                if (day === daysInMonth) {
                    const remaining = 7 - days.length;
                    for (let i = 0; i < remaining; i++) {
                        days.push(<td key={`end-empty-${i}`} className="cal-day empty-day"></td>);
                    }
                }
                weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
                days = [];
            }
        }

        return weeks;
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="attendance-calendar-wrapper">
            {isLoading && <Loading />}
            <ToastDisplay toast={toast} setToast={setToast} />

            {/* Header */}
            <div className="cal-header">
                <div className="cal-title-section">
                    <h2 className="cal-title">Attendance Calendar</h2>
                    <p className="cal-subtitle">Manage employee leaves and absences</p>
                </div>
                <div className="cal-employee-select">
                    <label>Filter by Employee:</label>
                    <Select
                        instanceId="emp-select"
                        classNamePrefix="cal-select"
                        options={[{ value: null, label: 'All Employees' }, ...employees]}
                        value={selectedEmployee}
                        onChange={(val) => setSelectedEmployee(val?.value ? val : null)}
                        placeholder="Select Employee..."
                        isClearable
                    />
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="cal-nav">
                <button className="cal-nav-btn" onClick={goToPrevMonth}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>
                <div className="cal-current-month">
                    <span className="month-name">{monthNames[currentDate.getMonth()]}</span>
                    <span className="year">{currentDate.getFullYear()}</span>
                </div>
                <button className="cal-nav-btn" onClick={goToNextMonth}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
                <button className="cal-today-btn" onClick={goToToday}>Today</button>
            </div>

            {/* Legend */}
            <div className="cal-legend">
                <span className="legend-item"><span className="legend-dot leave"></span> Leave</span>
                <span className="legend-item"><span className="legend-dot absent"></span> Absent</span>
                <span className="legend-item"><span className="legend-dot sunday"></span> Sunday/Holiday</span>
            </div>

            {/* Calendar Table */}
            <div className="cal-table-container">
                <table className="cal-table">
                    <thead>
                        <tr>
                            {dayNames.map((day, idx) => (
                                <th key={day} className={idx === 0 ? 'sunday-header' : ''}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {renderCalendar()}
                    </tbody>
                </table>
            </div>

            {/* View Details Modal */}
            {showDetailsModal && selectedDateData && (
                <div className="cal-modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cal-modal-header">
                            <h3>Details for {selectedDateData.date}</h3>
                            <button className="cal-modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
                        </div>
                        <div className="cal-modal-body">
                            {selectedDateData.leaves && selectedDateData.leaves.length > 0 ? (
                                <table className="cal-details-table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Type</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedDateData.leaves.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.emp_name || `Employee #${item.emp_id}`}</td>
                                                <td>
                                                    <span className={`type-badge ${item.type}`}>
                                                        {item.type === 'leave' ? 'Leave' : 'Absent'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn-edit-sm" onClick={() => handleEdit(item)}>Edit</button>
                                                    <button className="btn-delete-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="no-data">No leaves or absences recorded for this date.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Modal */}
            {showActionModal && selectedDateData && (
                <div className="cal-modal-overlay" onClick={() => setShowActionModal(false)}>
                    <div className="cal-modal action-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cal-modal-header">
                            <h3>{editMode ? 'Edit Record' : 'Add Leave/Absent'}</h3>
                            <button className="cal-modal-close" onClick={() => setShowActionModal(false)}>×</button>
                        </div>
                        <div className="cal-modal-body">
                            <div className="form-group">
                                <label>Date</label>
                                <input type="text" value={selectedDateData.date} disabled className="form-input" />
                            </div>
                            
                            {!editMode && (
                                <div className="form-group">
                                    <label>Employee</label>
                                    <Select
                                        instanceId="action-emp-select"
                                        classNamePrefix="cal-select"
                                        options={employees}
                                        value={selectedEmployee}
                                        onChange={setSelectedEmployee}
                                        placeholder="Select Employee..."
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Type</label>
                                <div className="type-options">
                                    <label className={`type-option ${actionType === 'leave' ? 'active' : ''}`}>
                                        <input 
                                            type="radio" 
                                            name="actionType" 
                                            value="leave"
                                            checked={actionType === 'leave'}
                                            onChange={(e) => setActionType(e.target.value)}
                                        />
                                        <span className="type-label leave">Leave</span>
                                    </label>
                                    <label className={`type-option ${actionType === 'absent' ? 'active' : ''}`}>
                                        <input 
                                            type="radio" 
                                            name="actionType" 
                                            value="absent"
                                            checked={actionType === 'absent'}
                                            onChange={(e) => setActionType(e.target.value)}
                                        />
                                        <span className="type-label absent">Absent</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="cal-modal-footer">
                            <button className="btn-cancel" onClick={() => setShowActionModal(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSave}>
                                {editMode ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceCalendar;
