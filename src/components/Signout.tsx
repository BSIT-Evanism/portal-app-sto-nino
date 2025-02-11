import { authClient } from "@/lib/auth-client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { UserCircle } from 'lucide-react'

export const Signout = () => {
    const handleSignout = async () => {
        const { data, error } = await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    window.location.href = "/";
                }
            }
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <UserCircle className="h-6 w-6" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <a href="/profile">
                        Profile
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignout}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}