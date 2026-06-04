// import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, Bounce } from 'react-toastify';
// import { Slide, Flip, Bounce, Zoom } from 'react-toastify';



// Import route guards
import { PublicRoute } from "@/components/common/PublicRoute";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";



// Providers
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GoogleMapsProvider2 } from "@/contexts/GoogleMapsProvider2";



// Layouts
import UserLayout from "@/components/layouts/UserLayout";


// Auth Pages
import Login from "@/pages/auth/Login";
import Registration from "@/pages/auth/Registration";
import { OTPVerification } from "@/components/auth/OTPVerification";
import ResetPasswordPage from "@/pages/user/ResetPasswordPage";


// User Pages
import HomePage from "@/pages/user/HomePage";
import NotFound from "@/pages/user/NotFound";
import UserAccountTabs from "./pages/user/UserAccountTabs";
import EventsDiscoveryPage from "@/pages/event/EventsDiscoveryPage";
import EventDetailsPage from "@/pages/event/EventDetailsPage";



// Host pages
import HostPage from "@/pages/host/HostPage";



// admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUserList from "@/pages/admin/AdminUserList";
import AdminHostsList from "./pages/admin/AdminHostsList";
import AdminEventList from "@/pages/admin/AdminEventsList";
import AdminBookingsList from "@/pages/admin/AdminBookingsList";
import AdminPlatformSettings from "@/pages/admin/AdminPlatformSettings";
import AdminPayoutRequests from "@/pages/admin/AdminPayoutRequests";






function App() {


   return (
      <ThemeProvider>
         <AuthProvider>
         <GoogleMapsProvider2>
         <Router>
            <ToastContainer position="top-center" theme="colored" transition={Bounce}/>
               {/* <div className="app-container"> */}
                  {/* <Navbar /> */}
                     {/* <main className="main-content"> */}
                        <Routes>
                           <Route element={<UserLayout />}>
                              {/* ----------- Public Routes ---------- */}
                              <Route path="/" element={<HomePage />} />
                              <Route path="/events" element={<EventsDiscoveryPage />} />
                              <Route path="/events/:eventId" element={<EventDetailsPage />} />
                              <Route path="/host" element={<HostPage />} />
                              <Route path="/otp-verification" element={<OTPVerification />} />
                              <Route path="/reset-password" element={<ResetPasswordPage />} />
                              
                              <Route element={<PublicRoute />}>
                                 <Route path="/login" element={<Login />} />
                                 <Route path="/register" element={<Registration />} />
                              </Route>


                              {/* ----------- Protected User Routes ---------- */}
                              <Route element={<ProtectedRoute />} >
                                 <Route path="/my-account" element={<UserAccountTabs />} />
                                 {/* <Route path="/dashboard" element={<UserDashboard />} /> */}
                                 <Route path="/my-account" element={<UserAccountTabs />} />
                                 <Route path="/dashboard" element={<UserAccountTabs />} />
                                 <Route path="/my-events" element={<UserAccountTabs />} />
                                 <Route path="/my-bookings" element={<UserAccountTabs />} />
                                 <Route path="/my-wishlist" element={<UserAccountTabs />} />
                                 <Route path="/my-wallet" element={<UserAccountTabs />} />
                                 <Route path="/my-payouts" element={<UserAccountTabs />} />
                              </Route>
                           </Route>


                           {/* ----------- Protected Admin Routes ---------- */}
                           <Route element={<ProtectedRoute requireAdmin={true} />} >
                              <Route path="/admin" element={<AdminDashboard />} />
                              <Route path="/admin/users" element={<AdminUserList />} />
                              <Route path="/admin/hosts" element={<AdminHostsList />} />
                              <Route path="/admin/events" element={<AdminEventList />} />
                              <Route path="/admin/bookings" element={<AdminBookingsList />} />
                              <Route path="/admin/settings" element={<AdminPlatformSettings />} />
                              <Route path="/admin/payout-requests" element={<AdminPayoutRequests />} />
                           </Route>


                           {/* 404 Page */}
                           <Route path="*" element={<NotFound />} />
                        </Routes>
                     {/* </main> */}
                  {/* <Footer /> */}
               {/* </div> */}
         </Router>
         </GoogleMapsProvider2>
         </AuthProvider>
      </ThemeProvider>
   );
}

export default App;