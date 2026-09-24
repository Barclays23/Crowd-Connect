// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services/authServices';
import type { UserState } from '@/types/user.types';
import type { 
    AuthState, 
    RegisterPayload, 
    LoginPayload, 
    EmailResponseData,
    AuthTokensData,
    AuthUserData
} from '@/types/auth.types';
import { setAuthInterceptors } from '@/config/axios';
import { API_ENDPOINTS } from '@/constants/apiEndpoints.constants';
import type { ApiResponse } from '@/types/common.types';
import { disconnectSocket, initializeSocket } from '@/services/socketService';
// import { toast } from 'react-toastify';
// import toast from 'react-hot-toast';
// import { toast } from "sonner";




interface AuthContextType extends AuthState {
    login: (credentials: LoginPayload) => Promise<ApiResponse<AuthTokensData>>;
    register: (data: RegisterPayload) => Promise<ApiResponse<EmailResponseData>>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<ApiResponse<void>>;
    setAccessToken: React.Dispatch <React.SetStateAction <string | null>>; 
    setUser: React.Dispatch <React.SetStateAction <UserState | null>>;
    refreshAuthUser: () => Promise<void>;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);



// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};




export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserState | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    // Reusable function to fetch fresh user data
    const refreshAuthUser = useCallback(async (): Promise<void> => {
        try {
            const response: ApiResponse<AuthUserData> = await authService.getAuthUser();
            if (response.data?.authUser) {
                setUser(response.data.authUser);
            }
        } catch (error) {
            console.error("Failed to refresh user data", error);
        }
    }, []);



    // Restore auth state from localStorage on mount
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedToken = localStorage.getItem("accessToken");
                const storedUser = localStorage.getItem("user");

                if (storedToken && storedUser) {
                    setAccessToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    return;
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
    const fullLogout = async (isManualLogout: boolean = false): Promise<ApiResponse<void>> => {
        try {
            // 1. Call server logout to clear HTTP-only cookie/session
            const response: ApiResponse<void> = await authService.logoutService();
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

            if (isManualLogout) {
                localStorage.removeItem('last_active_user_email'); 
            }
        };
    };

    // *** INJECT LOGOUT CALLBACK TO AXIOS INTERCEPTOR ***
    useEffect(() => {
        // Pass false so the interceptor PRESERVES the last_active_user_email on session expiry
        // The interceptor will use this when the refresh token fails.
        setAuthInterceptors(() => fullLogout(false));
    }, []);






    // Save tokens & user to localStorage whenever they change.
    useEffect(() => {
        if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
        } else {
            localStorage.removeItem("accessToken");
        }

        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [accessToken, user]);


    useEffect(() => {
        if (accessToken) {
            // Connect to socket when user logs in / token exists
            initializeSocket(accessToken);
        } else {
            // Disconnect when user logs out / token is removed
            disconnectSocket();
        }
    }, [accessToken]);


    // Validate session on mount or when accessToken/user changes
    useEffect(() => {
        let isMounted = true;

        const validateSession = async () => {
            if (!accessToken) {
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
                const response: ApiResponse<AuthUserData> = await authService.getAuthUser();
                console.log('✅ response in validateSession:', response);
            
                if (isMounted && response.data.authUser) {
                    setUser(response.data.authUser);
                }
            
            } catch (err: unknown) {
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



    const login = async (credentials: LoginPayload): Promise<ApiResponse<AuthTokensData>> => {
        const response: ApiResponse<AuthTokensData> = await authService.loginService(credentials);
        // console.log('response from authContext login:', response);

        setAccessToken(response.data.accessToken);
        setUser(response.data.authUser);
        return response;
    };




    const register = async (data: RegisterPayload): Promise<ApiResponse<EmailResponseData>> => {
        // Backend must set HTTP-Only refresh cookie here
        const response: ApiResponse<EmailResponseData> = await authService.registerService(data);
        console.log('response in authContext register:', response);
        
        return response;
    };




    const loginWithGoogle = async () => {
        // Navigate to the backend google login route
        window.location.href = API_ENDPOINTS.AUTH.GOOGLE_LOGIN_URL;
    };




    // Public logout function for components (e.g., Navbar).
    // It uses the centralized fullLogout logic.
    const logout = async (): Promise<ApiResponse<void>> => {
        try {
            const response: ApiResponse<void> = await fullLogout(true);
            return response;

        } catch (error) {
            console.error("Error in AuthContext logout:", error);
            // Even if the server call fails, we ensure client state is cleared in fullLogout.finally
            throw error;
        }
    };






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
                setUser,
                refreshAuthUser
            }}
        >
        {children}
        </AuthContext.Provider>
    );
};