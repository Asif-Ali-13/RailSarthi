import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";

type TrainRoute = {
  stopNo: number;
  stationName: string;
  city: string;
  arrival: string;
  departure: string;
};

type Train = {
  id: number;
  name: string;
  status: string;
  routes: TrainRoute[];
};

export function TrainList() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("HI from useEffect from trainList");
    const fetchTrains = async () => {
      try {
        const response = await api.get("/api/v1/user/trains");
        setTrains(response.data.trains);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching trains:", err);
        setError("Failed to load trains. Please try again later.");
        setLoading(false);
      }
    };

    fetchTrains();
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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-black text-2xl font-bold mb-6">Available Trains</h2>
        
        {trains.length === 0 ? (
          <p className="text-black">No trains available at the moment.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trains.map((train) => (
              <div 
                key={train.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl font-semibold text-black">{train.name}</h2>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      train.status === "On Time" 
                        ? "bg-green-100 text-green-800"
                        : train.status === "Delayed" 
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {train.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm text-black mb-1">Route:</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-black">{train.routes[0]?.stationName}</p>
                        <p className="text-xs text-black">{train.routes[0]?.city}</p>
                      </div>
                      <div className="text-black">→</div>
                      <div className="text-right">
                        <p className="font-medium text-black">{train.routes[train.routes.length - 1]?.stationName}</p>
                        <p className="text-xs text-black">{train.routes[train.routes.length - 1]?.city}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/trains/${train.id}`}
                    className="block w-full text-center  !text-white no-underline bg-blue-600 hover:bg-blue-700 font-medium py-2 px-4 rounded transition-colors duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 