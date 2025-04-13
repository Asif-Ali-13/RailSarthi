import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/axios";

type Station = {
  id: number;
  name: string;
  city: string;
  state: string;
};

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
};

type Train = {
  id: number;
  name: string;
  status: string;
  sourceStationId: number;
  destinationStationId: number;
  totalCoaches: number;
  totalSeats: number;
  locoPilotId: number;
  routes: {
    stopNo: number;
    stationId: number;
    arrival: string;
    departure: string;
  }[];
};

export function EditTrain() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [locoPilots, setLocoPilots] = useState<Employee[]>([]);
  const [train, setTrain] = useState<Train | null>(null);
  const [formData, setFormData] = useState({
    trainName: "",
    sourceStationId: "",
    destStationId: "",
    noOfCoaches: "",
    noOfSeats: "",
    locoPilotId: "",
    status: "on_time"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trainResponse, stationsResponse, employeesResponse] = await Promise.all([
          api.get(`/api/v1/admin/trains/${id}`),
          api.get("/api/v1/admin/stations"),
          api.get("/api/v1/admin/employees")
        ]);

        const trainData = trainResponse.data.train;
        setTrain(trainData);
        setStations(stationsResponse.data.stations);
        setLocoPilots(employeesResponse.data.employees.filter((emp: Employee) => emp.role === "loco_pilot"));
        
        setFormData({
          trainName: trainData.name,
          sourceStationId: trainData.sourceStationId.toString(),
          destStationId: trainData.destinationStationId.toString(),
          noOfCoaches: trainData.totalCoaches.toString(),
          noOfSeats: trainData.totalSeats.toString(),
          locoPilotId: trainData.locoPilotId.toString(),
          status: trainData.status
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load train data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await api.put(`/api/v1/admin/trains/${id}`, {
        trainName: formData.trainName,
        sourceStationId: parseInt(formData.sourceStationId),
        destStationId: parseInt(formData.destStationId),
        noOfCoaches: parseInt(formData.noOfCoaches),
        noOfSeats: parseInt(formData.noOfSeats),
        locoPilotId: parseInt(formData.locoPilotId),
        status: formData.status
      });

      setSuccess("Train updated successfully");
      setTimeout(() => navigate("/admin/dashboard/trains"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update train");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!train) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">Train not found</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-black mb-6">Edit Train</h1>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="trainName" className="block text-sm font-medium text-black">
            Train Name
          </label>
          <input
            type="text"
            id="trainName"
            name="trainName"
            value={formData.trainName}
            onChange={handleChange}
            required
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="sourceStationId" className="block text-sm font-medium text-black">
            Source Station
          </label>
          <select
            id="sourceStationId"
            name="sourceStationId"
            value={formData.sourceStationId}
            onChange={handleChange}
            required
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select source station</option>
            {stations.map(station => (
              <option key={station.id} value={station.id}>
                {station.name} ({station.city}, {station.state})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="destStationId" className="block text-sm font-medium text-black">
            Destination Station
          </label>
          <select
            id="destStationId"
            name="destStationId"
            value={formData.destStationId}
            onChange={handleChange}
            required
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select destination station</option>
            {stations.map(station => (
              <option key={station.id} value={station.id}>
                {station.name} ({station.city}, {station.state})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="noOfCoaches" className="block text-sm font-medium text-black">
            Total Coaches
          </label>
          <input
            type="number"
            id="noOfCoaches"
            name="noOfCoaches"
            value={formData.noOfCoaches}
            onChange={handleChange}
            required
            min="1"
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="noOfSeats" className="block text-sm font-medium text-black">
            Total Seats
          </label>
          <input
            type="number"
            id="noOfSeats"
            name="noOfSeats"
            value={formData.noOfSeats}
            onChange={handleChange}
            required
            min="1"
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="locoPilotId" className="block text-sm font-medium text-black">
            Loco Pilot
          </label>
          <select
            id="locoPilotId"
            name="locoPilotId"
            value={formData.locoPilotId}
            onChange={handleChange}
            required
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select loco pilot</option>
            {locoPilots.map(pilot => (
              <option key={pilot.id} value={pilot.id} className="text-black">
                {pilot.firstName} {pilot.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-black">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="on_time">On Time</option>
            <option value="late">Late</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard/trains")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Train
          </button>
        </div>
      </form>
    </div>
  );
} 