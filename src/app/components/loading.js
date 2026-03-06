import React from 'react';
import { TableSkeleton, PageSkeleton } from './Skeleton';

// Original Full Body Loader (for overlay loading)
export const FullBodyLoader = ({ message = "Loading..." }) => {
  return (
    <div className="full-body-loader">
      <div className="loader-content">
        <div className="spinner"></div>
        <p className="loader-message">{message}</p>
      </div>
    </div>
  );
};

// New default export that supports both modes
const Loading = ({ 
  message = "Loading...", 
  type = 'spinner', // 'spinner' | 'table' | 'form' | 'page'
  rows = 5,
  columns = 4
}) => {
  if (type === 'spinner') {
    return <FullBodyLoader message={message} />;
  }
  
  if (type === 'table') {
    return <TableSkeleton rows={rows} columns={columns} showHeader={false} />;
  }
  
  if (type === 'page' || type === 'form') {
    return <PageSkeleton type={type === 'page' ? 'table' : 'form'} />;
  }

  return <FullBodyLoader message={message} />;
};

export default Loading;