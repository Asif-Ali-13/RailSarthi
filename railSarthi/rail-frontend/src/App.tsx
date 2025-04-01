import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Profile } from "./components/user/Profile";
import { MyBookings } from "./components/user/MyBookings";
import { TrainList } from "./components/user/TrainList";
import { TrainDetails } from "./components/user/TrainDetails";
import { BookingPage } from "./components/user/BookingPage";

// Admin Components
import { AdminLogin } from "./components/admin/AdminLogin";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { Dashboard } from "./components/admin/Dashboard";
import { Trains } from "./components/admin/Trains";
import { Stations } from "./components/admin/Stations";
import { Profile as AdminProfile } from "./components/admin/Profile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="trains" element={<Trains />} />
          <Route path="stations" element={<Stations />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
        
        {/* User Routes */}
        <Route path="/" element={<Navbar />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trains"
            element={
              <ProtectedRoute>
                <TrainList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trains/:trainId"
            element={
              <ProtectedRoute>
                <TrainDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:trainId"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
