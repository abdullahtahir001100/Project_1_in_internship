import React from 'react';

const MinimalAlert = ({ title, message, onCancel, onContinue }) => {
    return (
        <>
        <div className="overlay"></div>
            <div className="alert-box">
                <div className="alert-inner">
                    <div className="alert-layout">
                        <div className="alert-icon-box">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                            </svg>
                        </div>

                        <div className="alert-content">
                            <h2 className="alert-head">{title || "Notification"}</h2>
                            <p className="alert-desc">
                                {message || "The requested action has been processed. Please confirm to proceed further."}
                            </p>
                        </div>
                    </div>

                    <div className="alert-bar">
                        <button className="btn-flat-light" onClick={onCancel}>
                            Cancel
                        </button>
                        <button className="btn-flat-dark" onClick={onContinue}>
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MinimalAlert;