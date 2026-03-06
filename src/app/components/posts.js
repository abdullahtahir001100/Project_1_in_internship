'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../context/ApiProvider';
import { Listbox } from "@headlessui/react";
import AlertCard from './AlertCard.js';
import ToastDisplay from './alert.js';
import { TableSkeleton, LoadingButton } from './Skeleton';

export default function Posts() {
  const { axios } = useApi();

  const [data, setData] = useState([{id: 1, Post_name: "Software Engineer", department_name: "IT"}]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [postName, setPostName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const modalCheck = useRef(null);
  const formRef = useRef(null);

  // --- Modal Reset & Close ---
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setPostName('');
    setSelectedDept(null);
    if (formRef.current) formRef.current.reset(); // Native form reset
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const resPosts = await axios.get('/Posts/get');
      setData(resPosts.data);
      const resDepts = await axios.get('/Posts/get_department');
      setDepts(resDepts.data);
    } catch (err) { setToast({ show: true, type: 'error', message: 'Failed to load data.' }); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openModal = async (id = null) => {
    setShowModal(true);
    if (id) {
      setEditId(id);
      setEditLoading(true);
      try {
        const res = await axios.get(`/Posts/get_data?id=${id}`);
        const postData = res.data[0];
        setPostName(postData?.Post_name ?? '');
        const matchedDept = depts.find(d => d.id == postData?.department_id);
        setSelectedDept(matchedDept || null);
      } catch (err) { 
        setToast({ show: true, type: 'error', message: 'Failed to load post data.' }); 
        setShowModal(false);
      } finally {
        setEditLoading(false);
      }
    } else {
      setEditId(null);
      setPostName('');
      setSelectedDept(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(formRef.current);
    if (selectedDept) fd.append('Department_id', selectedDept.id);
    if (editId) fd.append('id', editId);

    const url = editId ? "update" : "create";
    try {
      const res = await axios.post(`/Posts/${url}`, fd);
      closeModal(); // Success par modal reset aur close
      fetchAll();
      setToast({ show: true, type: 'success', message: res.data.message });
    } catch (err) { setToast({ show: true, type: 'error', message: 'Error saving data' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete('/Posts/delete', { data: { id: targetId } });
      setShowDeleteModal(false);
      fetchAll();
    } catch (err) { setToast({ show: true, type: 'error', message: 'Delete failed' }); }
    finally { setDeleting(false); }
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <div className="header-info">
          <h2 className="section-title">All Posts</h2>
        </div>

        <div className="modal-wrapper">
          <input type="checkbox" id="modal-toggle" ref={modalCheck} hidden checked={showModal} onChange={() => {}} />
          <button className="btn-add" onClick={() => openModal()}>Add New Post</button>

          {showModal && (
            <div className="modal-overlay" style={{ display: 'flex' }}>
              <div className="modal-content">
                {editLoading ? (
                  <>
                    <div className="modal-header">
                      <div className="skeleton-box" style={{ width: '120px', height: '20px' }}></div>
                      <span className="close-icon" onClick={closeModal} style={{ cursor: 'pointer' }}>×</span>
                    </div>
                    <div className="modal-form" style={{ padding: '20px' }}>
                      <div className="skeleton-form-field" style={{ marginBottom: '16px' }}>
                        <div className="skeleton-box" style={{ width: '100px', height: '14px', marginBottom: '8px' }}></div>
                        <div className="skeleton-box" style={{ width: '100%', height: '38px' }}></div>
                      </div>
                      <div className="skeleton-form-field" style={{ marginBottom: '16px' }}>
                        <div className="skeleton-box" style={{ width: '80px', height: '14px', marginBottom: '8px' }}></div>
                        <div className="skeleton-box" style={{ width: '100%', height: '38px' }}></div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <div className="skeleton-box" style={{ width: '80px', height: '38px' }}></div>
                        <div className="skeleton-box" style={{ width: '80px', height: '38px' }}></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="modal-header">
                      <h3>{editId ? "Edit" : "Create"} Post</h3>
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
                        <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                        <LoadingButton type="submit" className="btn-save" loading={saving} loadingText="Saving...">
                          Save
                        </LoadingButton>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} columns={4} showHeader={false} />
      ) : (
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
      )}

      {showDeleteModal && (
        <AlertCard
          title="Delete Post?"
          message="Confirm delete department. This Task Not Be Undone"
          onCancel={() => setShowDeleteModal(false)}
          onContinue={handleDelete}
          loading={deleting}
        />
      )}
      <ToastDisplay toast={toast} setToast={setToast} />
    </div>
  );
}