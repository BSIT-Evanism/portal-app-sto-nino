import { authClient } from "@/lib/auth-client"
import { useState } from "react"



export const ResetPasswordComp = ({ token }: { token: string }) => {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")

    async function handleResetPassword() {

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        const { data, error } = await authClient.resetPassword({
            token: token,
            newPassword: password
        })

        if (error) {
            setError(error.message || "An error occurred")
        } else {
            window.location.href = "/";
        }
    }

    return (
        <section className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-700 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl transform transition-all">
                <div className="flex flex-col p-8 space-y-8">
                    <div className="flex flex-col items-center">
                        <img
                            src="/brgy-logo.png"
                            alt="Logo"
                            className="w-28 h-28 object-contain"
                        />
                        <h1 className="mt-6 text-3xl font-bold text-gray-900">Reset Password</h1>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-shadow"
                                placeholder="Enter new password"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-shadow"
                                placeholder="Confirm new password"
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-center font-medium animate-fade-in">{error}</p>
                        )}

                        <button
                            onClick={handleResetPassword}
                            className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Reset Password
                        </button>
                    </div>
                </div>
                <div className="h-2 bg-green-600 rounded-b-xl" />
            </div>
        </section>
    )
}