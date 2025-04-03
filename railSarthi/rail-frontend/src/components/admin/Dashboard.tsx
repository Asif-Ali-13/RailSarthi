import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";

type Stats = {
  trains: number;
  stations: number;
  tickets: number;
};

type Station = {
  id: number;
  name: string;
  city: string;
  state: string;
};

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

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    trains: 0,
    stations: 0,
    tickets: 0
  });
  const [stations, setStations] = useState<Station[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trainsResponse, stationsResponse] = await Promise.all([
          api.get("/api/v1/admin/trains"),
          api.get("/api/v1/admin/stations")
        ]);
        
        console.log("trainsResponse:", trainsResponse.data);
        console.log("stationsResponse:", stationsResponse.data);
        
        setStats({
          trains: trainsResponse.data.trains.length,
          stations: stationsResponse.data.stations.length,
          tickets: Math.floor(Math.random() * 100) // Mock data for now
        });
        setStations(stationsResponse.data.stations);
        setTrains(trainsResponse.data.trains);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-screen min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-black text-2xl font-bold">Dashboard</h2>
          <button
            onClick={() => navigate("/admin/dashboard/add-admin")}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add New Admin
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Trains Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Trains</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.trains}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Stations Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Stations</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.stations}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tickets</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.tickets}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stations Table */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Stations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stations.map((station) => (
                  <tr key={station.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{station.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{station.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{station.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trains Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Trains</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coaches</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trains.map((train) => (
                  <tr key={train.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{train.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${train.status === 'on_time' ? 'bg-green-100 text-green-800' : 
                          train.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {train.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{train.sourceStation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{train.destinationStation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{train.totalCoaches}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{train.totalSeats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 