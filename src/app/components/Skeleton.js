'use client';
import React from 'react';

// Base Skeleton element with pulse animation
export function SkeletonBox({ width = '100%', height = '16px', radius = '4px', className = '' }) {
  return (
    <div
      className={`skeleton-box ${className}`}
      style={{ width, height, borderRadius: radius }}
    />
  );
}

// Table Header Skeleton
export function TableHeaderSkeleton({ columns = 4 }) {
  return (
    <div className="skeleton-table-header">
      <SkeletonBox width="150px" height="24px" />
      <SkeletonBox width="120px" height="36px" radius="6px" />
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }) {
  return (
    <tr className="skeleton-row">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <SkeletonBox 
            width={i === columns - 1 ? '80px' : `${60 + Math.random() * 40}%`} 
            height="16px" 
          />
        </td>
      ))}
    </tr>
  );
}

// Full Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4, showHeader = true }) {
  return (
    <div className="skeleton-table-wrapper">
      {showHeader && <TableHeaderSkeleton columns={columns} />}
      <div className="table-responsive">
        <table className="simple-table skeleton-table">
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i}>
                  <SkeletonBox width={`${50 + Math.random() * 30}%`} height="14px" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Form Field Skeleton
export function FormFieldSkeleton({ labelWidth = '80px' }) {
  return (
    <div className="skeleton-form-field">
      <SkeletonBox width={labelWidth} height="14px" />
      <SkeletonBox width="100%" height="38px" radius="6px" />
    </div>
  );
}

// Card Skeleton
export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="skeleton-card">
      <SkeletonBox width="60%" height="20px" className="skeleton-card-title" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox 
          key={i} 
          width={`${70 + Math.random() * 30}%`} 
          height="14px" 
          className="skeleton-card-line"
        />
      ))}
    </div>
  );
}

// Button Skeleton
export function ButtonSkeleton({ width = '120px', height = '36px' }) {
  return <SkeletonBox width={width} height={height} radius="6px" className="skeleton-btn" />;
}

// Section Header Skeleton (title + button)
export function SectionHeaderSkeleton() {
  return (
    <div className="section-header skeleton-section-header">
      <div className="header-info">
        <SkeletonBox width="200px" height="28px" />
        <SkeletonBox width="280px" height="14px" className="skeleton-subtitle" />
      </div>
      <ButtonSkeleton width="140px" height="38px" />
    </div>
  );
}

// Loading Button Component (for btn clicks)
export function LoadingButton({ 
  loading, 
  children, 
  loadingText = 'Loading...', 
  className = '', 
  ...props 
}) {
  return (
    <button className={`${className} ${loading ? 'btn-loading' : ''}`} disabled={loading} {...props}>
      {loading ? (
        <span className="btn-loading-content">
          <span className="btn-spinner"></span>
          {loadingText}
        </span>
      ) : children}
    </button>
  );
}

// Full Page Skeleton for initial component load
export function PageSkeleton({ type = 'table' }) {
  if (type === 'table') {
    return (
      <div className="section-container">
        <SectionHeaderSkeleton />
        <TableSkeleton rows={6} columns={4} showHeader={false} />
      </div>
    );
  }
  
  if (type === 'form') {
    return (
      <div className="section-container">
        <SectionHeaderSkeleton />
        <div className="skeleton-form-container">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <div className="skeleton-form-actions">
            <ButtonSkeleton width="100px" />
            <ButtonSkeleton width="100px" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default {
  SkeletonBox,
  TableSkeleton,
  TableRowSkeleton,
  FormFieldSkeleton,
  CardSkeleton,
  ButtonSkeleton,
  SectionHeaderSkeleton,
  LoadingButton,
  PageSkeleton
};
