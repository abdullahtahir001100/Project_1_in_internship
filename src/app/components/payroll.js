'use client';

import React, { useState, useEffect, useId, useMemo } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import DatePicker from "react-datepicker";
import Loading from './loading.js';
import ToastDisplay from './alert.js';
import "react-datepicker/dist/react-datepicker.css";

const Select = dynamic(() => import('react-select'), { ssr: false });

const PayrollProcessor = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [data, setData] = useState([]);
    const [masterData, setMasterData] = useState([]);
    const [deptOptions, setDeptOptions] = useState([{ value: 'all', label: 'All Department' }]);
    const [empOptions, setEmpOptions] = useState([{ value: 'all', label: 'All Employees' }]);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [selectedDept, setSelectedDept] = useState({ value: 'all', label: 'All Department' });
    const [selectedEmp, setSelectedEmp] = useState({ value: 'all', label: 'All Employees' });
    const [formattedDate, setFormattedDate] = useState('');
    const [renderdate, setRenderDate] = useState('');
    const [render, setRender] = useState(false);
    const [geton, setgeton] = useState([]);
    const [printDate, setPrintDate] = useState(null);

    const [payload, setPayload] = useState({
        emp_id: '',
        duration: '',
        department: selectedDept.value || '',
    });

    const id = useId();

    async function fetchPayrollData(dateParam = null) {
        try {
            setIsLoading(true);
            const dateToUse = dateParam || formattedDate;
            const res = await axios.get(`http://localhost/react-backend/api/bonusmain/all.php?duration=${dateToUse}`);

            if (res.data.success) {
                const fetchedData = res.data.data;
                setMasterData(fetchedData);
                setData(fetchedData);

                const emps = fetchedData.map(emp => ({
                    value: emp.id,
                    label: `${emp.first_name} ${emp.last_name}`,
                    dept_id: emp.dept_id
                }));
                setEmpOptions([{ value: 'all', label: 'All Employees' }, ...emps]);
            }

            const deptReq = await axios.get(`http://localhost/react-backend/api/Posts/get_department.php`);
            const deptData = deptReq.data || [];
            const formattedDepts = deptData.map(dept => ({
                value: dept.id,
                label: dept.department_name
            }));
            setDeptOptions([{ value: 'all', label: 'All Department' }, ...formattedDepts]);

        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to load data from API.' });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchPayrollData();
    }, [renderdate]);

    useEffect(() => {
        let filtered = masterData;

        if (selectedDept?.value !== 'all') {
            filtered = masterData.filter(emp =>
                String(emp.department_id) === String(selectedDept.value)
            );

            const specificEmps = filtered.map(emp => ({
                value: emp.id,
                label: `${emp.first_name} ${emp.last_name}`
            }));
            setRenderDate(formattedDate);
            setEmpOptions([{ value: 'all', label: 'All Employees' }, ...specificEmps]);
        } else {
            const allEmps = masterData.map(emp => ({
                value: emp.id,
                label: `${emp.first_name} ${emp.last_name}`
            }));
            setEmpOptions([{ value: 'all', label: 'All Employees' }, ...allEmps]);
        }

        if (selectedEmp?.value !== 'all') {
            filtered = filtered.filter(emp =>
                String(emp.id) === String(selectedEmp.value)
            );
        }

        setData(filtered);

        if (selectedDate instanceof Date && !isNaN(selectedDate)) {
            setFormattedDate(
                selectedDate.getFullYear() + "-" +
                String(selectedDate.getMonth() + 1).padStart(2, '0')
            );
        }

        setPayload({
            emp_id: selectedEmp?.value || 'all',
            duration: formattedDate,
            department: selectedDept?.value || 'all',
        });

    }, [selectedDept, selectedEmp, masterData, selectedDate]);

    async function handleProcessPayroll() {
        try {
            setIsLoading(true);
            const res = await axios.post(`http://localhost/react-backend/api/payrool/create.php`, payload);
            setToast({ show: true, type: 'success', message: res.data.message || 'Payroll processed successfully!' });
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to process payroll.' });
        }
        finally {
            setIsLoading(false);
            get();
        }
    }

    async function get() {
        try {
            const res = await axios.get(`http://localhost/react-backend/api/payrool/get.php`);
            setgeton(res.data);
            console.log(res.data);
            setToast({ show: true, type: 'success', message: res.data.message || 'Data fetched successfully!' });
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to fetch data.' });
        }
    }

    useEffect(() => {
        get();
    }, []);

    // Handle Edit - Updated to filter only processed employees
    const handleEdit = async (dateStr) => {
        if (dateStr) {
            const [year, month] = dateStr.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            setSelectedDate(date);
            setFormattedDate(dateStr);
            setRenderDate(dateStr);
            setRender(true);

            setIsLoading(true);
            try {
                // Find IDs that were actually processed for this date in geton
                const payrollRecord = geton.find(item => item.date === dateStr);
                const processedIds = payrollRecord ? payrollRecord.employees.map(e => String(e.employee_id)) : [];

                const res = await axios.get(`http://localhost/react-backend/api/bonusmain/all.php?duration=${dateStr}`);

                if (res.data.success) {
                    const fetchedData = res.data.data;
                    // Filter: only keep employees whose ID exists in the processed list
                    const filteredData = fetchedData.filter(emp => processedIds.includes(String(emp.id)));

                    setMasterData(filteredData);
                    setData(filteredData);

                    const emps = filteredData.map(emp => ({
                        value: emp.id,
                        label: `${emp.first_name} ${emp.last_name}`,
                        dept_id: emp.dept_id
                    }));
                    setEmpOptions([{ value: 'all', label: 'All Employees' }, ...emps]);
                }
            } catch (error) {
                setToast({ show: true, type: 'error', message: 'Failed to filter edit data.' });
            } finally {
                setIsLoading(false);
            }
        } else {
            setRender(true);
        }
    };


    // Print function - Updated to filter only processed employees
    const handlePrint = async (dateStr) => {
        setPrintDate(dateStr);
        setIsLoading(true);

        try {
            // Find IDs that were actually processed for this date in geton
            const payrollRecord = geton.find(item => item.date === dateStr);
            const processedIds = payrollRecord ? payrollRecord.employees.map(e => String(e.employee_id)) : [];

            const res = await axios.get(`http://localhost/react-backend/api/bonusmain/all.php?duration=${dateStr}`);

            if (!res.data.success || !res.data.data || res.data.data.length === 0) {
                setToast({ show: true, type: 'error', message: 'No payroll data found for this date.' });
                setIsLoading(false);
                return;
            }

            // Filter: only keep employees whose ID exists in the processed list
            const dataToPrint = res.data.data.filter(emp => processedIds.includes(String(emp.id)));

            if (dataToPrint.length === 0) {
                setToast({ show: true, type: 'error', message: 'No processed employees found for this period.' });
                setIsLoading(false);
                return;
            }

            const printWindow = window.open('', '_blank');
            let totalNetPay = 0;
            let tableRows = '';

            dataToPrint.forEach((item, index) => {
                const baseSalary = parseFloat(item.Salery) || 0;
                const fixedAllowances = item.bonuses?.reduce((sum, b) => sum + parseFloat(b.value || 0), 0) || 0;
                const fixedDeductions = item.deductions?.reduce((sum, d) => sum + parseFloat(d.value || 0), 0) || 0;
                const currentBonus = parseFloat(item.bonus_main?.[0]?.bonus || 0);
                const currentFine = parseFloat(item.bonus_main?.[0]?.fine || 0);
                const netAdjustment = currentBonus - currentFine + fixedAllowances - fixedDeductions;
                const finalNetPay = baseSalary + netAdjustment;
                totalNetPay += finalNetPay;

                tableRows += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.first_name} ${item.last_name}</td>
                        <td>${item.phone}<br/>${item.email}</td>
                        <td>${item.department_name}</td>
                        <td>${item.Post_name}</td>
                        <td>$${fixedAllowances.toLocaleString()}</td>
                        <td>$${fixedDeductions.toLocaleString()}</td>
                        <td>$${currentBonus.toLocaleString()}</td>
                        <td>$${currentFine.toLocaleString()}</td>
                        <td>$${baseSalary.toLocaleString()}</td>
                        <td style="color: ${netAdjustment >= 0 ? 'green' : 'red'}">${netAdjustment >= 0 ? '+' : ''}${netAdjustment.toLocaleString()}</td>
                        <td><strong>$${finalNetPay.toLocaleString()}</strong></td>
                    </tr>
                `;
            });

            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Payroll Report - ${dateStr}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { text-align: center; color: #333; }
                        .header-info { text-align: center; margin-bottom: 20px; color: #666; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #4a5568; color: white; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .total-row { background-color: #e2e8f0; font-weight: bold; }
                        .print-date { text-align: right; font-size: 12px; color: #666; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Payroll Report</h1>
                    <div class="header-info">
                        <p><strong>Period:</strong> ${dateStr}</p>
                        <p><strong>Total Employees:</strong> ${dataToPrint.length}</p>
                    </div>
                    <p class="print-date">Printed on: ${new Date().toLocaleDateString()}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Department</th>
                                <th>Designation</th>
                                <th>Allowances</th>
                                <th>Deductions</th>
                                <th>Bonus</th>
                                <th>Fine</th>
                                <th>Base Salary</th>
                                <th>Net Adj</th>
                                <th>Net Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                            <tr class="total-row">
                                <td colspan="11" style="text-align: right;">Total Net Payroll:</td>
                                <td><strong>$${totalNetPay.toLocaleString()}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 250);
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to fetch payroll data for printing.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrintCurrent = () => {
        if (formattedDate) {
            handlePrint(formattedDate);
        } else {
            setToast({ show: true, type: 'error', message: 'Please select a date first.' });
        }
    };
    async function handleDelete(dateStr) {
        console.log("Deleting payroll record for date:", dateStr);
        try {
            setIsLoading(true);
            await axios.delete(`http://localhost/react-backend/api/payrool/delete.php?date=${dateStr}`);
            setToast({ show: true, type: 'success', message: 'Payroll record deleted successfully!' });
            get();
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to delete payroll record.' });
        } finally {
            setIsLoading(false);
        }
    }

    // console.log(data);

    return (
        <>
            {render == true && <>
                <div className="pr-compact-wrapper">
                    {isLoading && <Loading />}
                    <ToastDisplay toast={toast} setToast={setToast} />

                    <div className="pr-header-area">
                        <button className="pr-make-btn" onClick={handleProcessPayroll}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                            Process Payroll
                        </button>
                        <button className="pr-make-btn" onClick={handlePrintCurrent} style={{ backgroundColor: '#3182ce' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                                <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            Print
                        </button>
                        <button className="btn-back" onClick={() => { setRender(false) }}>← Back</button>
                    </div>

                    <div className="pr-card-filter">
                        <div className="pr-flex-grid">
                            <div className="pr-grp id-field">
                                <label>Process ID</label>
                                <input type="text" value={id} disabled />
                            </div>

                            <div className="pr-grp dept-field">
                                <label>Department</label>
                                <Select
                                    instanceId="pr-dept"
                                    classNamePrefix="pr-select"
                                    options={deptOptions}
                                    value={selectedDept}
                                    onChange={(val) => {
                                        setSelectedDept(val);
                                        setSelectedEmp({ value: 'all', label: 'All Employees' });
                                    }}
                                    placeholder="All Departments"
                                />
                            </div>

                            <div className="pr-grp emp-field">
                                <label>Employee</label>
                                <Select
                                    instanceId="pr-emp"
                                    classNamePrefix="pr-select"
                                    options={empOptions}
                                    value={selectedEmp}
                                    isSearchable
                                    placeholder="Select Employee"
                                    onChange={setSelectedEmp}
                                />
                            </div>

                            <div className="pr-grp period-field">
                                <label>Month & Year</label>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={(date) => {
                                            setSelectedDate(date);
                                            // fetchPayrollData();
                                        }}
                                        dateFormat="MM-yyyy"
                                        showMonthYearPicker
                                        placeholderText="Select month & year"
                                        className="react-datepicker-input"
                                    />
                                </div>
                            </div>

                            <div className="pr-btn-grp">
                                <button className="pr-btn-search" onClick={() => fetchPayrollData()}>Search</button>
                            </div>
                        </div>
                    </div>

                    <div className="pr-table-container">
                        <table className="pr-table-main">
                            <thead>
                                <tr className="pr-th-parent">
                                    <th rowSpan="2" width="40">ID</th>
                                    <th colSpan="2">Employee Info</th>
                                    <th colSpan="2">Job Details</th>
                                    <th colSpan="2">Fixed Adjustments</th>
                                    <th colSpan="2">Current Evaluation</th>
                                    <th colSpan="2">Base Salary</th>

                                    <th colSpan="2">Final Payout</th>
                                </tr>
                                <tr className="pr-th-child">
                                    <th>Name</th>
                                    <th>Contact Info</th>
                                    <th>Dept</th>
                                    <th>Designation</th>
                                    <th>Allowances</th>
                                    <th>Deductions</th>
                                    <th>Bonus</th>
                                    <th>Fine</th>
                                    <th>Base Salary</th>
                                    <th>Advance Debits</th>
                                    <th>Net Adj</th>
                                    <th>Net Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? data.map((item, index) => {
                                    const baseSalary = parseFloat(item.Salery) || 0;
                                    const fixedAllowances = item.bonuses?.reduce((sum, b) => sum + parseFloat(b.value || 0), 0) || 0;
                                    const fixedDeductions = item.deductions?.reduce((sum, d) => sum + parseFloat(d.value || 0), 0) || 0;
                                    const currentBonus = parseFloat(item.bonus_main?.[0]?.bonus || 0);
                                    const currentFine = parseFloat(item.bonus_main?.[0]?.fine || 0);
                                    const netAdjustment = currentBonus - currentFine + fixedAllowances - fixedDeductions;
                                    // const vouchers_main = item?.vouchers_main || [];
                                    // const filteredVouchers = vouchers_main.filter(v => v.date == formattedDate);
                                    // const vouchers_price = filteredVouchers[0]?.total_amount ? parseFloat(filteredVouchers[0].total_amount) : 0;
                                    const vouchers_main = item?.vouchers_main || [];

                                    const vouchers_price = vouchers_main
                                        .filter(v => v.date === formattedDate)
                                        .reduce((sum, v) => sum + parseFloat(v.total_amount || 0), 0);
                                    const finalNetPay = baseSalary + netAdjustment - vouchers_price;
                                    // const date = 

                                    return (
                                        <tr key={item.id || index} style={{ backgroundColor: item.is_processed == 1 ? '#6007071f' : 'white' }}>
                                            <td>{index + 1}</td>
                                            <td><span className="pr-emp-name">{item.first_name} {item.last_name}</span></td>
                                            <td>
                                                <div className="pr-small-text">
                                                    {item.phone}<br />{item.email}
                                                </div>
                                            </td>
                                            <td>{item.department_name}</td>
                                            <td>{item.Post_name}</td>
                                            <td>
                                                <span className="pr-bold">${fixedAllowances.toLocaleString()}</span>
                                                <span className="pr-hint">Items: {item.bonuses?.length || 0}</span>
                                            </td>
                                            <td>
                                                <span className="pr-bold">${fixedDeductions.toLocaleString()}</span>
                                                <span className="pr-hint">Items: {item.deductions?.length || 0}</span>
                                            </td>
                                            <td>
                                                <input type="number" className="pr-input-small" value={currentBonus} readOnly disabled/>
                                                <span className="pr-hint">Prev: {currentBonus}</span>
                                            </td>
                                            <td>
                                                <input type="number" className="pr-input-small" value={currentFine} readOnly disabled/>
                                                <span className="pr-hint">Prev: {currentFine}</span>
                                            </td>
                                            <td className="pr-bold">${baseSalary.toLocaleString()}</td>
                                            <td className={vouchers_price <= 0 ? "pr-green" : "pr-red"}>
                                                {vouchers_price <= 0 ? "+" : "-"}{vouchers_price.toLocaleString()}
                                            </td>

                                            <td className={netAdjustment >= 0 ? "pr-green" : "pr-red"}>
                                                {netAdjustment >= 0 ? "+" : ""}{netAdjustment.toLocaleString()}
                                            </td>
                                            <td className="pr-payout-final">
                                                <strong>${finalNetPay.toLocaleString()}</strong>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="12" className="text-center" style={{ padding: '20px' }}>No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div></>
            }
            {render == false && <>
                <div className="section-container">
                    <div className="section-header">
                        <div className="header-info">
                            <h2 className="section-title">Payroll</h2>
                        </div>
                        <button onClick={() => setRender(true)} className="btn-add">
                            + Add New Payroll
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="simple-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>DATE</th>
                                    <th>T_Employ</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {geton && geton.length > 0 ? geton.map((item, index) => (
                                    <tr key={index}>
                                        <td>#pay-00{index + 1}</td>
                                        <td>{item?.date ? item.date : "N/A"}</td>
                                        <td>{item?.total_employees ? item.total_employees : "0"}</td>
                                        <td className="text-right">
                                            <div className="custom-dropdown">
                                                <button className="drop-btn">Actions</button>
                                                <div className="drop-content">
                                                    <button onClick={() => handleEdit(item.date)}>
                                                        Edit Detail
                                                    </button>
                                                    <button onClick={() => handlePrint(item.date)}>
                                                        Print
                                                    </button>
                                                    <button onClick={() => handleDelete(item.date)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>No bonuses found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>}
        </>
    );
};

export default PayrollProcessor;