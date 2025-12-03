import { createContext, useContext, useEffect, useState } from "react";
import employeeAuthService from "../services/employeeAuthServices";

// eslint-disable-next-line react-refresh/only-export-components
export const EmployeeAuthContext = createContext({
    user: null,
    login: () => { },
    logout: () => { },
    lockEmployee: () => { },
    unlockEmployee: () => { },
    isAuthenticated: false,
    isLocked: false,
    isLoading: true,
})

export const EmployeeAuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLocked, setIsLocked] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const login = async (data) => {
        try {
            const { email, password } = data
            const response = await employeeAuthService.login({ email, password })

            if (response.authenticated) {
                try {
                    const userProfile = await employeeAuthService.getProfile()
                    
                    setUser(userProfile.employee)
                    setIsAuthenticated(true)
                    setIsLocked(userProfile.employee?.isLocked || false)
                } catch (profileError) {
                    console.log('Error fetching employee profile after login:', profileError)
                    
                    setUser(null)
                    setIsAuthenticated(true)
                    setIsLocked(false)
                    return profileError
                }
            }

            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const logout = async () => {
        try {
            const response = await employeeAuthService.logout()
            
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

    const lockEmployee = async () => {
        try {
            const response = await employeeAuthService.lockAccount()
            
            setUser({ ...user, isLocked: true })
            setIsLocked(true)
            
            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const unlockEmployee = async (password) => {
        try {
            const response = await employeeAuthService.unlockAccount({ password })
            
            setUser({ ...user, isLocked: false })
            setIsLocked(false)
            
            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const checkAuthStatus = async () => {
        setIsLoading(true)
        
        try {
            const response = await employeeAuthService.getProfile()

            if (response && response.employee) {
                setUser(response.employee)
                setIsAuthenticated(true)
                setIsLocked(response.employee?.isLocked || false)
            } else {
                setUser(null)
                setIsAuthenticated(false)
                setIsLocked(false)
            }
        } catch (error) {
            console.log('Error from employee checkAuthStatus:', error)
            
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
        lockEmployee,
        unlockEmployee,
        user,
        isLoading,
        isAuthenticated,
        isLocked,
    }

    return (
        <EmployeeAuthContext.Provider value={values}>
            {children}
        </EmployeeAuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export default function useEmployeeAuth() {
    const context = useContext(EmployeeAuthContext)
    
    if (!context) {
        throw new Error('useEmployeeAuth must be used within EmployeeAuthContextProvider')
    }

    return context
}