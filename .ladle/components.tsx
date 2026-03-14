import React from 'react';
import type { GlobalProvider } from '@ladle/react';

// Wraps every story. Resets margin/padding so the graph can fill its container.
export const Provider: GlobalProvider = ({ children }) => (
  <div style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
    {children}
  </div>
);
