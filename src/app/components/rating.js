export default function DashboardPage() {
  const data = [
    { id: "01", name: "John Doe", dept: "Development", salary: 4500, bonus: 500, deduction: 150, questionnaire: "Filled" },
    { id: "02", name: "Jane Smith", dept: "Design", salary: 4200, bonus: 400, deduction: 100, questionnaire: "Pending" },
    { id: "03", name: "Robert Brown", dept: "HR", salary: 3800, bonus: 200, deduction: 50, questionnaire: "Filled" },
  ];

  return (
    <div className="dashboard-container">
    

      <main className="main-content">
        <div className="header-row">
          <h2 style={{fontWeight: '400'}}>Report Overview</h2>
          <div className="date-filter">
            {/* SVG implementation inside Date Filter */}
            <svg viewBox="0 0 24 24"><path d="M17,12c-2.76,0-5,2.24-5,5s2.24,5,5,5,5-2.24,5-5-2.24-5-5-5Zm3,5.5h-2.5v2.5h-1v-2.5h-2.5v-1h2.5v-2.5h1v2.5h2.5v1ZM19,4h-1V2h-2v2H8V2H6v2H5c-1.11,0-1.99,.9-1.99,2L3,20c0,1.1,.89,2,2,2h7.3c-.7-.84-1.17-1.87-1.27-3H5V10h14v1.27c1.1,.1,2.13,.57,3,1.27V6c0-1.1-.9-2-2-2Z"/></svg>
            Jan 01, 2026 - Feb 15, 2026
          </div>
        </div>

        {/* 6 Metric Cards */}
        <div className="stats-grid">
          <div className="stat-card"><label>Total Employees</label><span className="value">42</span></div>
          <div className="stat-card"><label>Total Departments</label><span className="value">05</span></div>
          <div className="stat-card"><label>Total Designations</label><span className="value">14</span></div>
          <div className="stat-card"><label>Bonus Amount</label><span className="value">$8,250</span></div>
          <div className="stat-card"><label>Deductions</label><span className="value">$1,100</span></div>
          <div className="stat-card"><label>Total Salary</label><span className="value">$142,000</span></div>
        </div>

        {/* Tabs */}
     

        {/* Data Table */}
        <div className="report-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Questionnaire</th>
                <th>Salary</th>
                <th>Bonus</th>
                <th>Deduction</th>
                <th>Net Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.name}</td>
                  <td>{emp.dept}</td>
                  <td>
                    <span className={`status-tag ${emp.questionnaire.toLowerCase()}`}>
                      {emp.questionnaire}
                    </span>
                  </td>
                  <td>${emp.salary}</td>
                  <td>${emp.bonus}</td>
                  <td>-${emp.deduction}</td>
                  <td><strong>${emp.salary + emp.bonus - emp.deduction}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-summary">
            Grand Total Salary: $12,900.00
          </div>
        </div>
      </main>
    </div>
  );
}