// import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, Bounce } from 'react-toastify';
// import { Slide, Flip, Bounce, Zoom } from 'react-toastify';



// Import route guards
import { PublicRoute } from "@/guards/PublicRoute";
import { ProtectedRoute } from "@/guards/ProtectedRoute";



// Providers
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GoogleMapsProvider2 } from "@/contexts/GoogleMapsProvider2";



// Layouts
import UserLayout from "@/components/layout/UserLayout";


// Auth Pages
import Login from "@/pages/auth/Login";
import Registration from "@/pages/auth/Registration";
import { OTPVerification } from "@/components/auth/OTPVerification";
import ResetPasswordPage from "@/pages/user/ResetPasswordPage";
import GoogleAuthSuccess from "@/components/auth/GoogleAuthSuccess";


// User Pages
import HomePage from "@/pages/user/HomePage";
import NotFound from "@/pages/user/NotFound";
import UserAccountTabs from "./pages/user/UserAccountTabs";
import EventsDiscoveryPage from "@/pages/event/EventsDiscoveryPage";
import EventDetailsPage from "@/pages/event/EventDetailsPage";



// Host pages
import HostingPage from "@/pages/host/HostingPage";
import OrganiserDetailsPage from "@/pages/host/OrganiserDetailsPage";
import OrgainiserEventDashboard from "@/pages/event/OrgainiserEventDashboard";


// admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminHosts from "./pages/admin/AdminHosts";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminPayoutRequests from "@/pages/admin/AdminPayoutRequests";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminOperationalSettings from "@/pages/admin/AdminOperationalSettings";
import AdminPolicies from "@/pages/admin/AdminPolicies";










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
                              <Route path="/host" element={<HostingPage />} />
                              <Route path="/organiser/:hostId" element={<OrganiserDetailsPage />} />
                              <Route path="/otp-verification" element={<OTPVerification />} />
                              <Route path="/reset-password" element={<ResetPasswordPage />} />

                              <Route path="/auth/success" element={<GoogleAuthSuccess />} />
                              
                              <Route element={<PublicRoute />}>
                                 <Route path="/login" element={<Login />} />
                                 <Route path="/register" element={<Registration />} />
                              </Route>


                              {/* ----------- Protected User Routes ---------- */}
                              <Route element={<ProtectedRoute />} >
                                 <Route path="/my-account" element={<UserAccountTabs />} />
                                 <Route path="/dashboard" element={<UserAccountTabs />} />
                                 <Route path="/my-events" element={<UserAccountTabs />} />
                                 <Route path="/my-events/:eventId" element={<OrgainiserEventDashboard />} />
                                 <Route path="/my-bookings" element={<UserAccountTabs />} />
                                 <Route path="/my-favourites" element={<UserAccountTabs />} />
                                 <Route path="/my-reviews" element={<UserAccountTabs />} />
                                 <Route path="/my-wallet" element={<UserAccountTabs />} />
                                 <Route path="/my-payouts" element={<UserAccountTabs />} />
                              </Route>
                           </Route>


                           {/* ----------- Protected Admin Routes ---------- */}
                           <Route element={<ProtectedRoute requireAdmin={true} />} >
                              <Route path="/admin" element={<AdminDashboard />} />
                              <Route path="/admin/bookings" element={<AdminBookings />} />
                              <Route path="/admin/events" element={<AdminEvents />} />
                              <Route path="/admin/events/:eventId" element={<OrgainiserEventDashboard />} />
                              <Route path="/admin/hosts" element={<AdminHosts />} />
                              <Route path="/admin/payout-requests" element={<AdminPayoutRequests />} />
                              <Route path="/admin/reviews" element={<AdminReviews />} />
                              <Route path="/admin/settings/operational" element={<AdminOperationalSettings />} />
                              <Route path="/admin/settings/policies" element={<AdminPolicies />} />
                              <Route path="/admin/users" element={<AdminUsers />} />
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