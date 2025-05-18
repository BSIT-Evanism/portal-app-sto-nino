import { cn } from "@/lib/utils"
import { ModalAuth } from "./ModalAuth"
import { Signout } from "./Signout"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "./ui/navigation-menu"
import React, { useState } from "react"
import useSWR from "swr"
import { Menu } from "lucide-react"
import { Drawer, DrawerTrigger, DrawerContent } from "./ui/drawer"




export const MainHeader = ({ role, pathname, approved, hasSession }: { role: string | null, pathname: string, approved: boolean, hasSession: boolean }) => {
    return (
        <section className="w-full px-8 text-white bg-bg">
            <div className="container flex flex-row items-center justify-between text-center py-5 mx-auto max-w-7xl">
                {/* Logo */}
                <a href="/" className="flex items-center font-medium text-gray-900 ">
                    <img src="/brgy-logo.png" alt="Barangay Logo" className="h-20" />
                </a>

                {/* Hamburger for mobile */}
                <div className="md:hidden">
                    <Drawer>
                        <DrawerTrigger asChild>
                            <button aria-label="Open menu">
                                <Menu className="w-8 h-8 text-white" />
                            </button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <nav className="flex flex-col gap-2 p-6 text-black">
                                <a className="hover:underline px-4 py-2 text-center" href="/">Home</a>
                                <Dropdown label="About">
                                    <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/about/mission-vision">Mission and Vision</a>
                                    <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/about/history">History</a>
                                    <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/about/officials">Officials</a>
                                </Dropdown>
                                {approved && (
                                    <Dropdown label="Services">
                                        <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/tickets">Tickets</a>
                                        <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/concern">Concern Board</a>
                                    </Dropdown>
                                )}
                                <Dropdown label="Feed">
                                    <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/news">News</a>
                                    <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/announcements">Announcements</a>
                                </Dropdown>
                                <Dropdown label="Promotions">
                                    <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href={`/promotions`}>All</a>
                                    <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href={`/promotions/Properties`}>Properties</a>
                                    <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href={`/promotions/Resorts`}>Resorts</a>
                                    <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href={`/promotions/Churches`}>Churches</a>
                                    <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href={`/promotions/Farms`}>Farms</a>
                                    <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href={`/promotions/Nature`}>Nature</a>
                                </Dropdown>
                                <Dropdown label="Contact Us">
                                    <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/contact-us">Contact Us</a>
                                </Dropdown>
                                {role === 'admin' && (
                                    <a className="hover:underline px-4 py-2" href="/admin">Admin</a>
                                )}
                                <div className="mt-4">
                                    {(!approved && hasSession) && (<div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full mb-2">
                                        <p>Please wait for approval - you have limited access to the portal</p>
                                    </div>)}
                                    {role !== null ? <Signout /> : <ModalAuth />}
                                </div>
                            </nav>
                        </DrawerContent>
                    </Drawer>
                </div>

                {/* Main Navigation (desktop) */}
                <nav className="hidden md:flex items-center text-center">
                    <ul className="flex gap-8 text-lg font-bold">
                        <a className="hover:underline px-4 py-2 text-center" href="/">Home</a>
                        <li>
                            <Dropdown label="About">
                                <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/about/mission-vision">Mission and Vision</a>
                                <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/about/history">History</a>
                                <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/about/officials">Officials</a>
                            </Dropdown>
                        </li>
                        {approved && (
                            <li>
                                <Dropdown label="Services">
                                    <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/tickets">Tickets</a>
                                    <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/concern">Concern Board</a>
                                </Dropdown>
                            </li>
                        )}
                        <li>
                            <Dropdown label="Feed">
                                <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/news">News</a>
                                <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/announcements">Announcements</a>
                            </Dropdown>
                        </li>
                        <li>
                            <Dropdown label="Explore">
                                <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href={`/promotions`}>All</a>
                                <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href={`/promotions/Properties`}>Properties</a>
                                <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href={`/promotions/Resorts`}>Resorts</a>
                                <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href={`/promotions/Churches`}>Churches</a>
                                <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href={`/promotions/Farms`}>Farms</a>
                                <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href={`/promotions/Nature`}>Nature</a>
                            </Dropdown>
                        </li>
                        <li>
                            <Dropdown label="Contact Us">
                                <a className="block px-6 py-3 hover:bg-accent hover:text-accent-foreground text-base font-bold" href="/contact-us">Contact Us</a>
                            </Dropdown>
                        </li>
                        {role === 'admin' && (
                            <a className="hover:underline px-4 py-2" href="/admin">Admin</a>
                        )}
                    </ul>
                </nav>

                {/* Auth Section (desktop) */}
                <div className="hidden md:flex items-center space-x-6">
                    {(!approved && hasSession) && (<div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        <p>Please wait for approval - you have limited access to the portal</p>
                    </div>)}
                    {role !== null ? <Signout /> : <ModalAuth />}
                </div>
            </div>

            {/* Breadcrumb Section */}
            {pathname !== '/' && (
                <div className="container mx-auto max-w-7xl pb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <a href="/" className="hover:text-gray-900">Home</a>
                        {pathname.split('/').filter(Boolean).map((segment, index, array) => {
                            const path = '/' + array.slice(0, index + 1).join('/')
                            return (
                                <div key={path} className="flex items-center gap-2">
                                    <span>/</span>
                                    <a href={path} style={{
                                        viewTransitionName: segment + index
                                    }} className="hover:text-gray-900 capitalize">
                                        {segment}
                                    </a>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </section>
    )
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"

const Dropdown = ({ label, children }: { label: string, children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    return (
        <li className="relative">
            <button
                className="px-4 py-2 focus:outline-none text-lg font-bold flex items-center gap-2"
                onClick={() => setOpen((o) => !o)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                type="button"
            >
                {label}
                <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {open && (
                <div className="absolute left-0 mt-2 min-w-[220px] bg-white text-black rounded-lg shadow-lg z-20 border border-gray-200">
                    {children}
                </div>
            )}
        </li>
    );
};

