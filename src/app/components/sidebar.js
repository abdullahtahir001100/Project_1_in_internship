'use client'; // Ye line zaroori hai ssr: false ke liye

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Menu } from "lucide-react";

// Dynamic imports with ssr: false
const Department = dynamic(() => import("./departments.js"), { ssr: false });
const Posts = dynamic(() => import("./posts.js"), { ssr: false });
const Employees = dynamic(() => import("./Employees.js"), { ssr: false });
const Question = dynamic(() => import('./Questions.js'), { ssr: false });
const Deduction = dynamic(() => import('./Deduction.js'), { ssr: false });
const Bonus = dynamic(() => import('./bonus.js'), { ssr: false });
const ReportDashboard = dynamic(() => import('./report.js'), { ssr: false });
const Payroll = dynamic(() => import('./payroll.js'), { ssr: false });
const Rating = dynamic(() => import('./rating.js'), { ssr: false });
const AttendanceCalendar = dynamic(() => import('./AttendanceCalendar.js'), { ssr: false });
const Resignation = dynamic(() => import('./Resignation.js'), { ssr: false });
const Ledger = dynamic(() => import('./Ledger.js'), { ssr: false });
const Voucher = dynamic(() => import('./Voucher.js'), { ssr: false });

export default function Sidebar() {
  const [dark, setDark] = useState(false);

  // Load dark mode preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('dark_mode');
    if (saved === 'true') {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLogout = () => {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    window.location.reload();
  };

  return (
      <div className="dashboard-wrapper">
      {/* 1. Sidebar Toggle Checkbox (Invisible) */}
      <input type="checkbox" id="sidebar-collapse-check" hidden />

      {/* 2. Subtab Group Toggles */}
      <input type="checkbox" id="dept-toggle" hidden />
      <input type="checkbox" id="bonus-toggle" hidden />
      <input type="checkbox" id="payroll-toggle" hidden />
      <input type="checkbox" id="hr-toggle" hidden />
      <input type="checkbox" id="accounts-toggle" hidden />
      <input type="checkbox" id="system-toggle" hidden />

      {/* 3. Content Tabs Logic (Invisible) */}
      <input type="radio" name="nav-tab" id="tab-acr" defaultChecked hidden />
      <input type="radio" name="nav-tab" id="tab-bonus" hidden />
      <input type="radio" name="nav-tab" id="tab-employees" hidden />
      <input type="radio" name="nav-tab" id="tab-departments" hidden />
      <input type="radio" name="nav-tab" id="tab-posts" hidden />
      <input type="radio" name="nav-tab" id="tab-questions" hidden />
      <input type="radio" name="nav-tab" id="tab-deductions" hidden />
      <input type="radio" name="nav-tab" id="tab-rating" hidden />
      <input type="radio" name="nav-tab" id="tab-reports" hidden />
      <input type="radio" name="nav-tab" id="tab-attendance" hidden />
      <input type="radio" name="nav-tab" id="tab-resignation" hidden />
      <input type="radio" name="nav-tab" id="tab-ledger" hidden />
      <input type="radio" name="nav-tab" id="tab-voucher" hidden />
      <input type="radio" name="nav-tab" id="tab-expenses" hidden />
      <input type="radio" name="nav-tab" id="tab-invoices" hidden />
      <input type="radio" name="nav-tab" id="tab-settings" hidden />
      <input type="radio" name="nav-tab" id="tab-audit" hidden />

      <header className="app-header">
        <div className="flexbox">
          <div className="col">
            <label htmlFor="sidebar-collapse-check" className="burger-btn">
              <Menu size={24} />
            </label>
            <h1 className="app-title">Admin <span>Dashboard</span></h1>
          </div>
          <div className="col header-actions">
            <button className="header-icon-btn" onClick={handleLogout} title="Logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
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
            {/* ACR */}
            <li className="nav-item nav-item-acr">
              <label htmlFor="tab-acr" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span className="nav-text">ACR</span>
              </label>
            </li>

            {/* Employees */}
            <li className="nav-item nav-item-employees">
              <label htmlFor="tab-employees" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <span className="nav-text">Employees</span>
              </label>
            </li>

            {/* ===== Department Group ===== */}
            <li className="nav-item nav-item-dept-group has-subtabs">
              <label htmlFor="dept-toggle" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18M3 12h18"/></svg>
                <span className="nav-text">Department</span>
                <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </label>
              <ul className="subtab-list dept-subtabs">
                <li className="subtab-item subtab-item-departments">
                  <label htmlFor="tab-departments" className="subtab-link"><span>Departments</span></label>
                </li>
                <li className="subtab-item subtab-item-posts">
                  <label htmlFor="tab-posts" className="subtab-link"><span>Designation</span></label>
                </li>
                <li className="subtab-item subtab-item-questions">
                  <label htmlFor="tab-questions" className="subtab-link"><span>Questions</span></label>
                </li>
              </ul>
            </li>

            {/* ===== Bonus & Fine Group ===== */}
            <li className="nav-item nav-item-bonus-group has-subtabs">
              <label htmlFor="bonus-toggle" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                <span className="nav-text">Bonus & Fine</span>
                <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </label>
              <ul className="subtab-list bonus-subtabs">
                <li className="subtab-item subtab-item-bonus">
                  <label htmlFor="tab-bonus" className="subtab-link"><span>Allowances</span></label>
                </li>
                <li className="subtab-item subtab-item-deductions">
                  <label htmlFor="tab-deductions" className="subtab-link"><span>Deductions</span></label>
                </li>
                <li className="subtab-item subtab-item-rating">
                  <label htmlFor="tab-rating" className="subtab-link"><span>Bonus</span></label>
                </li>
              </ul>
            </li>

            {/* ===== Payroll & Finance Group ===== */}
            <li className="nav-item nav-item-payroll-group has-subtabs">
              <label htmlFor="payroll-toggle" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h10"/></svg>
                <span className="nav-text">Payroll & Finance</span>
                <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </label>
              <ul className="subtab-list payroll-subtabs">
                <li className="subtab-item subtab-item-reports">
                  <label htmlFor="tab-reports" className="subtab-link"><span>Payroll</span></label>
                </li>
                <li className="subtab-item subtab-item-ledger">
                  <label htmlFor="tab-ledger" className="subtab-link"><span>Ledger</span></label>
                </li>
                <li className="subtab-item subtab-item-voucher">
                  <label htmlFor="tab-voucher" className="subtab-link"><span>Voucher</span></label>
                </li>
              </ul>
            </li>

            {/* ===== HR Management Group ===== */}
            <li className="nav-item nav-item-hr-group has-subtabs">
              <label htmlFor="hr-toggle" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span className="nav-text">HR Management</span>
                <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </label>
              <ul className="subtab-list hr-subtabs">
                <li className="subtab-item subtab-item-attendance">
                  <label htmlFor="tab-attendance" className="subtab-link"><span>Attendance</span></label>
                </li>
                <li className="subtab-item subtab-item-resignation">
                  <label htmlFor="tab-resignation" className="subtab-link"><span>Resignations</span></label>
                </li>
              </ul>
            </li>

            {/* ===== Accounts Group ===== */}
            <li className="nav-item nav-item-accounts-group has-subtabs">
              <label htmlFor="accounts-toggle" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span className="nav-text">Accounts</span>
                <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </label>
              <ul className="subtab-list accounts-subtabs">
                <li className="subtab-item subtab-item-expenses">
                  <label htmlFor="tab-expenses" className="subtab-link"><span>Expenses</span></label>
                </li>
                <li className="subtab-item subtab-item-invoices">
                  <label htmlFor="tab-invoices" className="subtab-link"><span>Invoices</span></label>
                </li>
              </ul>
            </li>

            {/* ===== System Group ===== */}
            <li className="nav-item nav-item-system-group has-subtabs">
              <label htmlFor="system-toggle" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <span className="nav-text">System</span>
                <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </label>
              <ul className="subtab-list system-subtabs">
                <li className="subtab-item subtab-item-settings">
                  <label htmlFor="tab-settings" className="subtab-link"><span>Settings</span></label>
                </li>
                <li className="subtab-item subtab-item-audit">
                  <label htmlFor="tab-audit" className="subtab-link"><span>Audit Log</span></label>
                </li>
              </ul>
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
      <main className="content-area rating-view"><Rating /></main>
      <main className="content-area reports-view"><Payroll/></main>
      <main className="content-area attendance-view"><AttendanceCalendar /></main>
      <main className="content-area resignation-view"><Resignation /></main>
      <main className="content-area ledger-view"><Ledger /></main>
      <main className="content-area voucher-view"><Voucher /></main>
      <main className="content-area expenses-view">
        <div className="section-container"><div className="section-header"><h2 className="section-title">Expenses</h2><p className="section-subtitle">Track expenses</p></div><div style={{padding: '2rem', color: '#666'}}>Expense tracking coming soon...</div></div>
      </main>
      <main className="content-area invoices-view">
        <div className="section-container"><div className="section-header"><h2 className="section-title">Invoices</h2><p className="section-subtitle">Manage invoices</p></div><div style={{padding: '2rem', color: '#666'}}>Invoice management coming soon...</div></div>
      </main>
      <main className="content-area settings-view">
        <div className="section-container"><div className="section-header"><h2 className="section-title">Settings</h2><p className="section-subtitle">System settings</p></div><div style={{padding: '2rem', color: '#666'}}>System settings coming soon...</div></div>
      </main>
      <main className="content-area audit-view">
        <div className="section-container"><div className="section-header"><h2 className="section-title">Audit Log</h2><p className="section-subtitle">View audit trail</p></div><div style={{padding: '2rem', color: '#666'}}>Audit log coming soon...</div></div>
      </main>
    </div>
  );
}