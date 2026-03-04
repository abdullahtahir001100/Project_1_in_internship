'use client'
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Listbox } from "@headlessui/react";
import AlertCard from './AlertCard.js';
import ToastDisplay from './alert.js';
import Loading from './loading.js';
export default function Posts() {

  const [data, setData] = useState([{id: 1, Post_name: "Software Engineer", department_name: "IT"}]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [postName, setPostName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const modalCheck = useRef(null);
  const formRef = useRef(null);

  // --- Modal Reset & Close ---
  const closeModal = () => {
    modalCheck.current.checked = false; // Checkbox uncheck (Modal hide)
    setEditId(null);
    setPostName('');
    setSelectedDept(null);
    if (formRef.current) formRef.current.reset(); // Native form reset
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const resPosts = await axios.get('http://localhost/react-backend/api/Posts/get');
      setData(resPosts.data);
      const resDepts = await axios.get('http://localhost/react-backend/api/Posts/get_department);
      setDepts(resDepts.data);
    } catch (err) { setToast({ show: true, type: 'error', message: 'Failed to load data.' }); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openModal = async (id = null) => {
    if (id) {
      setEditId(id);
      try {
        const res = await axios.get(`http://localhost/react-backend/api/Posts/get_data?id=${id}`);
        const postData = res.data[0];
        setPostName(postData?.Post_name ?? '');
        const matchedDept = depts.find(d => d.id == postData?.department_id);
        setSelectedDept(matchedDept || null);
      } catch (err) { setToast({ show: true, type: 'error', message: 'Failed to load post data.' }); }
    } else {
      setEditId(null);
      setPostName('');
      setSelectedDept(null);
    }
    modalCheck.current.checked = true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(formRef.current);
    if (selectedDept) fd.append('Department_id', selectedDept.id);
    if (editId) fd.append('id', editId);

    const url = editId ? "update" : "create";
    try {
      const res = await axios.post(`http://localhost/react-backend/api/Posts/${url}`, fd);
      closeModal(); // Success par modal reset aur close
      fetchAll();
      setToast({ show: true, type: 'success', message: res.data.message });
    } catch (err) { setToast({ show: true, type: 'error', message: 'Error saving data' }); }
  };

  const handleDelete = async () => {
    try {
      await axios.delete('http://localhost/react-backend/api/Posts/delete, { data: { id: targetId } });
      setShowDeleteModal(false);
      fetchAll();
    } catch (err) { setToast({ show: true, type: 'error', message: 'Delete failed' }); }
  };

  return (
    <div className="section-container">
      {loading && <Loading />}
      <div className="section-header">
        <div className="header-info">
          <h2 className="section-title">All Posts</h2>
        </div>

        <div className="modal-wrapper">
          <input type="checkbox" id="modal-toggle" ref={modalCheck} hidden />
          <button className="btn-add" onClick={() => openModal()}>Add New Post</button>

          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editId ? "Edit" : "Create"} Post</h3>
                {/* Cross Icon par onClick add kiya */}
                <span className="close-icon" onClick={closeModal} style={{ cursor: 'pointer' }}>×</span>
              </div>
              <form className="modal-form" ref={formRef} onSubmit={handleSave}>
                <div className="form-group">
                  <label>Desination Name</label>
                  <input
                    name='Post_name'
                    value={postName}
                    onChange={(e) => setPostName(e.target.value)}
                    type="text"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <Listbox value={selectedDept} onChange={setSelectedDept}>
                    <div className="custom-select-container">
                      <Listbox.Button className="select-trigger">
                        {selectedDept ? selectedDept.department_name : "Select Department"}
                      </Listbox.Button>
                      <Listbox.Options className="select-options">
                        {depts.map(dept => (
                          <Listbox.Option key={dept.id} value={dept} className="option-item">
                            {dept.department_name}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
                <div className="modal-footer">
                  {/* Cancel button par onClick add kiya */}
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn-save">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="simple-table">
          <thead>
            <tr>
              <th>ID</th><th>Desination Name</th><th>Department</th><th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map(item => (
              <tr key={item.id}>
                <td>#P-{item.id}</td>
                <td>{item.Post_name}</td>
                <td>{item.department_name || "N/A"}</td>
                <td className="text-right">
                  <div className="custom-dropdown">
                    <button className="drop-btn">Actions</button>
                    <div className="drop-content">
                      <button onClick={() => openModal(item.id)}>
                        Edit Detail
                      </button>
                      <button onClick={() => { setTargetId(item.id); setShowDeleteModal(true); }}>
                        Delete Detail
                      </button>

                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <AlertCard
          title="Delete Post?"
          message="Confirm delete department. This Task Not Be Undone"
          onCancel={() => setShowDeleteModal(false)}
          onContinue={handleDelete}
        />
      )}
      <ToastDisplay toast={toast} setToast={setToast} />
    </div>
  );
}