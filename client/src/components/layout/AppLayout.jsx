import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ApplicationModal from '../applications/ApplicationModal';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleApplicationSaved = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Container */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* Content View */}
        <main className="flex-1 lg:pl-64 min-h-[calc(100vh-4rem)] flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet context={{ refreshKey, openAddModal: handleOpenAddModal }} />
          </div>
        </main>
      </div>

      {/* Global Quick Add Application Modal */}
      <ApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={handleApplicationSaved}
      />
    </div>
  );
};

export default AppLayout;
