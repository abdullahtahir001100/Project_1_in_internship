'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';


const ApiContext = createContext(null);

// Custom event emitter for triggering refetches
const eventListeners = new Map();

export function ApiProvider({ children }) {
  useEffect(() => {
    // Configure axios to use relative URLs (works with Vercel routing)
    axios.defaults.baseURL = '/api';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }, []);

  // Trigger refresh event for other components to react
  const triggerRefresh = useCallback((eventName, data = {}) => {
    const listeners = eventListeners.get(eventName) || [];
    listeners.forEach(callback => callback(data));
  }, []);

  // Subscribe to refresh events
  const subscribeToRefresh = useCallback((eventName, callback) => {
    if (!eventListeners.has(eventName)) {
      eventListeners.set(eventName, []);
    }
    eventListeners.get(eventName).push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = eventListeners.get(eventName) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const value = useMemo(() => ({ 
    axios, 
    triggerRefresh, 
    subscribeToRefresh 
  }), [triggerRefresh, subscribeToRefresh]);

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}

/**
 * Hook to listen for refresh events
 * @param {string} eventName - Event to listen for (e.g., 'employees-changed')
 * @param {function} callback - Function to call when event fires
 */
export function useRefreshTrigger(eventName, callback) {
  const { subscribeToRefresh } = useApi();

  useEffect(() => {
    const unsubscribe = subscribeToRefresh(eventName, callback);
    return unsubscribe;
  }, [eventName, callback, subscribeToRefresh]);
}

// Legacy socket hook - returns null since we're not using WebSockets on Vercel
export function useSocket() {
  return null;
}
