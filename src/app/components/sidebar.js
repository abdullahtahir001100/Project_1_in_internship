import React from 'react';
import Department from "./departments.js";
import Posts from "./posts.js";
import Employees from "./Employees.js";
import Question from './Questions.js';
import Header from './header.js';
export default function Sidebar() {
  return (

    <div className="dashboard-wrapper">
      <Header/>
      {/* Hidden inputs for Tab Logic (No JS) */}
      <input type="radio" name="nav-tab" id="tab-acr" defaultChecked hidden />
      <input type="radio" name="nav-tab" id="tab-employees" hidden />
      <input type="radio" name="nav-tab" id="tab-departments" hidden />
      <input type="radio" name="nav-tab" id="tab-posts" hidden />
      <input type="radio" name="nav-tab" id="tab-questions" hidden />
      <input type="radio" name="nav-tab" id="tab-rating" hidden />

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
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                <span className="nav-text">+ ACR</span>
              </label>
            </li>
            <li className="nav-item">
              <label htmlFor="tab-employees" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span className="nav-text">Employees</span>
              </label>
            </li>
            <li className="nav-item">
              <label htmlFor="tab-departments" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 12h18"/></svg>
                <span className="nav-text">Departments</span>
              </label>
            </li>
            <li className="nav-item">
              <label htmlFor="tab-posts" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12.01" y2="15"/></svg>
                <span className="nav-text">All Posts</span>
              </label>
            </li>
            <li className="nav-item">
              <label htmlFor="tab-questions" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span className="nav-text">Adjust Questions</span>
              </label>
            </li>
            <li className="nav-item">
              <label htmlFor="tab-rating" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span className="nav-text">View Rating</span>
              </label>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Content Views */}
      <main className="content-area acr-view"><h1>Create New ACR</h1></main>
      <main className="content-area employees-view"><Employees /></main>
      <main className="content-area departments-view"><Department /></main>
      <main className="content-area posts-view"><h1><Posts/></h1></main>
      <main className="content-area questions-view"><Question /></main>
      <main className="content-area rating-view"><h1>Performance Ratings</h1></main>
    </div>
  );
}