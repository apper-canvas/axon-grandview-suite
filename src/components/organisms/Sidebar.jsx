import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { AuthContext } from "@/App";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useContext(AuthContext);
  const user = useSelector((state) => state.user.user);
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Rooms", href: "/rooms", icon: "Bed" },
    { name: "Bookings", href: "/bookings", icon: "Calendar" },
    { name: "Payments", href: "/payments", icon: "CreditCard" },
    { name: "Housekeeping", href: "/housekeeping", icon: "Sparkles" },
    { name: "Maintenance", href: "/maintenance", icon: "Wrench" },
    { name: "Staff", href: "/staff", icon: "Users" },
    { name: "Reports", href: "/reports", icon: "BarChart3" }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Desktop Sidebar - Static positioning
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 shadow-sm">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-6 mb-8">
          <div className="h-10 w-10 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center">
            <ApperIcon name="Building2" className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold gradient-text">Grandview Suite</h1>
            <p className="text-sm text-secondary">Hotel Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary/10 to-blue-50 text-primary border-r-2 border-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <ApperIcon
                    name={item.icon}
                    className={cn(
                      "mr-3 h-5 w-5 transition-colors duration-200",
                      isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-500"
                    )}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="px-4 pb-4 border-t border-slate-200 pt-4">
          {user && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                  <ApperIcon name="User" className="h-4 w-4 text-white" />
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium text-slate-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{user.emailAddress}</p>
                </div>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-start text-slate-600 hover:text-slate-900 border-slate-200"
          >
            <ApperIcon name="LogOut" className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar - Overlay with transforms
  const MobileSidebar = () => (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "lg:hidden fixed inset-0 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-slate-600/75 backdrop-blur-sm" />
      </div>

      {/* Sidebar */}
      <div className={cn(
        "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Building2" className="h-5 w-5 text-white" />
              </div>
              <div className="ml-2">
                <h1 className="text-lg font-bold gradient-text">Grandview Suite</h1>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 transition-colors duration-200"
            >
              <ApperIcon name="X" className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-blue-50 text-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <ApperIcon
                      name={item.icon}
                      className={cn(
                        "mr-3 h-5 w-5 transition-colors duration-200",
                        isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-500"
                      )}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Mobile User Info & Logout */}
          <div className="px-4 pb-4 border-t border-slate-200 pt-4">
            {user && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                    <ApperIcon name="User" className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{user.emailAddress}</p>
                  </div>
                </div>
              </div>
            )}
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full justify-start text-slate-600 hover:text-slate-900 border-slate-200"
            >
              <ApperIcon name="LogOut" className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;
