import { authClient } from "@/lib/auth-client"
import { useState } from "react"

interface SigninProps {
    onBack?: () => void;
}

export const Signin = ({ onBack }: SigninProps) => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isForgotPassword, setIsForgotPassword] = useState(false)

    const handleSignin = async () => {
        const { data, error } = await authClient.signIn.email({
            email: email,
            password: password,
            fetchOptions: {
                onSuccess: (data) => {
                    console.log("data.user", JSON.stringify(data))
                    // @ts-ignore
                    window.location.href = "/";
                }
            }
        })
        if (error) {
            setError(error.message || "An error occurred")
        }
    }

    const handleForgotPassword = async () => {
        const { data, error } = await authClient.forgetPassword({
            email: email,
            redirectTo: "/reset-password"
        })

        if (error) {
            setError(error.message || "An error occurred")
        } else {
            setIsForgotPassword(true)
        }
    }

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            window.history.back();
        }
    }

    return (
        <div className="w-full flex flex-col items-center justify-center z-50 relative">
            <button
                onClick={handleBack}
                className="absolute top-2 left-2 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow z-10"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </button>
            {/* Back Button */}

            {/* Main Content */}
            <div className="w-full max-w-md bg-[#e6e6e6] rounded-2xl flex flex-col items-center justify-center p-8">
                {/* Logo */}
                <img src="/brgy-logo.png" alt="Logo" className="w-28 h-28 mb-2" />
                {/* Heading */}
                <h1 className="text-4xl font-bold text-green-700 text-center mb-2">Welcome!</h1>
                <div className="text-center mb-6">
                    <span>Do not have an account? </span>
                    <a href="/register" className="text-green-700 font-semibold hover:underline">Register</a>
                </div>
                <div className="w-full flex flex-col gap-4">
                    <div>
                        <label className="block mb-1">Enter Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none"
                        />
                    </div>
                    <div className="relative">
                        <label className="block mb-1">Enter Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-9 text-gray-600 focus:outline-none"
                            tabIndex={-1}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m1.875-2.25A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-1.875 2.25A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403 3.22 1.125 4.575" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6 0a6 6 0 1112 0 6 6 0 01-12 0z" /></svg>
                            )}
                        </button>
                        <div className="flex justify-end mt-1">
                            <button onClick={handleForgotPassword} className="text-green-700 text-xs hover:underline">Forgot Password?</button>
                        </div>
                        {isForgotPassword && <p className="text-green-700 text-xs hover:underline">Check your email for a link to reset your password.</p>}
                    </div>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <button
                        onClick={handleSignin}
                        className="w-full mt-4 py-3 bg-green-700 text-white text-2xl rounded-full hover:bg-green-800 focus:outline-none"
                    >
                        Log in
                    </button>
                </div>
            </div>
        </div>
    )
}