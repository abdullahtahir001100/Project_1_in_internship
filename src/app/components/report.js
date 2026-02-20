'use client';
import axios from "axios";
import { useEffect, useState } from "react";
import Loading from "./loading.js";
export default function DashboardPage() {
 
  const [reportData, setReportData] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalDesignations: 0,
    totalBonus: 0,
    totalDeductions: 0,
    totalSalary: 0,
    employeeDetails: []

  });
  const [loading, setLoading] = useState(true);

  async function fetchReportData() {
    try {
    setLoading(true);
      const response1 = await axios.get('https://php-production-c3d6.up.railway.app/api/Posts/get_department.php'); // Departments
      const response2 = await axios.get('https://php-production-c3d6.up.railway.app/api/Posts/get'); // Posts
      const response3 = await axios.get('https://php-production-c3d6.up.railway.app/api/bonus/get.php'); // Bonuses
      const response4 = await axios.get('https://php-production-c3d6.up.railway.app/api/deduction/get.php'); // Deductions
      const response6 = await axios.get('https://php-production-c3d6.up.railway.app/api/Employees/get.php'); // Employees

        const employees = response6.data;

   
      setReportData({
          totalEmployees: employees.length,
          totalDepartments: response1.data.length,
          totalDesignations: response2.data.length,
          totalBonus: response3.data.length,
          totalDeductions: response4.data.length,
          totalSalary: employees.reduce((sum, emp) => Number(sum) + Number(emp?.Salery || 0), 0),
          employeeDetails: employees
      });
    } catch (error) {
        console.error("Error fetching report data", error);
    }
    finally {
      setLoading(false);
    }
  }
    useEffect(() => {
        fetchReportData();
    }, []);
            
   
  return (
    <div className="dashboard-container">
      {loading && <Loading />}
      <main className="main-content">
       

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon employees">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div className="stat-info">
              <label>Total Employees</label>
              <span className="value">{reportData.totalEmployees}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon departments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </div>
            <div className="stat-info">
              <label>Total Depts</label>
              <span className="value">{reportData.totalDepartments}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon designations">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 7h20M2 12h20M2 17h20"></path></svg>
            </div>
            <div className="stat-info">
              <label>Designations</label>
              <span className="value">{reportData.totalDesignations}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bonus">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div className="stat-info">
              <label>Bonus</label>
              <span className="value">#{reportData.totalBonus}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon deductions">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            <div className="stat-info">
              <label>Deductions</label>
              <span className="value">#{reportData.totalDeductions}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon salary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </div>
            <div className="stat-info">
              <label>Total Salary</label>
              <span className="value">${reportData.totalSalary}</span>
            </div>
          </div>
        </div>

        <div className="report-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Salary</th>
                <th>Bonus</th>
                <th>Deduction</th>
                <th>Net Total</th>
              </tr>
            </thead>
            <tbody>
              {reportData.employeeDetails.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.first_name} {emp.last_name}</td>
                  <td>{emp.department_name}</td>
                  <td>
                    <span>
                      {emp.post_name}
                    </span>
                  </td>
                  <td>{emp.Salery ? `$${emp.Salery}` : '$0'}</td>
                  <td>${emp.bonuses.reduce((sum, bonus) => Number(sum) + Number(bonus.value), 0)}</td>
                  <td>-${emp.deductions.reduce((sum, deduction) => Number(sum) + Number(deduction.value), 0)}</td>
                  <td><strong>${Number(emp.Salery) + emp.bonuses.reduce((sum, bonus) => Number(sum) + Number(bonus.value), 0) - emp.deductions.reduce((sum, deduction) => Number(sum) + Number(deduction.value), 0)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-summary"></div>
        </div>
      </main>
    </div>
  );
}