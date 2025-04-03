import { useState, useEffect } from "react";
import api from "../../lib/axios";
import { useNavigate } from "react-router-dom";

interface Ticket {
  pnr: number;
  passenger: {
    name: string;
    age: number;
    gender: string;
  };
  journey: {
    train: string;
    from: string;
    to: string;
    date: string;
  };
  payment: {
    amount: number;
    status: string;
  };
}

export function MyBookings() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("HI from useEffect");
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      console.log("HI from fetchTickets above");
      const response = await api.get("/api/v1/user/tickets");
      console.log("HI from fetchTickets below");
      setTickets(response.data.tickets);
      console.log(response.data.tickets);
      setLoading(false);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to fetch tickets");
      }
      setLoading(false);
    }
  };

  const handleCancelTicket = async (pnr: number) => {
    if (!window.confirm("Are you sure you want to cancel this ticket?")) {
      return;
    }

    try {
      await api.delete(`/api/v1/user/tickets/${pnr}`);
      setSuccess("Ticket cancelled successfully");
      fetchTickets(); // Refresh the tickets list
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to cancel ticket");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-screen min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-black text-2xl font-bold mb-6">My Bookings</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No bookings found</p>
            <button
              onClick={() => navigate("/trains")}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Book a Ticket
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.pnr}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ticket.journey.train}
                      </h3>
                      <p className="text-sm text-gray-500">PNR: {ticket.pnr}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        ticket.payment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : ticket.payment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ticket.payment.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">From</span>
                      <span className="text-sm font-medium text-gray-900">
                        {ticket.journey.from}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">To</span>
                      <span className="text-sm font-medium text-gray-900">
                        {ticket.journey.to}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(ticket.journey.date)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Passenger</span>
                      <span className="text-sm font-medium text-gray-900">
                        {ticket.passenger.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Amount</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{ticket.payment.amount}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => handleCancelTicket(ticket.pnr)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel Ticket
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 