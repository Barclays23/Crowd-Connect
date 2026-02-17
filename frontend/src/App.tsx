// import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, Slide, Zoom, Flip, Bounce } from 'react-toastify';



// Import route guards
import { PublicRoute } from "@/components/common/PublicRoute";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";



// Providers
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GoogleMapsProvider1 } from "@/contexts/GoogleMapsProvider1";




// Layouts
import UserLayout from "@/components/layouts/UserLayout";


// Auth Pages
import Login from "@/pages/auth/Login";
import Registration from "@/pages/auth/Registration";
import { OTPVerification } from "@/components/auth/OTPVerification";
import ResetPasswordPage from "@/pages/user/ResetPasswordPage";


// User Pages
import Home from "@/pages/user/Home";
import NotFound from "@/pages/user/NotFound";
import UserAccountTabs from "./components/user/UserAccountTabs";


// Host pages
import HostPage from "@/pages/host/HostPage";



// admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUserList from "@/pages/admin/AdminUserList";
import AdminHostsList from "./pages/admin/AdminHostsList";
import AdminEventList from "@/pages/admin/AdminEventsList";










function App() {

   return (
      <ThemeProvider>
         <AuthProvider>
         {/* <GoogleMapsProvider> */}
         <Router>
            <ToastContainer position="top-center" theme="colored" transition={Zoom}/>
               {/* <div className="app-container"> */}
                  {/* <Navbar /> */}
                     {/* <main className="main-content"> */}
                        <Routes>
                           <Route element={<UserLayout />}>
                              {/* ----------- Public Routes ---------- */}
                              <Route path="/" element={<Home />} />
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
                              </Route>
                           </Route>


                           {/* ----------- Protected Admin Routes ---------- */}
                           <Route element={<ProtectedRoute requireAdmin={true} />} >
                              <Route path="/admin" element={<AdminDashboard />} />
                              <Route path="/admin/users" element={<AdminUserList />} />
                              <Route path="/admin/hosts" element={<AdminHostsList />} />
                              <Route path="/admin/events" element={<AdminEventList />} />
                           </Route>


                           {/* 404 Page */}
                           <Route path="*" element={<NotFound />} />
                        </Routes>
                     {/* </main> */}
                  {/* <Footer /> */}
               {/* </div> */}
         </Router>
         {/* </GoogleMapsProvider> */}
         </AuthProvider>
      </ThemeProvider>
   );
}

export default App;