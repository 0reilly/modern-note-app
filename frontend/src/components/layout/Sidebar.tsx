import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { FileText, LayoutDashboard, Settings, Folder } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/app/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Notes',
      href: '/app/notes',
      icon: FileText,
    },
    {
      name: 'Categories',
      href: '/app/categories',
      icon: Folder,
    },
    {
      name: 'Settings',
      href: '/app/settings',
      icon: Settings,
    },
  ];

  if (!sidebarOpen) {
    return (
      <div className="w-16 bg-white border-r border-gray-200">
        <div className="flex flex-col items-center py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''} w-12 h-12 flex items-center justify-center`
              }
              title={item.name}
            >
              <item.icon className="h-5 w-5" />
            </NavLink>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <FileText className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">Modern Notes</span>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;