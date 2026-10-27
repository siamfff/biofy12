import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

export function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex bg-bg overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 animate-slide-up">
            <AdminSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}