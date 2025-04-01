import { Link, useLocation, useNavigate } from "react-router-dom";

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };
  
  return (
    <div className="bg-indigo-800 text-white w-64 h-screen flex flex-col">
      <div className="p-5 border-b border-indigo-700">
        <h2 className="text-xl font-bold">RailSarthi Admin</h2>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-3">
          <li>
            <Link 
              to="/admin/dashboard" 
              className={`flex items-center px-4 py-2 rounded-md ${
                isActive("/admin/dashboard") 
                  ? "bg-indigo-700" 
                  : "hover:bg-indigo-700"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/trains" 
              className={`flex items-center px-4 py-2 rounded-md ${
                isActive("/admin/trains") 
                  ? "bg-indigo-700" 
                  : "hover:bg-indigo-700"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
              Manage Trains
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/stations" 
              className={`flex items-center px-4 py-2 rounded-md ${
                isActive("/admin/stations") 
                  ? "bg-indigo-700" 
                  : "hover:bg-indigo-700"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Manage Stations
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/profile" 
              className={`flex items-center px-4 py-2 rounded-md ${
                isActive("/admin/profile") 
                  ? "bg-indigo-700" 
                  : "hover:bg-indigo-700"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Profile
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-indigo-700">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 2v10h10V5H4zm6 7.5a.5.5 0 01-1 0V7.7l-1.1.6a.5.5 0 01-.5-.9l2-1.2a.5.5 0 01.8.4v6z" clipRule="evenodd" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
} 