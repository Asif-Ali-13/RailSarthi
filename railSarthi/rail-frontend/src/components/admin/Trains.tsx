import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/axios";

type Train = {
  id: number;
  name: string;
  status: string;
  sourceStation: string;
  destinationStation: string;
  totalCoaches: number;
  totalSeats: number;
  routes: {
    stopNo: number;
    stationName: string;
    city: string;
    arrival: string;
    departure: string;
  }[];
};

export function Trains() {
  const navigate = useNavigate();
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    try {
      const response = await api.get("/api/v1/admin/trains");
      setTrains(response.data.trains);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching trains:", err);
      setError("Failed to load trains. Please try again later.");
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.delete(`/api/v1/admin/trains/${id}`);
      if (response.status === 200) {
        setSuccess("Train deleted successfully");
        // Refresh the trains list
        fetchTrains();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete train");
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold text-black">Manage Trains</h1>
        <Link 
          to="/admin/dashboard/trains/add"
          className="bg-indigo-600 hover:bg-indigo-700 !text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Train
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
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-fit">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Train Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Source
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Destination
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Coaches
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Seats
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trains.length > 0 ? (
                trains.map((train) => (
                  <tr key={train.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {train.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {train.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {train.sourceStation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {train.destinationStation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {train.totalCoaches}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {train.totalSeats}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        train.status === "on_time" 
                          ? "bg-green-100 text-green-800" 
                          : train.status === "late" 
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {train.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => navigate(`/admin/dashboard/trains/${train.id}/edit`)}
                          className="text-white hover:text-indigo-400"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(train.id)}
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
                  <td colSpan={8} className="px-6 py-4 text-center text-black">
                    No trains found
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