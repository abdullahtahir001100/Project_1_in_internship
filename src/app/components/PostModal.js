'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Listbox } from "@headlessui/react";
import ToastDisplay from './alert.js';
import Loading from './loading.js';
export default function PostModal() {



  const [data, setdata] = useState([]);
  const [loading, setloading] = useState(false)
  const [selected, setSelected] = useState(null);
  const form = useRef(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    async function get_all_departments() {
      try {
        setloading(true);
        const request = await fetch('/api/api/Posts/get_department')
        const responce = await request.json();
        setdata(responce);
      } catch (error) {
        setToast({ show: true, type: 'error', message: 'Failed to load departments.' });
      }
      finally {
        setloading(false);
      }

    }
    get_all_departments();
  }, []);
  const add_posts = async (e) => {
    e.preventDefault();
    const formData = new FormData(form.current);
    try {
      setloading(true);
      const insert = await fetch('/api/api/Posts/create', {
        method: 'POST',
        body: formData,
      })
      const responce_of = await insert.json()
      setToast({ show: true, type: 'success', message: responce_of?.message || 'Post created!' });
    } catch (error) {
      setToast({ show: true, type: 'error', message: error?.message || 'Error creating post' });
    }
   finally {
  setloading(false);
}

  }
  return (
    <div className="post-modal-wrapper">
      {loading && <Loading />}
      {/* UNIQUE ID FOR POSTS */}
      <input type="checkbox" id="post-modal-toggle" className="post-toggle-check" hidden />

      <label htmlFor="post-modal-toggle" className="btn-add">
        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" /><path d="M12 5v14" />
        </svg>
        Add New Post
      </label>

      <div className="post-modal-overlay">
        <div className="post-modal-content">
          <div className="post-modal-header">
            <h3 className="post-modal-title">Create New Post</h3>
            <label htmlFor="post-modal-toggle" className="post-close-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </label>
          </div>

          <form className="post-modal-form" ref={form} onSubmit={add_posts}>
            <div className="post-form-group">
              <label>Post Name</label>
              <input type="text" name='Post_name' placeholder="e.g. Senior Web Developer" />
            </div>

            <div className="post-form-group">
              <label>Department</label>
              <Listbox value={selected} onChange={setSelected}>
                <div className="custom-select-container">

                  <input type="hidden" name="Department_id" value={selected ? selected.id : ""} />


                  <Listbox.Button className="select-trigger">
                    <span className="selected-value">{selected ? selected.department_name : "Select a Department"}</span>

                    <svg className="chevron-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.75 9.25a.75.75 0 111.1 1.02L10 15.148l2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5z" clipRule="evenodd" />
                    </svg>
                  </Listbox.Button>

                  <Listbox.Options className="select-options">
                    {data.map((opt) => (
                      <Listbox.Option
                        key={opt.id}
                        value={opt}
                        className={({ active }) => `option-item ${active ? 'active' : ''}`}
                      >
                        {opt.department_name}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>


            </div>

            <div className="post-modal-footer">
              <label htmlFor="post-modal-toggle" className="btn-cancel">Cancel</label>
              <button type="submit" className="btn-save">Add Post</button>
            </div>
          </form>
        </div>
      </div>
      <ToastDisplay toast={toast} setToast={setToast} />
    </div>
  );
}