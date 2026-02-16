import React from 'react';
import { Menu } from "lucide-react";
import Department from "./departments.js";
import Posts from "./posts.js";
import Employees from "./Employees.js";
import Question from './Questions.js';
import Deduction from './Deduction.js';
import Bonus from './bonus.js';
import ReportDashboard from './report.js';
// import ACR from './acr.js'; // Isko alag se import kar lena

export default function Sidebar() {
  return (
    <div className="dashboard-wrapper">
      {/* 1. Sidebar Toggle Checkbox (Invisible) */}
      <input type="checkbox" id="sidebar-collapse-check" hidden />

      {/* 2. Content Tabs Logic (Invisible) */}
      <input type="radio" name="nav-tab" id="tab-acr" defaultChecked hidden />
      <input type="radio" name="nav-tab" id="tab-bonus" hidden />
      <input type="radio" name="nav-tab" id="tab-employees" hidden />
      <input type="radio" name="nav-tab" id="tab-departments" hidden />
      <input type="radio" name="nav-tab" id="tab-posts" hidden />
      <input type="radio" name="nav-tab" id="tab-questions" hidden />
      <input type="radio" name="nav-tab" id="tab-deductions" hidden />
      <input type="radio" name="nav-tab" id="tab-rating" hidden />
      <input type="radio" name="nav-tab" id="tab-reports" hidden />

      <header className="app-header">
        <div className="flexbox">
          <div className="col">
            {/* Burger Icon connects to the collapse checkbox */}
            <label htmlFor="sidebar-collapse-check" className="burger-btn">
              <Menu size={24} />
            </label>
            <h1 className="app-title">Admin <span>Dashboard</span></h1>
          </div>
        </div>
      </header>

      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">ACR</div>
            <h2 className="logo-text">Employee<span>System</span></h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <label htmlFor="tab-acr" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span className="nav-text">ACR</span>
              </label>
            </li>
           
            <li className="nav-item">
              <label htmlFor="tab-employees" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <span className="nav-text">Employees</span>
              </label>
            </li>
            <li className="nav-item">
              <label htmlFor="tab-departments" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18M3 12h18"/></svg>
                <span className="nav-text">Departments</span>
              </label>
            </li>
            <li className="nav-item">
              <label htmlFor="tab-posts" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/></svg>
                <span className="nav-text">All Posts</span>
              </label>
            </li>
             <li className="nav-item">
              <label htmlFor="tab-bonus" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                <span className="nav-text">Bonus</span>
              </label>
            </li>
            
            <li className="nav-item">
              <label htmlFor="tab-deductions" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span className="nav-text">Deductions</span>
              </label>
            </li>
            <li className="nav-item">
              <label htmlFor="tab-questions" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span className="nav-text">Questions</span>
              </label>
            </li>
            <li className="nav-item">
              <label htmlFor="tab-rating" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span className="nav-text">Ratings</span>
              </label>
            </li>
            <li className="nav-item">
              <label htmlFor="tab-reports" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span className="nav-text">Reports</span>
              </label>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Content Views */}
      <main className="content-area acr-view"><ReportDashboard /></main>
      <main className="content-area bonus-view"><Bonus /></main>
      <main className="content-area employees-view"><Employees /></main>
      <main className="content-area departments-view"><Department /></main>
      <main className="content-area posts-view"><Posts/></main>
      <main className="content-area questions-view"><Question /></main>
      <main className="content-area deductions-view"><Deduction /></main>
      <main className="content-area rating-view"><ReportDashboard /></main>
      <main className="content-area reports-view"><h1>Reports View</h1></main>
    </div>
  );
}