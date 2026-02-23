'use client'
import axios, { all } from 'axios';
import React, { useState, useEffect, use } from 'react';
// import Select from 'react-select';
import dynamic from 'next/dynamic';
// import { set } from 'react-datepicker/dist/date_utils';
import ToastDisplay from './alert.js';
import Loading from './loading.js';


const Select = dynamic(() => import('react-select'), { ssr: false });


const BonusManagement = () => {
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [departments, setdepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [masterEmployees, setMasterEmployees] = useState([]);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [data, setdata] = useState([]);
  const [Updata, setUpdata] = useState(false);
  const [tab,settab] = useState(false);
  const [Type, setType] = useState(null);
  const [tabledata, setTabledata] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updateid, setupdateid] = useState(null);
  const [fineAmount, setFineAmount] = useState([{
    fine: '',
    bonus: '',
    emp_id: ''
  }]);
  const [payload, setPayload] = useState({
    employee_id: editId || "",
    type: Type?.value || '',
    month: month?.value || '',
    year: year?.value || '',
    bonus_main_id: updateid || "",
    children: fineAmount || []
  })

  const [employees, setemployees] = useState([
    {
      value: null,
      label: 'All Employees'
    }
  ]);




  const monthOptions = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];


  const yearOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let i = currentYear + 10; i >= 2000; i--) {
      years.push({ value: i.toString(), label: i.toString() });
    }

    return years;
  }, []);



  const typeOptions = [
    { value: 'fine', label: 'Fine' },
    { value: 'bonus', label: 'Bonus' },
    { value: 'both', label: 'Both' }
  ];
  
  async function fetchdepartmentsList() {

    try {
      setLoading(true);
      const req = await axios.get('http://localhost/react-backend/api/Posts/get_department.php');
      setdepartments(req.data.map(dept => ({ value: dept.id, label: dept.department_name })))
      const emp = await axios.get('http://localhost/react-backend/api/Employees/get.php');
      const table =  await axios.get('http://localhost/react-backend/api/bonusmain/get.php');
      
      setTabledata(table.data);
      // const table = await axios.get('http://localhost/react-backend/api/bonusmain/get.php');

// Map previous bonus/fine per employee for quick lookup
const bonusMap = {};
table.data.forEach(b => {
  bonusMap[b.employee_id] = {
    bonus: b.bonus,
    fine: b.fine
  };
});

// Update masterEmployees to include previousBonus and previousFine
const empOptions = emp.data.map(item => ({
  value: item.id,
  label: item.first_name + ' ' + item.last_name,
  department_id: item.department_id,
  status: item.status,
  desination: item.post_name,
  department: item.department_name,
  adress: item.address,
  contact: item.phone,
  email: item.email,
  salery: item.Salery,
  allowence: item.bonuses.reduce((a, b) => a + Number(b.value), 0),
  deduction: item.deductions.reduce((a, b) => a + Number(b.value), 0),
  previousBonus: bonusMap[item.id]?.bonus || 0,
  previousFine: bonusMap[item.id]?.fine || 0
}));
// console.log(empOptions);


      selectedDepartment ? setdata(empOptions.filter(emp => emp.department_id === selectedDepartment.value)) : setdata(empOptions);
      setMasterEmployees(empOptions);
      setemployees([{ value: "all", label: 'All Employees', department_id: null }, ...empOptions]);
      // setToast({ show: true, type: 'success', message: 'Data loaded successfully!' });
    } catch (error) {
      setToast({ show: true, type: 'error', message: 'Error loading data!' });
    }
    finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchdepartmentsList();
  }, []);
  useEffect(() => {
    if (!selectedDepartment) {
      setemployees([
        { value: "all", label: 'All Employees', department_id: null },
        ...masterEmployees
      ]);

      return;
    }

    const filteredEmployees = masterEmployees.filter(
      emp => emp.department_id === selectedDepartment.value
    );
    setdata(filteredEmployees);
    setemployees([
      { value: "all", label: 'All Employees', department_id: null },
      ...filteredEmployees
    ]);



  }, [selectedDepartment, masterEmployees]);

 useEffect(() => {
  const bonusMainId = updateid || ""; 
  const employeeId = selectedEmployee?.value || "";

  setPayload({
    employee_id: employeeId,
    bonus_main_id: bonusMainId,
    type: Type?.value || '',
    month: month?.value || '',
    year: year?.value || '',
    children: fineAmount
  });
}, [selectedEmployee, updateid, Type, month, year, fineAmount]);

  const employeesToRender = selectedEmployee?.value === 'all' ? data : [selectedEmployee];

  async function post_data() {
    if (!Type || !month || !year) {
      setToast({ show: true, type: 'error', message: 'Please select type, month, and year.' });
      return;
    }
    // console.log('Posting data with payload:', payload);
    try {
      setLoading(true);
      const url = Updata ? "update.php" : "create.php";
      const req = await axios.post(`http://localhost/react-backend/api/bonusmain/${url}`, payload);
      setToast({ show: true, type: 'success', message: req?.data?.message });
    } catch (error) {
      console.log(err.response?.data || err)
      setToast({ show: true, type: 'error', message: error?.response?.data?.message || 'Error saving data!' });
    }
    finally {
      setLoading(false);
      fetchdepartmentsList();
    }
  }
 async function openModal(id) {
  if (!id) return;
  setupdateid(id);
  try {
    setLoading(true);
   setUpdata(true);
    const res = await axios.get(`http://localhost/react-backend/api/bonusmain/get_single.php?id=${id}`);
    
    const bonusData = res.data; 
    
    if (bonusData && bonusData.length > 0) {
      
      const main = bonusData[0];
      setMonth({ value: main.month, label: monthOptions.find(m => m.value === main.month)?.label });
      setYear({ value: main.year, label: main.year });
      setType({ value: main.type, label: main.type.charAt(0).toUpperCase() + main.type.slice(1) });

  
      const mappedFineAmount = bonusData.map(b => ({
        emp_id: b.employee_id,
        bonus: Number(b.bonus) || 0,
        fine: Number(b.fine) || 0
      }));

      setFineAmount(mappedFineAmount);

      
      const empIds = mappedFineAmount.map(b => b.emp_id);
      const selectedEmps = masterEmployees.filter(emp => empIds.includes(emp.value));
      setSelectedEmployee(selectedEmps.length === 1 ? selectedEmps[0] : { value: "all", label: "All Employees" });

      setEditId(id);
      settab(true);
    }
  } catch (err) {
    setToast({ show: true, type: "error", message: "Failed to fetch bonus details!" });
  } finally {
    setLoading(false);
  }
}

  async function deleter(id) {
     setShowDeleteModal(true);
    try {
      setLoading(true);
      const res = await axios.post(`http://localhost/react-backend/api/bonusmain/delete.php`, { id });
      setToast({ show: true, type: 'success', message: res?.data?.message || 'Deleted successfully!' });
    }
    catch (err) {
      setToast({ show: true, type: 'error', message: 'Failed to delete bonus.' });
    }
    finally {
      setLoading(false);
      setShowDeleteModal(false);
      fetchdepartmentsList();
    }
  }
