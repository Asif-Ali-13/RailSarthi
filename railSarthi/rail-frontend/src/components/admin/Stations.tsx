import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/axios";

type Station = {
  id: number;
  name: string;
  city: string;
  state: string;
};

export function Stations() {
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchStations = async () => {
    try {
      const response = await api.get("/api/v1/admin/stations");
      setStations(response.data.stations);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching stations:", err);
      setError("Failed to load stations. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this station?")) {
      return;
    }

    try {
      await api.delete(`/api/v1/admin/stations/${id}`);
      setSuccess("Station deleted successfully");
      fetchStations(); // Refresh the list
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete station");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = (id: number) => {
    console.log("hi from handleEdit")
    navigate(`/admin/dashboard/stations/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Manage Stations</h1>
        <Link 
          to="/admin/dashboard/stations/add"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Station
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Station Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  City
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  State
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stations.length > 0 ? (
                stations.map((station) => (
                  <tr key={station.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {station.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {station.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {station.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {station.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(station.id)}
                          className="text-indigo-400 hover:text-indigo-600"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(station.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-black">
                    No stations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 