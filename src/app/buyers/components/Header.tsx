"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import '../../globals.css';
import { useState } from 'react';

export default function Header() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log('User in Header:', user);

  const toggleSidebar = () => {
    console.log('Toggling sidebar');
    setSidebarOpen(!sidebarOpen);
  };
  const closeSidebar = () => {
    console.log('Closing sidebar');
    setSidebarOpen(false);
  };

  const isActive = (path:string) => {
    if (path === '/buyers') {
      return pathname === '/buyers';
    }
    return pathname === path;
  };

  return (
    <header className="w-full bg-white border-b border-blue-200 shadow-sm py-3 px-6">
      <div className="flex items-center justify-between">
        {/* App Name - always visible */}
        <div className="text-xl font-bold text-blue-700 tracking-tight">
          eSahayak Lead App
        </div>

        {/* Hamburger for small screens */}
        {user && (
          <button
            className="text-blue-700 text-2xl p-2 bg-blue-50 rounded border"
            onClick={toggleSidebar}
            aria-label="Open menu"
          >
            Menu
          </button>
        )}

        {/* Navigation Links - hidden on small, visible on sm+ */}
        {user && (
          <nav className="hidden sm:flex items-center space-x-1 ml-45">
            <Link
              href="/buyers"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/buyers')
                  ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              All Leads
            </Link>
            <Link
              href="/buyers/new"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/buyers/new')
                  ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              Add Leads
            </Link>
          </nav>
        )}

        {/* User Info & Actions - hidden on small, visible on sm+ */}
        <div className="hidden sm:flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-900 font-medium text-sm">
                  {user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-gray-500 text-sm">Not logged in</span>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar for small screens */}
      {sidebarOpen && user && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeSidebar}
          ></div>
          {/* Sidebar */}
          <div className="fixed top-0 right-0 w-64 bg-white shadow-lg h-full z-60">
            {/* Close button */}
            <button
              onClick={closeSidebar}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-xl"
              aria-label="Close menu"
            >
              ×
            </button>
            {/* Content */}
            <div className="p-4 pt-12">
              {/* User email */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-900 font-medium text-sm">
                    {user.email}
                  </span>
                </div>
              </div>
              {/* Nav links */}
              <nav className="flex flex-col space-y-4 mb-6">
                <Link
                  href="/buyers"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive('/buyers')
                      ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={closeSidebar}
                >
                  All Leads
                </Link>
                <Link
                  href="/buyers/new"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive('/buyers/new')
                      ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={closeSidebar}
                >
                  Add Leads
                </Link>
              </nav>
              {/* Logout */}
              <button
                onClick={() => {
                  signOut();
                  closeSidebar();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}