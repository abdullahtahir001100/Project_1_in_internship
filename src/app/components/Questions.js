'use client'
import React, { useState, useEffect } from 'react';
import QuestionForm from './QuestionForm';
import axios from 'axios';

export default function Questions() {
  const [view, setView] = useState('list'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchAll = async () => {
    setLoading(true);
    try {
      const resPosts = await axios.get('https://myproject2.xo.je/api/Posts/get');
      setData(resPosts.data);

    } catch (err) { /* silently fail */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);
  return (
    <div className="section-container">
      {view === 'list' ? (
        <>
          <div className="section-header">
            <div className="header-info">
              <h2 className="section-title">Evaluation Questions</h2>
              <p className="section-subtitle">Manage questions for department ratings</p>
            </div>
            <button className="btn-add" onClick={() => setView('add')}>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
              Create New Question
            </button>
          </div>

          <div className="table-responsive">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Department</th>
                  <th>Post</th>

                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id}>
                    <td>#P-{item.id}</td>
                    <td>{item.Post_name}</td>
                    <td>{item.department_name || "N/A"}</td>
                    <td className="text-right">
                      <div className="custom-dropdown">
                        <button className="drop-btn">Actions</button>
                        <div className="drop-content">
                          {/* <button onClick={() => openModal(item.id)}>
                            Edit Detail
                          </button>
                          <button onClick={() => { setTargetId(item.id); setShowDeleteModal(true); }}>
                            Delete Detail
                          </button> */}
                          <button onClick={() => setView('add')}>
                            Add Questions
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <QuestionForm onCancel={() => setView('list')} />
      )}
    </div>
  );
}