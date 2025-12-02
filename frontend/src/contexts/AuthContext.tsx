// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services/authServices';
import type { IUser } from '@shared/types';
import { setAuthInterceptors } from '@/config/axios';
// import toast from 'react-hot-toast';
// import { toast } from "sonner";
import { toast } from 'react-toastify';




interface AuthState {
    user: Partial<IUser> | null
    accessToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
}



interface AuthResponse {   // replace this AuthResponse with AuthResponseDTO ??
  accessToken?: string;
  user?: Partial<IUser>;
  message?: string;
  // add other fields your backend returns if any
}




interface AuthContextType extends AuthState {
    login: (credentials: { email: string; password: string }) => Promise<AuthResponse>;
    register: (data: { name: string; email: string; password: string }) => Promise<any>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<any>;
    refreshAccessToken: () => Promise<boolean>; // returns true if successful
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>; 
    setUser: React.Dispatch<React.SetStateAction<Partial<IUser> | null>>;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);



export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};



export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Partial<IUser> | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);



    // 1. Initialization - Load User and Access Token (if persistent)
    useEffect(() => {
        const loadState = () => {
            try {
                const storedAccess = localStorage.getItem("accessToken");
                const storedUser = localStorage.getItem("user");
                console.log('storedAccess', storedAccess);
                console.log('storedUser', storedUser);
                

                if (storedAccess && storedUser) {
                    setAccessToken(storedAccess);
                    setUser(JSON.parse(storedUser));
                }
            } catch (err) {
                console.error("Failed to load tokens & user", err);
            } finally {
                setIsLoading(false);
            }
        };

        setAuthInterceptors(refreshAccessToken, logout);
        loadState();
    }, []);



    // Save tokens & user to localStorage whenever they change
    useEffect(() => {
        if (accessToken && user) {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            // Clear all on logout
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
        }
    }, [accessToken, user]);




    // Refresh Access Token Function
    const refreshAccessToken = async (): Promise<boolean> => {
        try {
            // No need to send refresh token manually, Axios sends the HTTP-Only cookie.
            const response = await authService.refreshTokenService();
            const { accessToken: newAccessToken, user: updatedUser } = response.data;

            setAccessToken(newAccessToken);
            if (updatedUser) setUser(updatedUser);

            console.log("Token refreshed successfully");
            return true;

        } catch (err: any) {
            console.error("Refresh token failed or expired", err);
            toast.error("Session expired. Please log in again...");
            logout(); // Force logout if refresh fails
            return false;
        }
    };




    const login = async (credentials: { email: string; password: string }) => {
        try {
            const response = await authService.loginService(credentials);
            console.log('response from authContext login:', response);
            const { accessToken, user } = response;

            setAccessToken(accessToken);
            setUser(user);
            return response;

        } catch (err: any) {
            throw err;
        }
    };




    const register = async (data: {
        name: string;
        email: string;
        password: string;
    }) => {
        try {
            // Backend must set HTTP-Only refresh cookie here
            const response = await authService.registerService(data);
            console.log('response in authContext register:', response);
            
            return response;

        } catch (err: any) {
            throw err;
        }
    };




    const loginWithGoogle = async () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    };




    const logout = async () => {
        try {
            const response = await authService.logoutService();
            setUser(null);
            setAccessToken(null);
            return response;
            
        } catch (error) {
            console.error("Error in AuthContext logout:", error);
            throw error;

        } finally {
            if (user || accessToken) {
                setUser(null);
                setAccessToken(null);
            }
        }
    };




    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isLoading,
                isAuthenticated: !!user,

                login,
                register,
                loginWithGoogle,
                logout,
                refreshAccessToken,

                setAccessToken,
                setUser
            }}
        >
        {children}
        </AuthContext.Provider>
    );
};