import "./App.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";

import { Toaster } from 'react-hot-toast';
import { ToastContainer, toast, Slide, Zoom, Flip, Bounce } from 'react-toastify';



// Import route guards
import { AuthProvider } from "@/contexts/AuthContext";
import { PublicRoute } from "@/components/common/PublicRoute";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";



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
import UserAccount from "@/pages/user/UserAccount";


// Host pages
import HostPage from "@/pages/host/HostPage";



// admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUserList from "@/pages/admin/AdminUserList";
import AdminHostsList from "./pages/admin/AdminHostsList";








function App() {
   return (
      <ThemeProvider>
         <AuthProvider>
         <Router>
            <ToastContainer position="top-center" theme="colored" transition={Slide}/>
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
                                 <Route path="/my-account" element={<UserAccount />} />
                                 {/* <Route path="/dashboard" element={<UserDashboard />} /> */}
                                 <Route path="/my-account" element={<UserAccount />} />
                                 <Route path="/dashboard" element={<UserAccount />} />
                                 <Route path="/my-events" element={<UserAccount />} />
                                 <Route path="/my-bookings" element={<UserAccount />} />
                                 <Route path="/my-wishlist" element={<UserAccount />} />
                                 <Route path="/my-wallet" element={<UserAccount />} />
                              </Route>
                           </Route>


                           {/* ----------- Protected Admin Routes ---------- */}
                           <Route element={<ProtectedRoute requireAdmin={true} />} >
                              <Route path="/admin" element={<AdminDashboard />} />
                              <Route path="/admin/users" element={<AdminUserList />} />
                              <Route path="/admin/hosts" element={<AdminHostsList />} />
                           </Route>


                           {/* 404 Page */}
                           <Route path="*" element={<NotFound />} />
                        </Routes>
                     {/* </main> */}
                  {/* <Footer /> */}
               {/* </div> */}
         </Router>
         </AuthProvider>
      </ThemeProvider>
   );
}

export default App;