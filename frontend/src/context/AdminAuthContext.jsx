import { createContext, useContext, useEffect, useState } from "react";
import adminAuthService from "../services/adminAuthService";

// eslint-disable-next-line react-refresh/only-export-components
export const AdminAuthContext = createContext({
    user: null,
    login: () => { },
    logout: () => { },
    lockAdmin: () => { },
    unlockAdmin: () => { },
    isAuthenticated: false,
    isLocked: false,
    isLoading: true,
})

export const AdminAuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLocked, setIsLocked] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const login = async (data) => {
        try {
            const { adminEmail, password } = data
            const response = await adminAuthService.adminLogin({ adminEmail, password })

            if (response.authenticated) {
                try {
                    const userProfile = await adminAuthService.getAdminProfile()
                    
                    setUser(userProfile)
                    setIsAuthenticated(true)
                    setIsLocked(false)
                } catch (profileError) {
                    console.log('Error fetching user profile after login:', profileError)
                    
                    setUser(null)
                    setIsAuthenticated(true)
                    setIsLocked(false)
                }
            }

            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const logout = async () => {
        try {
            const response = await adminAuthService.logout()
            
            setUser(null)
            setIsAuthenticated(false)
            setIsLocked(false)

            return response
        } catch (error) {
            // Clear local state even if logout request fails
            setUser(null)
            setIsAuthenticated(false)
            setIsLocked(false)
            throw new Error(error.message);
        }
    }

    const lockAdmin = async () => {
        try {
            const response = await adminAuthService.lockAdmin()
            setIsLocked(true)
            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const unlockAdmin = async (password) => {
        try {
            const response = await adminAuthService.unlockAdmin({ password })
            setIsLocked(false)
            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const checkAuthStatus = async () => {
        setIsLoading(true)
        
        try {
            const response = await adminAuthService.getAdminProfile()

            if (response) {
                setUser(response)
                setIsAuthenticated(true)
                setIsLocked(response.isLocked || false)
            } else {
                setUser(null)
                setIsAuthenticated(false)
                setIsLocked(false)
            }
        } catch (error) {
            console.log('Error from checkAuthStatus:', error)
            
            setUser(null)
            setIsAuthenticated(false)
            setIsLocked(false)
        } finally {
            setIsLoading(false)
        }
    }

    // Initial auth status check
    useEffect(() => {
        checkAuthStatus()
    }, [])

    const values = {
        login,
        logout,
        lockAdmin,
        unlockAdmin,
        user,
        isLoading,
        isAuthenticated,
        isLocked,
    }

    return (
        <AdminAuthContext.Provider value={values}>
            {children}
        </AdminAuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export default function useAdminAuth() {
    const context = useContext(AdminAuthContext)
    
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthContextProvider')
    }

    return context
}