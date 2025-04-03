import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/axios";

type Gender = "male" | "female" | "other";
type Role = "manager" | "station_manager" | "booking_clerk" | "loco_pilot";

export function EditEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "booking_clerk" as Role,
    city: "",
    state: "",
    age: "",
    gender: "male" as Gender
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await api.get(`/api/v1/admin/employees/${id}`);
        const employee = response.data.employee;
        setFormData({
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          role: employee.role,
          city: employee.city,
          state: employee.state,
          age: employee.age.toString(),
          gender: employee.gender
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch employee details");
      }
    };

    fetchEmployee();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await api.put(`/api/v1/admin/employees/${id}`, {
        ...formData,
        age: parseInt(formData.age)
      });
      setSuccess("Employee updated successfully");
      setTimeout(() => navigate("/admin/dashboard/employees"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update employee");
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
      <h1 className="text-2xl font-bold text-black mb-6">Edit Employee</h1>

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
          <label htmlFor="firstName" className="block text-sm font-medium text-black">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={30}
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-black">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={30}
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-black">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={100}
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-black">
            Age
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            min="18"
            max="120"
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-black">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-black">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="manager">Manager</option>
            <option value="station_manager">Station Manager</option>
            <option value="booking_clerk">Booking Clerk</option>
            <option value="loco_pilot">Loco Pilot</option>
          </select>
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-black">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={50}
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-black">
            State
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={50}
            className="text-gray-900 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard/employees")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Employee"}
          </button>
        </div>
      </form>
    </div>
  );
} 