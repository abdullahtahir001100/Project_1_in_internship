import React from 'react';

const FullBodyLoader = ({ message = "Loading..." }) => {
  return (
    <div className="full-body-loader">
      <div className="loader-content">
        <div className="spinner"></div>
        <p className="loader-message">{message}</p>
      </div>
    </div>
  );
};

export default FullBodyLoader;