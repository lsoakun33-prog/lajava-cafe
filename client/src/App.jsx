import React, { useState, useEffect } from 'react';
import CustomerView from './views/CustomerView';
import AdminView from './views/AdminView';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      return 'admin';
    }
    return 'customer';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('customer');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const switchToAdmin = () => {
    window.location.hash = '#admin';
    setCurrentView('admin');
  };

  const switchToCustomer = () => {
    window.location.hash = '';
    setCurrentView('customer');
  };

  if (currentView === 'admin') {
    return <AdminView onSwitchToCustomer={switchToCustomer} />;
  }

  return <CustomerView onSwitchToAdmin={switchToAdmin} />;
}
