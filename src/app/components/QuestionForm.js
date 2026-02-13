'use client'

import React, { useState, useEffect, use } from 'react';
import { Listbox } from "@headlessui/react";
import axios from 'axios';
import ToastDisplay from './alert.js';

export default function QuestionForm({ onCancel }) {

 

  const [questions, setQuestions] = useState([
    { id: 1, text: '', rating: 10, subQuestions: [] }
  ]);

  const addMainQuestion = () => {
    setQuestions([
      ...questions,
      { id: questions.length + 1, text: '', rating: 10, subQuestions: [] }
    ]);
  };

  const addSubQuestion = (parentId) => {
    setQuestions(
      questions.map(q =>
        q.id === parentId
          ? {
              ...q,
              subQuestions: [
                ...q.subQuestions,
                {
                  id: q.subQuestions.length + 1,
                  text: '',
                  rating: 10
                }
              ]
            }
          : q
      )
    );
  };

  const updateQuestion = (parentId, field, value, subId = null) => {
    setQuestions(
      questions.map(q => {
        if (q.id !== parentId) return q;

        if (subId !== null) {
          return {
            ...q,
            subQuestions: q.subQuestions.map(sub =>
              sub.id === subId ? { ...sub, [field]: value } : sub
            )
          };
        }

        return { ...q, [field]: value };
      })
    );
  };

  const removeMain = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const removeSub = (parentId, subId) => {
    setQuestions(
      questions.map(q =>
        q.id === parentId
          ? {
              ...q,
              subQuestions: q.subQuestions.filter(sub => sub.id !== subId)
            }
          : q
      )
    );
  };

  /* =============================
     DEPARTMENTS & POSTS
  ==============================*/

  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          'http://localhost/react-backend/api/Employees/get_info.php'
        );
        setDepartments(res.data);
      } catch (error) {
        setToast({ show: true, type: 'error', message: 'Failed to load departments.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

 // fetch posts when dept selected

  async function fetch_the_exitting_post() {
   try {
    setLoading(true);
    const res = await axios.get(`http://localhost/react-backend/api/questions/get.php?department_id=${selectedDept ? selectedDept?.department_id : ""}`);
     setData(res?.data[0]?.posts.filter((post) => post.post_id == (selectedPost ? selectedPost.id : null))[0]?.questions || []);
   const post = res?.data?.[0]?.posts?.find(
  post => Number(post.post_id) === Number(selectedPost?.id)
);

if (post?.questions?.length) {

  const formattedQuestions = post.questions.map((q,index) => ({
    id: index + 1,
    text: q.question_name,
    rating: Number(q.question_rating),
    subQuestions: q.child_questions?.map((sub,index) => ({
      id: index + 1,
      text: sub?.child_question_name,
      rating: Number(sub.child_rating)
    })) || []
  }));

  setQuestions(formattedQuestions);


} else {
  setQuestions([
    { id: 1, text: '', rating: 10, subQuestions: [] }
  ]);
}

    
    
   } catch (error) {
    setToast({ show: true, type: 'error', message: error?.message || 'Error loading questions' });
   }
   finally {    setLoading(false);
   
   }
  }
   useEffect(() => {
   selectedPost && fetch_the_exitting_post();

  }
  , [selectedPost]);
    

  


  /* =============================
     SUBMIT
  ==============================*/
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedDept || !selectedPost) {
    setToast({ show: true, type: 'warning', message: 'Please select department and designation' });
    return;
  }

  const payload = {
    department_id: selectedDept.department_id,
    post_id: selectedPost.id,
    questions: questions,
    is_update: data.length > 0 ? 1 : 0
  };

  try {
    const res = await axios.post(
      'http://localhost/react-backend/api/questions/create.php',
      payload,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (res.data.success) {
      setToast({ show: true, type: 'success', message: 'Questions saved successfully!' });
    } else {
      setToast({ show: true, type: 'error', message: 'Error: ' + res.data.error });
    }

  } catch (error) {
    setToast({ show: true, type: 'error', message: 'Something went wrong while saving!' });
  }
};


  /* =============================
     UI
  ==============================*/

  return (
    <div className="question-form-wrapper">

      <div className="qf-header">
        <div>
          <h2 className="qf-title">Evaluation Questions</h2>
          <p className="qf-subtitle">
            Create questions for performance evaluation
          </p>
        </div>
        <button className="btn-back" onClick={onCancel}>← Back</button>
      </div>

      {/* Filters */}
      <div className="qf-filters">

        {/* Department */}
        <div className="qf-filter-group">
          <label>Department</label>
          <Listbox value={selectedDept} onChange={setSelectedDept}>
            <div className="custom-select-container">

              <Listbox.Button className="select-trigger">
                <span>
                  {selectedDept
                    ? selectedDept.department_name
                    : "Select"}
                </span>
              </Listbox.Button>

              {departments.length !== 0 ? (
                <Listbox.Options className="select-options">
                  {departments.map(dep => (
                    <Listbox.Option
                      key={dep.department_id}
                      value={dep}
                      className={({ active }) =>
                        `option-item ${active ? 'active' : ''}`
                      }
                    >
                      {dep.department_name}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              ) : (
                <div className="No_available">
                  No departments available
                </div>
              )}

            </div>
          </Listbox>
        </div>

        {/* Designation */}
        <div className="qf-filter-group">
          <label>Designation</label>
          <Listbox value={selectedPost} onChange={setSelectedPost}>
            <div className="custom-select-container">

              <Listbox.Button className="select-trigger">
                <span>
                  {selectedPost
                    ? selectedPost.Post_name
                    : "Select"}
                </span>
              </Listbox.Button>

              {selectedDept?.posts?.length ? (
                <Listbox.Options className="select-options">
                  {selectedDept.posts.map(post => (
                    <Listbox.Option
                      key={post.id}
                      value={post}
                      className={({ active }) =>
                        `option-item ${active ? 'active' : ''}`
                      }
                    >
                      {post.Post_name}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              ) : (
                <div className="No_available">
                  No designations available
                </div>
              )}

            </div>
          </Listbox>
        </div>

      </div>

      {/* Questions Table */}
      <div className="qf-questions-area">
        <table className="qf-table">

          <thead>
            <tr>
              <th style={{ width: '60px' }}>#</th>
              <th>Question</th>
              <th style={{ width: '100px' }}>Rating</th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {questions.map(q => (
              <React.Fragment key={q.id}>

                <tr className="qf-main-row">
                  <td className="qf-num">{q.id}</td>

                  <td>
                    <input
                      type="text"
                      className="qf-input"
                      placeholder="Enter question..."
                      value={q.text}
                      onChange={e =>
                        updateQuestion(q.id, 'text', e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      className="qf-input qf-rating"
                      value={q.rating}
                      onChange={e =>
                        updateQuestion(q.id, 'rating', e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <div className="qf-actions">
                      <button
                        className="qf-btn-sub"
                        onClick={() => addSubQuestion(q.id)}
                      >
                        + Sub
                      </button>

                      <button
                        className="qf-btn-del"
                        onClick={() => removeMain(q.id)}
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>

                {q.subQuestions.map(sub => (
                  <tr key={sub.id} className="qf-sub-row">

                    <td className="qf-num qf-sub-num">
                      {q.id}.{sub.id}
                    </td>

                    <td>
                      <input
                        type="text"
                        className="qf-input"
                        placeholder="Sub-question..."
                        value={sub.text}
                        onChange={e =>
                          updateQuestion(
                            q.id,
                            'text',
                            e.target.value,
                            sub.id
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        className="qf-input qf-rating"
                        value={sub.rating}
                        onChange={e =>
                          updateQuestion(
                            q.id,
                            'rating',
                            e.target.value,
                            sub.id
                          )
                        }
                      />
                    </td>

                    <td>
                      <button
                        className="qf-btn-del"
                        onClick={() => removeSub(q.id, sub.id)}
                      >
                        ×
                      </button>
                    </td>

                  </tr>
                ))}

              </React.Fragment>
            ))}
          </tbody>

        </table>

        <button
          className="qf-add-btn"
          onClick={addMainQuestion}
        >
          + Add Question
        </button>
      </div>

      <div className="qf-footer">
        <button className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>

        <button className="btn-save" onClick={handleSubmit}>
          Save
        </button>
      </div>

      <ToastDisplay toast={toast} setToast={setToast} />
    </div>
  );
}
