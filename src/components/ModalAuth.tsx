import { useEffect, useState } from "react"
import { Signin } from "./Signin"
import Signup from "./Signup"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { X } from "lucide-react"

export const ModalAuth = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [mode, setMode] = useState<"signin" | "signup">("signin")

    useEffect(() => {
        const handler = (e: CustomEvent) => {
            setIsOpen(true)
            if (e.detail?.mode) setMode(e.detail.mode)
        }
        window.addEventListener("open-auth-modal", handler as EventListener)
        return () => window.removeEventListener("open-auth-modal", handler as EventListener)
    }, [])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <div className="items-center space-x-6 hidden">
                <div className="flex-1" />
                <DialogTrigger asChild>
                    <button
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        onClick={() => setMode("signin")}
                    >
                        Sign in
                    </button>
                </DialogTrigger>
                <DialogTrigger asChild>
                    <button
                        className="px-4 py-2 text-sm font-medium text-white bg-bg rounded-lg hover:bg-teal-700 transition-colors"
                        onClick={() => setMode("signup")}
                    >
                        Sign up
                    </button>
                </DialogTrigger>
            </div>

            <DialogContent className="max-w-full rounded-lg bg-transparent border-none h-fit p-0">
                {/* <a href="/" className="flex items-center p-5 font-medium text-gray-900 md:mb-0">
                        <span className="text-xl font-black leading-none text-gray-900 select-none">
                            Sto. Niño<span className="text-indigo-600">.</span>
                        </span>
                        <p className="text-xs text-gray-600 leading-relaxed ml-4">
                            Barangay Portal
                        </p>
                    </a> */}

                {/* <div className="flex w-full bg-white rounded-lg p-1 mb-6">
                        <button
                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === "signin"
                                ? "bg-blue-500 text-white"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                            onClick={() => setMode("signin")}
                        >
                            Sign in
                        </button>
                        <button
                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === "signup"
                                ? "bg-blue-500 text-white"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                            onClick={() => setMode("signup")}
                        >
                            Sign up
                        </button>
                    </div> */}

                {mode === "signin" ? <Signin /> : <Signup />}
            </DialogContent>
        </Dialog>
    )
}