// console.log("Payload:", payload);
  return (
    <div className="payroll-page-container">
      {loading && <Loading />}
      <ToastDisplay toast={toast} setToast={setToast} />
     {tab == true &&  <>

        <div className="filter-section-card">
          
      <div className="qf-header">
        <div>
          <h2 className="qf-title">Evaluation Bonus</h2>
          <p className="qf-subtitle">
            Create Bonus for performance evaluation
          </p>
        </div>
        <button className="btn-back" onClick={() => { settab(false); setUpdata(false); }}>← Back</button>
      </div>
          <div className="filter-row">
            <div className="input-field">
              <label>Dept Name</label>
              <Select
                classNamePrefix="react-select"
                placeholder="Select Dept"
                options={departments}
                value={selectedDepartment}
                onChange={setSelectedDepartment}
              />
            </div>

            <div className="input-field">
              <label>Select Employee</label>
              <Select
                classNamePrefix="react-select"
                placeholder="Search..."
                options={employees}
                value={selectedEmployee}
                onChange={setSelectedEmployee}
              />
            </div>

            <div className="input-field">
              <label>Type</label>
              <Select
                classNamePrefix="react-select"
                placeholder="Type"
                options={typeOptions}
                onChange={setType}
              />
            </div>

            <div className="input-field sm">
              <label>Month</label>
              <Select
                classNamePrefix="react-select"
                options={monthOptions}
                value={month}
                onChange={setMonth}
                placeholder="Month"
              />
            </div>

            <div className="input-field sm">
              <label>Year</label>
              <Select
                classNamePrefix="react-select"
                options={yearOptions}
                value={year}
                onChange={setYear}
                placeholder="Year"
              />
            </div>

            <div className="btn-container">
              <button className="search-action-btn" onClick={post_data}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Employee Data Table */}
        <div className="table-wrapper">
          <table className="payroll-main-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee Details</th>
                <th>Contact & Address</th>
                <th>Dept / Post</th>
                <th>Base Salary</th>
                {Type?.value == "fine" && <th>Fine Amount</th>}
                {Type?.value == "bonus" && <th>Bonus Amount</th>}
                {Type?.value == "both" && <>
                  <th>Fine Amount</th>
                  <th>Bonus Amount</th>
                </>}

                <th>Total Payout</th>
              </tr>
            </thead>
            <tbody>
              {employeesToRender != '' ? employeesToRender?.map((item, index) => (


                <tr key={index}>

                  <td>{index + 1}</td>
                  <td>
                    <div className="emp-cell">
                      <span className="name">{item.label}</span>
                      <div className="sub-text">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Status {item.status == 1 ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <span className="sub-text">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        {item.email}
                      </span>
                      <span className="sub-text">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        {item.contact}
                      </span>
                      <span className="sub-text">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {item.adress}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="dept-cell">
                      <span className="dept-tag">{item.department}</span>
                      <span className="post-tag">{item.desination}</span>
                    </div>
                  </td>
                  <td className="salary-val">{item.salery}
                    <p className='allowences'>Allowence Rate  {item.allowence}</p>
                    <p className='allowences'>Deduction Rate  {item.deduction}</p>
                  </td>
                  {Type?.value == "fine" && <td>
                    <input type="number" className="table-inline-input" placeholder="0" onChange={(e) => {
                      const updated = [...fineAmount];
                      updated[index] = {
                        ...updated[index],
                        fine: e.target.value,
                        emp_id: item.value
                      };
                      setFineAmount(updated);
                    }}
                    />
                    <p className='allowences'>Previous {item.previousFine}</p></td>}
                  {Type?.value == "bonus" && <td>
                    <input type="number" className="table-inline-input" placeholder="0" onChange={(e) => {
                      const updated = [...fineAmount];
                      updated[index] = {
                        ...updated[index],
                        bonus: e.target.value,
                        emp_id: item.value
                      };
                      setFineAmount(updated);
                    }}
                    />
                    <p className='allowences'>Previous {item.previousBonus}</p></td>}
                  {Type?.value == "both" && <>
                    <td><input type="number" className="table-inline-input" placeholder="0" onChange={(e) => {
                      const updated = [...fineAmount];
                      updated[index] = {
                        ...updated[index],
                        fine: e.target.value,
                        emp_id: item.value
                      };
                      setFineAmount(updated);
                    }}
                    />
                      <p className='allowences'>Previous {item.previousBonus}</p></td>
                    <td><input type="number" className="table-inline-input" placeholder="0" onChange={(e) => {
                      const updated = [...fineAmount];
                      updated[index] = {
                        ...updated[index],
                        bonus: e.target.value,
                        emp_id: item.value
                      };
                      setFineAmount(updated);
                    }}
                    />
                      <p className='allowences'>Previous {item.previousFine}</p></td>
                  </>}

                  <td className="final-total-col">
                    <p className='allowences'>Bonus Rate: {fineAmount[index]?.bonus || 0}</p>
                    <p className='allowences'>Fine: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {fineAmount[index]?.fine || 0}</p>
                    <strong>$ {item.salery + (fineAmount[index]?.bonus || 0) - (fineAmount[index]?.fine || 0)}</strong>
                  </td>
                </tr>
              )) : <tr><td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>No employees found for the selected criteria.</td></tr>}
            </tbody>
          </table>
        </div>


      </>
}
      {tab == false && <>



        <div className="section-container">

          {/* Header with Title and Add Button */}
          <div className="section-header">
            <div className="header-info">
              <h2 className="section-title">Bonuses</h2>
            </div>
           <button
  className="btn-add"
  onClick={() => {
    // Open the tab
    settab(true);
    // Clear editing mode
    setUpdata(false);
    setEditId(null);
    setSelectedDepartment(null);
    setSelectedEmployee(null);
    setMonth(null);
    setYear(null);
    setType(null);
    setFineAmount([{ fine: '', bonus: '', emp_id: '' }]);
    setPayload({
      employee_id: '',
      type: '',
      month: '',
      year: '',
      children: [{ fine: '', bonus: '', emp_id: '' }]
    });
  }}
>
  + Add New Bonus
</button>

          </div>

          {/* Table Section */}
          <div className="table-responsive">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Type</th>
                  <th>Fine</th>
                  <th>Bonus</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tabledata && tabledata.length > 0 ? tabledata.map((item, index) => (
                  <tr key={index}>
                    <td>#DEP-00{index + 1}</td>
                    <td>{item?.month ? item.month : "N/A"}</td>
                    <td>{item?.year ? item.year : "N/A"}</td>
                    <td>{item?.type ? item.type : "N/A"}</td>
                    <td>{item?.fine ? item.fine : "0"}</td>
                    <td>{item?.bonus ? item.bonus : "0"}</td>
                     <td className="text-right">
                                    <div className="custom-dropdown">
                                        <button className="drop-btn">Actions</button>
                                        <div className="drop-content">
                                            <button onClick={() => openModal(item.id)}>
                                                Edit Detail
                                            </button>
                                            <button onClick={() => deleter(item.id)}>
                                                Delete Detail
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

      </>
}
    </div>
  );
};

export default BonusManagement;