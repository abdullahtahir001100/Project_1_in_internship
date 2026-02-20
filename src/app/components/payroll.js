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
// const [fineAmount, setFineAmount] = useState([]);
const [selectedDept, setSelectedDept] = useState({ value: 'all', label: 'All Department' });
const [selectedEmp, setSelectedEmp] = useState({ value: 'all', label: 'All Employees' });
const [formattedDate , setFormattedDate] = useState('');
const[renderdate, setRenderDate] = useState('');

const [payload, setPayload] = useState({
    emp_id: '',
    duration: '',  
    department: selectedDept.value || '',
});

const id = useId();


async function fetchPayrollData() {
    try {
        setIsLoading(true);
        console.log(formattedDate)
        const res = await axios.get(`http://localhost/react-backend/api/bonusmain/all.php?duration=${formattedDate}`);
        
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

    // ✅ SAFE DATE FORMAT
    // let formattedDate = '';
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
    // fetchPayrollData();

}, [selectedDept, selectedEmp, masterData, selectedDate]);


// console.log("Type of selectedDate:", typeof selectedDate ,payload,selectedDate);
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
        }
    }

return (
    <div className="pr-compact-wrapper">
        {isLoading && <Loading />}
        <ToastDisplay toast={toast} setToast={setToast} />
        
        <div className="pr-header-area">
            {/* <h2 className="pr-page-title">Payroll Processing (Real-Time)</h2> */}
            <button className="pr-make-btn" onClick={handleProcessPayroll}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                Process Payroll
            </button>
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
                            setSelectedEmp({ value: 'all', label: 'All Employees' }); // Reset employee on dept change
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
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="MM-yyyy"
                        showMonthYearPicker
                        placeholderText="Select month & year"
                        className="react-datepicker-input"
                    />
                    </div>
                </div>

                <div className="pr-btn-grp">
                    <button className="pr-btn-search" onClick={fetchPayrollData}>Search</button>
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
                        <th colSpan="3">Final Payout</th>
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

const finalNetPay = baseSalary + netAdjustment;

return (
  <tr key={item.id || index} style={{backgroundColor: item.is_processed == 1 ? '#6007071f' : 'white'}}>
    <td>{index + 1}</td>
    <td><span className="pr-emp-name">{item.first_name} {item.last_name}</span></td>
    <td>
      <div className="pr-small-text">
        {item.phone}<br/>{item.email}
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
      <input
        type="number"
        className="pr-input-small"
        placeholder="0"
        value={currentBonus}
        readOnly
      />
      <span className="pr-hint">Prev: {currentBonus}</span>
    </td>
    <td>
      <input
        type="number"
        className="pr-input-small"
        placeholder="0"
        value={currentFine}
        readOnly
      />
      <span className="pr-hint">Prev: {currentFine}</span>
    </td>

    <td className="pr-bold">${baseSalary.toLocaleString()}</td>
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
<td colSpan="12" className="text-center" style={{padding: '20px'}}>No data available</td>
</tr>
)}

</tbody>
</table>
</div>
</div>
);
};

export default PayrollProcessor;