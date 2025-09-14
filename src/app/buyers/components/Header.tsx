"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import '../../globals.css';

export default function Header() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (path:string) => {
    if (path === '/buyers') {
      return pathname === '/buyers';
    }
    return pathname === path;
  };

  return (
    <header className="w-full bg-white border-b border-blue-200 shadow-sm py-3 px-6">
      <div className="flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="text-xl font-bold text-blue-700 tracking-tight">
          Buyer Lead App
        </div>

        {/* Navigation Links - Center */}
        {user && (
          <nav className="flex items-center space-x-1 ml-45">
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

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
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
    </header>
  );
}