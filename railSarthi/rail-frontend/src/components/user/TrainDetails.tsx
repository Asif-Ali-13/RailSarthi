import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/axios";

type TrainRoute = {
  stopNo: number;
  stationName: string;
  city: string;
  arrival: string;
  departure: string;
};

type Coach = {
  id: number;
  totalSeats: number;
  availableSeats: number;
  seats: Seat[];
};

type Seat = {
  id: number;
  seatNo: string;
  status: "available" | "booked" | "reserved";
  price: number;
};

type TrainDetails = {
  id: number;
  name: string;
  status: string;
  routes: TrainRoute[];
  coaches: Coach[];
};

export function TrainDetails() {
  const { trainId } = useParams<{ trainId: string }>();
  const [train, setTrain] = useState<TrainDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null);

  useEffect(() => {
    console.log("HI from useEffect from trainDetails");
    const fetchTrainDetails = async () => {
      try {
        const response = await api.get(`/api/v1/user/trains/${trainId}`);
        setTrain(response.data.train);
        if (response.data.train.coaches.length > 0) {
          setSelectedCoach(response.data.train.coaches[0].id);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching train details:", err);
        setError("Failed to load train details. Please try again later.");
        setLoading(false);
      }
    };

    fetchTrainDetails();
  }, [trainId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

  if (!train) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Not Found: </strong>
        <span className="block sm:inline">Train details could not be found.</span>
      </div>
    );
  }

  const selectedCoachData = train.coaches.find(coach => coach.id === selectedCoach);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/trains" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Trains
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-black">{train.name}</h1>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
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
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-black">Route and Schedule</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Stop
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Station
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      City
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Arrival
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Departure
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {train.routes.map((route) => (
                    <tr key={route.stopNo}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        {route.stopNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {route.stationName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {route.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {route.arrival}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {route.departure}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {train.coaches.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-black">Coaches & Seats</h2>
              
              <div className="mb-4">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {train.coaches.map((coach) => (
                    <button
                      key={coach.id}
                      onClick={() => setSelectedCoach(coach.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        selectedCoach === coach.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-black hover:bg-gray-200"
                      }`}
                    >
                      Coach {coach.id}
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white text-black">
                        {coach.availableSeats}/{coach.totalSeats}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedCoachData && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 py-3 px-4 border-b">
                    <h3 className="text-lg font-medium text-black">
                      Coach {selectedCoachData.id} - {selectedCoachData.availableSeats} seats available
                    </h3>
                  </div>
                  <div className="p-4 grid grid-cols-10 gap-2">
                    {selectedCoachData.seats.map((seat) => (
                      <div
                        key={seat.id}
                        className={`relative p-2 border rounded-md text-center ${
                          seat.status === "available"
                            ? "bg-green-50 border-green-200 cursor-pointer hover:bg-green-100"
                            : seat.status === "booked"
                            ? "bg-red-50 border-red-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="text-xs font-medium text-black">{seat.seatNo}</div>
                        <div className="text-xs text-black">₹{seat.price}</div>
                        {seat.status !== "available" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 rounded-md">
                            <span className="text-xs font-medium text-black">
                              {seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Link 
                  to={`/booking/${trainId}`}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition-colors duration-300"
                >
                  Book Tickets
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 