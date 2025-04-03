import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  seatType: string;
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

type Trip = {
  id: number;
  from: {
    stationId: number;
    stationName: string;
    city: string;
  };
  to: {
    stationId: number;
    stationName: string;
    city: string;
  };
  distance: number;
  price: number;
};

type PassengerDetails = {
  name: string;
  age: string;
  gender: "male" | "female" | "other";
};

export function BookingPage() {
  const { trainId } = useParams<{ trainId: string }>();
  const navigate = useNavigate();
  
  const [train, setTrain] = useState<TrainDetails | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  
  // Form states
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetails>({
    name: "",
    age: "",
    gender: "male"
  });
  
  // Generate trips from the train routes
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);

  useEffect(() => {
    console.log("HI from useEffect from bookingPage");
    const fetchTrainDetails = async () => {
      try {
        const response = await api.get(`/api/v1/user/trains/${trainId}`);
        setTrain(response.data.train);
        
        // Create trip options from routes
        if (response.data.train.routes.length > 1) {
          const routes = response.data.train.routes;
          const generatedTrips: Trip[] = [];
          
          // Generate trips by creating combinations of stations
          // For simplicity, we'll create trips between all consecutive stations
          for (let i = 0; i < routes.length - 1; i++) {
            const from = routes[i];
            const to = routes[i + 1];
            
            // Calculate a simple distance/price based on stop number
            const distance = (to.stopNo - from.stopNo) * 100; // Simplified distance calculation
            const price = distance * 1.5; // Simple price calculation
            
            generatedTrips.push({
              id: i + 1, // Generate unique IDs (would come from the backend in a real app)
              from: {
                stationId: i + 1,
                stationName: from.stationName,
                city: from.city
              },
              to: {
                stationId: i + 2,
                stationName: to.stationName,
                city: to.city
              },
              distance,
              price
            });
          }
          
          // Also add a trip from first to last station
          const firstStation = routes[0];
          const lastStation = routes[routes.length - 1];
          const totalDistance = (lastStation.stopNo - firstStation.stopNo) * 100;
          const totalPrice = totalDistance * 1.25; // Slight discount for full journey
          
          generatedTrips.push({
            id: routes.length, // Use a unique ID
            from: {
              stationId: 1,
              stationName: firstStation.stationName,
              city: firstStation.city
            },
            to: {
              stationId: routes.length,
              stationName: lastStation.stationName,
              city: lastStation.city
            },
            distance: totalDistance,
            price: totalPrice
          });
          
          setTrips(generatedTrips);
        }
        
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

  const handleSeatSelection = (seatId: number) => {
    setSelectedSeat(seatId);
  };

  const handleTripSelection = (tripId: number) => {
    setSelectedTrip(tripId);
  };

  const handlePassengerDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPassengerDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    if (bookingStep === 1 && selectedTrip !== null) {
      setBookingStep(2);
    } else if (bookingStep === 2 && selectedSeat !== null) {
      setBookingStep(3);
    }
  };

  const handlePrevStep = () => {
    if (bookingStep === 2) {
      setBookingStep(1);
    } else if (bookingStep === 3) {
      setBookingStep(2);
    }
  };

  const handleBookTicket = async () => {
    if (!selectedTrip || !selectedSeat || !selectedCoach) return;
    
    try {
      setLoading(true);
      
      const bookingData = {
        trainId: Number(trainId),
        coachId: selectedCoach,
        seatId: selectedSeat,
        tripId: selectedTrip,
        passengerDetails: {
          name: passengerDetails.name,
          age: Number(passengerDetails.age),
          gender: passengerDetails.gender
        }
      };
      
      const response = await api.post("/api/v1/user/book-ticket", bookingData);
      
      setSuccess(`Ticket booked successfully! PNR: ${response.data.booking.pnr}`);
      // Redirect to payment page or bookings page
      setTimeout(() => {
        navigate("/bookings");
      }, 3000);
      
    } catch (err: any) {
      console.error("Error booking ticket:", err);
      setError(err.response?.data?.message || "Failed to book ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-screen min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <div className="mt-4">
          <Link to="/trains" className="text-blue-600 hover:text-blue-800">
            Back to Trains
          </Link>
        </div>
      </div>
    );
  }

  if (!train) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Not Found: </strong>
        <span className="block sm:inline">Train details could not be found.</span>
        <div className="mt-4">
          <Link to="/trains" className="text-blue-600 hover:text-blue-800">
            Back to Trains
          </Link>
        </div>
      </div>
    );
  }

  const selectedCoachData = train.coaches.find(coach => coach.id === selectedCoach);
  const selectedTripData = trips.find(trip => trip.id === selectedTrip);

  return (
    <div className="w-screen min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-black text-2xl font-bold mb-6">Book Your Ticket</h2>
        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Success: </strong>
            <span className="block sm:inline">{success}</span>
            <p className="mt-2">Redirecting to your bookings...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <Link to={`/trains/${trainId}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Train Details
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-black mb-6">Book Ticket - {train.name}</h1>
                
                {/* Booking Progress */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bookingStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        1
                      </div>
                      <span className="mt-2 text-sm text-black">Select Trip</span>
                    </div>
                    <div className={`flex-1 h-1 mx-2 ${bookingStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bookingStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        2
                      </div>
                      <span className="mt-2 text-sm text-black">Choose Seat</span>
                    </div>
                    <div className={`flex-1 h-1 mx-2 ${bookingStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bookingStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        3
                      </div>
                      <span className="mt-2 text-sm text-black">Passenger Details</span>
                    </div>
                  </div>
                </div>
                
                {/* Step 1: Select Trip */}
                {bookingStep === 1 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-black">Select Your Trip</h2>
                    
                    <div className="grid gap-4 mb-6">
                      {trips.map(trip => (
                        <div 
                          key={trip.id}
                          onClick={() => handleTripSelection(trip.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedTrip === trip.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center">
                                <div className="text-lg font-medium text-black">{trip.from.stationName}</div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                                <div className="text-lg font-medium text-black">{trip.to.stationName}</div>
                              </div>
                              <div className="text-sm text-black mt-1">
                                {trip.from.city} to {trip.to.city}
                              </div>
                              <div className="text-sm text-black mt-1">Distance: {trip.distance} km</div>
                            </div>
                            <div className="text-xl font-bold text-blue-600">₹{trip.price.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <Link 
                        to={`/trains/${trainId}`}
                        className="px-4 py-2 border border-gray-300 rounded text-black hover:bg-gray-50"
                      >
                        Cancel
                      </Link>
                      <button
                        onClick={handleNextStep}
                        disabled={selectedTrip === null}
                        className={`px-6 py-2 rounded font-medium ${
                          selectedTrip !== null
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Next: Choose Seat
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Select Seat */}
                {bookingStep === 2 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-black">Select Your Seat</h2>
                    
                    {train.coaches.length > 0 && (
                      <>
                        <div className="mb-4">
                          <label className="block text-black mb-2">Select Coach:</label>
                          <div className="flex space-x-2 overflow-x-auto pb-2">
                            {train.coaches.map((coach) => (
                              <button
                                key={coach.id}
                                onClick={() => setSelectedCoach(coach.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${
                                  selectedCoach === coach.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-black hover:bg-gray-200'
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
                          <div className="border rounded-lg overflow-hidden mb-6">
                            <div className="bg-gray-50 py-3 px-4 border-b">
                              <h3 className="text-lg font-medium text-black">
                                Coach {selectedCoachData.id} - {selectedCoachData.availableSeats} seats available
                              </h3>
                            </div>
                            <div className="p-4 grid grid-cols-10 gap-2">
                              {selectedCoachData.seats.map((seat) => (
                                <div
                                  key={seat.id}
                                  onClick={() => seat.status === 'available' && handleSeatSelection(seat.id)}
                                  className={`relative p-2 border rounded-md text-center ${
                                    seat.status === "available"
                                      ? selectedSeat === seat.id
                                        ? "bg-blue-100 border-blue-500 cursor-pointer"
                                        : "bg-green-50 border-green-200 cursor-pointer hover:bg-green-100"
                                      : seat.status === "booked"
                                      ? "bg-red-50 border-red-200"
                                      : "bg-yellow-50 border-yellow-200"
                                  }`}
                                >
                                  <div className="text-xs font-medium text-black">{seat.seatNo}</div>
                                  <div className="text-xs text-black">₹{seat.price}</div>
                                  {seat.status !== "available" ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 rounded-md">
                                      <span className="text-xs font-medium text-black">
                                        {seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}
                                      </span>
                                    </div>
                                  ) : selectedSeat === seat.id && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-md">
                                      <span className="text-xs font-medium text-blue-600">
                                        Selected
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="mt-6 flex justify-between">
                      <button
                        onClick={handlePrevStep}
                        className="px-4 py-2 border border-gray-300 rounded text-black hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={selectedSeat === null}
                        className={`px-6 py-2 rounded font-medium ${
                          selectedSeat !== null
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Next: Passenger Details
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Passenger Details */}
                {bookingStep === 3 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-black">Enter Passenger Details</h2>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <h3 className="font-medium text-blue-700 mb-2">Trip Summary</h3>
                      {selectedTripData && (
                        <div className="text-black">
                          <p className="mb-1"><span className="font-medium">From:</span> {selectedTripData.from.stationName}, {selectedTripData.from.city}</p>
                          <p className="mb-1"><span className="font-medium">To:</span> {selectedTripData.to.stationName}, {selectedTripData.to.city}</p>
                          <p className="mb-1"><span className="font-medium">Train:</span> {train.name}</p>
                          <p className="mb-1"><span className="font-medium">Seat:</span> Coach {selectedCoach}, Seat {selectedCoachData?.seats.find(seat => seat.id === selectedSeat)?.seatNo}</p>
                          <p className="font-medium text-green-700">Price: ₹{selectedTripData.price.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <label htmlFor="name" className="block text-black mb-1">Passenger Name</label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={passengerDetails.name}
                          onChange={handlePassengerDetailsChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="age" className="block text-black mb-1">Age</label>
                        <input
                          id="age"
                          name="age"
                          type="number"
                          min="1"
                          max="120"
                          value={passengerDetails.age}
                          onChange={handlePassengerDetailsChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                          placeholder="Enter age"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="gender" className="block text-black mb-1">Gender</label>
                        <select
                          id="gender"
                          name="gender"
                          value={passengerDetails.gender}
                          onChange={handlePassengerDetailsChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                          required
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <button
                        onClick={handlePrevStep}
                        className="px-4 py-2 border border-gray-300 rounded text-black hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleBookTicket}
                        disabled={loading || !passengerDetails.name || !passengerDetails.age}
                        className={`px-6 py-2 rounded font-medium ${
                          !loading && passengerDetails.name && passengerDetails.age
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : "Book Ticket"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 