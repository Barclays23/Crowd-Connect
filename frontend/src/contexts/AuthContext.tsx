// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services/authServices';
import type { IUser } from '@shared/types';
// import { setAuthInterceptors } from '@/config/axios';
// import toast from 'react-hot-toast';
// import { toast } from "sonner";
import { toast } from 'react-toastify';


import { setAuthInterceptors } from '@/config/axios';



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
    // refreshAccessToken: () => Promise<AuthResponse | null>;
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



    // Restore auth state from localStorage on mount
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedToken = localStorage.getItem("accessToken");
                const storedUser = localStorage.getItem("user");

                if (storedToken && storedUser) {
                    const user = JSON.parse(storedUser);
                    setAccessToken(storedToken);
                    setUser(user);
                }
            } catch (error) {
                console.error("Failed to restore auth state", error);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                // setUser(null);
                // setAccessToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);  // only runs once on mount


    // --- CENTRALIZED LOGOUT LOGIC ---
    // Clears client state and performs server-side logout.
    // This function is used by both manual logout and the Axios interceptor.
    const fullLogout = async () => {
        try {
            // 1. Call server logout to clear HTTP-only cookie/session
            const response = await authService.logoutService();
            console.log('fullLogout response:', response);
            return response;
        } catch (error) {
            console.error("Error in fullLogout:", error);
            // Non-fatal if client state is cleared, just log it.
            throw error;
        } finally {
            // 2. Clear client-side state/storage
            setAccessToken(null);
            setUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        };
    };


    // *** INJECT LOGOUT CALLBACK TO AXIOS INTERCEPTOR ***
    useEffect(() => {
        // We pass the fullLogout function which handles server call and state clearing.
        // The interceptor will use this when the refresh token fails.
        setAuthInterceptors(fullLogout);
    }, []); // Run only once on mount to setup the interceptor







    // Save tokens & user to localStorage whenever they change.
    useEffect(() => {
        accessToken ? localStorage.setItem("accessToken", accessToken)
            : localStorage.removeItem("accessToken");

        user ? localStorage.setItem("user", JSON.stringify(user))
            : localStorage.removeItem("user");

    }, [accessToken, user]);

    // console.log('localStorage accessToken:', localStorage.getItem("accessToken"));
    // console.log('localStorage user:', localStorage.getItem("user"));


    // Validate session on mount or when accessToken/user changes
    useEffect(() => {
        let isMounted = true;

        const validateSession = async () => {
            if (!accessToken || !user) {
                setIsLoading(false);
                return;
            }

            try {
                // This call will:
                // 1. Use current accessToken in headers
                // 2. If valid → return user data
                // 3. If expired → authMiddleware throws error → trigger your Axios 401 interceptor
                // 4. Interceptor will auto-refresh using refreshToken cookie → retry original request → success
                // 5. If refresh token also expires / fails → interceptor should throw error or log out.
                
                console.log('getAuthUser calling...');
                const response = await authService.getAuthUser();
                console.log('✅ response in validateSession:', response);
            
                // SHOULD I NEED TO UPDATE THE USER DATA HERE AFTER GET AUTH USER?????
                // Optional: update user if backend sends fresh data
                if (isMounted) {
                    setUser(response.user || user); // Update with fresh data
                    // setAccessToken(newAccessToken); // it is already setting in axios incepter (when token refreshes)
                }
            
            } catch (err: any) {
                console.log('❌ Error in validateSession :', err);
                // Important: DO NOT THROW OR TOAST HERE (Axios interceptor handles this)
                // Let the interceptor handle logout
                // Just clear state if you want (optional)
                setAccessToken(null);
                setUser(null);

            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        validateSession();
        return () => {
            isMounted = false;
        };

    // }, []); // runs only once on mount.
    }, [accessToken]); // Re-run if token changes




    const login = async (credentials: { email: string; password: string }) => {
        try {
            const response = await authService.loginService(credentials);
            // console.log('response from authContext login:', response);
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




    // Public logout function for components (e.g., Navbar).
    // It uses the centralized fullLogout logic.
    const logout = async (): Promise<AuthResponse> => {
        try {
            const response = await fullLogout();
            return response as AuthResponse;
        } catch (error) {
            console.error("Error in AuthContext logout:", error);
            // Even if the server call fails, we ensure client state is cleared in fullLogout.finally
            throw error;
        }
    };








    // Refresh Access Token Function (axios interceptor already does this) // NEED THIS CODE ANYMORE?
    // const refreshAccessToken = async (): Promise<AuthResponse | null> => {
    //     try {
    //         const response = await authService.refreshTokenService(); // response is AuthResponse
    //         console.log('response from authService.refreshTokenService:', response);
    //         const { newAccessToken, updatedUser } = response;

    //         setAccessToken(newAccessToken || null);
    //         if (updatedUser) setUser(updatedUser);

    //         console.log("Token refreshed successfully");
    //         return response;

    //     } catch (err: any) {
    //         console.error("Refresh token failed or expired", err);
    //         toast.error("Session expired. Please log in again...");
    //         logout(); // Force logout if refresh fails
    //         return null;
    //     }
    // };




    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isLoading,
                // isAuthenticated: !!user,
                isAuthenticated: !!user && !!accessToken,

                login,
                register,
                loginWithGoogle,
                logout,
                // refreshAccessToken,

                setAccessToken,
                setUser
            }}
        >
        {children}
        </AuthContext.Provider>
    );
};