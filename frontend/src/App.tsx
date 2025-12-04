import "./App.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";

import { Toaster } from 'react-hot-toast';
import { ToastContainer, toast, Slide, Zoom, Flip, Bounce } from 'react-toastify';



// Import route guards
import { AuthProvider } from "./contexts/AuthContext";
import { PublicRoute } from "./components/common/PublicRoute";
import { ProtectedRoute } from "./components/common/ProtectedRoute";



// Pages
import Home from "./pages/user/Home";
import Login from "./pages/auth/Login";
import Registration from "./pages/auth/Registration";
import NotFound from "./pages/user/NotFound";
import { OTPVerification } from "./components/auth/OTPVerification";
import Profile from "./pages/user/Profile";



// admin pages
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import AdminUserList from "./pages/admin/users/AdminUserList";








function App() {
   return (
      <ThemeProvider>
         <AuthProvider>
         <Router>
            <ToastContainer position="top-center" theme="colored" transition={Slide}/>
               <div className="app-container">
                  <Navbar />
                     <main className="main-content">
                        <Routes>
                           {/* ----------- Public Routes ---------- */}
                           <Route path="/" element={<Home />} />
                           <Route path="/otp-verification" element={<OTPVerification />} />
                           
                           <Route element={<PublicRoute />}>
                              <Route path="/login" element={<Login />} />
                              <Route path="/register" element={<Registration />} />
                           </Route>


                           {/* ----------- Protected User Routes ---------- */}
                           <Route element={<ProtectedRoute />} >
                              <Route path="/profile" element={<Profile />} />
                              {/* <Route path="/dashboard" element={<UserDashboard />} /> */}
                           </Route>


                           {/* ----------- Protected Admin Routes ---------- */}
                           <Route element={<ProtectedRoute requireAdmin={true} />} >
                              {/* <Route path="/admin" element={<AdminDashboard />} /> */}
                              {/* <Route path="/admin/users" element={<AdminUserList />} /> */}
                           </Route>


                           {/* 404 Page */}
                           <Route path="*" element={<NotFound />} />
                        </Routes>
                     </main>
                  <Footer />
               </div>
         </Router>
         </AuthProvider>
      </ThemeProvider>
   );
}

export default App;