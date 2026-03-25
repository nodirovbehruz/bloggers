'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import api from '../lib/api';
import { 
  FiHome, FiUsers, FiHeart, FiGrid, FiImage, FiCreditCard, 
  FiSettings, FiBarChart2, FiMenu, FiX, FiLogOut, FiUser, FiShield 
} from 'react-icons/fi';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <FiHome /> },
  { href: '/admin/bloggers', label: 'Блогеры', icon: <FiUsers /> },
  { href: '/admin/votes', label: 'Голоса', icon: <FiHeart /> },
  { href: '/admin/users', label: 'Пользователи', icon: <FiUser /> },
  { href: '/admin/categories', label: 'Категории', icon: <FiGrid /> },
  { href: '/admin/sponsors', label: 'Спонсоры', icon: <FiImage /> },
  { href: '/admin/payments', label: 'Платежи', icon: <FiCreditCard /> },
  { href: '/admin/settings', label: 'Настройки', icon: <FiSettings /> },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    verifyAdmin();
  }, []);

  const verifyAdmin = async () => {
    setCheckingAuth(true);
    setAuthError('');

    // Step 1: Quick check localStorage
    const isLoggedIn = api.isAdminLoggedIn();
    if (!isLoggedIn) {
      router.replace('/admin-login');
      return;
    }

    // Step 2: Verify token on server — REAL admin check
    try {
      const me = await api.getMe();
      if (!me || me.role !== 'admin') {
        // User is NOT admin — clear everything and redirect
        setAuthError('У вас нет прав администратора');
        api.adminLogout();
        setTimeout(() => router.replace('/admin-login'), 2000);
        return;
      }
      // Confirmed admin
      setIsAuthenticated(true);
      setAdminUser({ username: me.phone, role: me.role, id: me.id });
      setCheckingAuth(false);
    } catch (err) {
      // Token invalid or expired
      api.adminLogout();
      router.replace('/admin-login');
    }
  };

  const handleLogout = () => {
    api.adminLogout();
    router.replace('/admin-login');
  };

  // Show error if user is not admin
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center glass-dark rounded-2xl p-8 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <FiShield size={28} className="text-red-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Доступ запрещён</h2>
          <p className="text-red-400 text-sm mb-4">{authError}</p>
          <p className="text-gray-500 text-xs">Перенаправление на страницу входа...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking auth
  if (checkingAuth || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen -mt-16 pt-16">
      {/* Sidebar */}
      <aside className={`fixed sm:static z-40 inset-y-0 left-0 w-64 bg-surface-card border-r border-border transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
      }`}>
        <div className="flex flex-col h-full pt-20 sm:pt-4">
          {/* Admin title */}
          <div className="px-6 pb-4 border-b border-border">
            <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
              <FiBarChart2 className="text-primary" />
              Админ панель
            </h2>
            {adminUser && (
              <p className="text-text-muted text-xs mt-1 flex items-center gap-1">
                <FiShield size={10} className="text-primary" />
                {adminUser.username} • <span className="text-green-400">verified</span>
              </p>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'gradient-bg text-white shadow-lg shadow-primary/20'
                      : 'text-text-secondary hover:text-white hover:bg-surface-hover'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-muted hover:text-danger hover:bg-surface-hover transition-all w-full"
            >
              <FiLogOut />
              Выйти
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-6 right-6 z-50 sm:hidden w-14 h-14 gradient-bg rounded-full flex items-center justify-center shadow-lg shadow-primary/30"
        id="admin-sidebar-toggle"
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <main className="flex-1 sm:ml-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
