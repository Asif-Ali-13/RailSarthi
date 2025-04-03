import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export function AddTrain() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [locoPilots, setLocoPilots] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    trainName: "",
    sourceStationId: "",
    destStationId: "",
    noOfCoaches: "",
    noOfSeats: "",
    locoPilotId: "",
    status: "on_time" as "on_time" | "late" | "cancelled"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsResponse, employeesResponse] = await Promise.all([
          api.get("/api/v1/admin/stations"),
          api.get("/api/v1/admin/employees")
        ]);

        setStations(stationsResponse.data.stations);
        // Filter only loco pilots
        setLocoPilots(employeesResponse.data.employees.filter((emp: Employee) => emp.role === "loco_pilot"));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load stations and employees");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Validate form data
      if (!formData.trainName || !formData.sourceStationId || !formData.destStationId || 
          !formData.noOfCoaches || !formData.noOfSeats || !formData.locoPilotId) {
        throw new Error("All fields are required");
      }

      // Validate source and destination stations are different
      if (formData.sourceStationId === formData.destStationId) {
        throw new Error("Source and destination stations must be different");
      }

      // Parse numeric values
      const parsedData = {
        ...formData,
        sourceStationId: parseInt(formData.sourceStationId),
        destStationId: parseInt(formData.destStationId),
        noOfCoaches: parseInt(formData.noOfCoaches),
        noOfSeats: parseInt(formData.noOfSeats),
        locoPilotId: parseInt(formData.locoPilotId)
      };

      // Validate numeric values
      if (isNaN(parsedData.sourceStationId) || isNaN(parsedData.destStationId) || 
          isNaN(parsedData.noOfCoaches) || isNaN(parsedData.noOfSeats) || 
          isNaN(parsedData.locoPilotId)) {
        throw new Error("Invalid numeric values");
      }

      // Validate minimum values
      if (parsedData.noOfCoaches < 1 || parsedData.noOfSeats < 1) {
        throw new Error("Number of coaches and seats must be at least 1");
      }

      const response = await api.post("/api/v1/admin/trains", parsedData);
      
      if (response.data && response.data.train) {
        setSuccess("Train added successfully");
        setTimeout(() => navigate("/admin/dashboard/trains"), 2000);
      } else {
        throw new Error("Failed to add train: Invalid response from server");
      }
    } catch (err: any) {
      console.error("Error adding train:", err);
      setError(err.response?.data?.message || err.message || "Failed to add train");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-black mb-6">Add New Train</h1>

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
            minLength={3}
            maxLength={50}
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
            <option value="">Select Source Station</option>
            {stations.map((station) => (
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
            <option value="">Select Destination Station</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name} ({station.city}, {station.state})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="noOfCoaches" className="block text-sm font-medium text-black">
            Number of Coaches
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
            Number of Seats
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
            <option value="">Select Loco Pilot</option>
            {locoPilots.map((pilot) => (
              <option key={pilot.id} value={pilot.id}>
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
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Train"}
          </button>
        </div>
      </form>
    </div>
  );
} 