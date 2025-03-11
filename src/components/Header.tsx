import { cn } from "@/lib/utils"
import { ModalAuth } from "./ModalAuth"
import { Signout } from "./Signout"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "./ui/navigation-menu"
import React from "react"




export const MainHeader = ({ role, pathname, approved, hasSession }: { role: string | null, pathname: string, approved: boolean, hasSession: boolean }) => {
    return (
        <section className="w-full px-8 text-gray-700 bg-white">
            <div className="container flex flex-col flex-wrap items-center justify-between py-5 mx-auto md:flex-row max-w-7xl">
                {/* Logo and Navigation Section */}
                <div className="relative flex flex-col h-fit items-center md:flex-row md:w-full md:justify-center">
                    {/* Logo */}
                    <a href="/" className="flex items-center mb-5 font-medium text-gray-900 md:absolute md:left-0 md:mb-0">
                        <img src="/brgy-logo.png" alt="Barangay Logo" className="h-20" />
                    </a>

                    {/* Main Navigation */}
                    <nav className="flex flex-wrap items-center justify-center mb-5 text-base md:mb-0">
                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <a href="/">
                                            Home
                                        </a>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <a href="/gallery">
                                            Gallery
                                        </a>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                {approved && (
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                                        <NavigationMenuContent className="flex flex-col gap-2 p-2">
                                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                                                <ListItem
                                                    key={'/tickets'}

                                                    title={'Tickets'}
                                                    href={'/tickets'}
                                                >
                                                    View and manage requests/tickets
                                                </ListItem>
                                                <ListItem
                                                    key={'/concern'}
                                                    title={'Concern Board'}
                                                    href={'/concern'}
                                                >
                                                    Submit concerns and feedback
                                                </ListItem>
                                            </ul>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                )}
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>Feed</NavigationMenuTrigger>
                                    <NavigationMenuContent className="flex flex-col gap-2 p-2">
                                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                                            <ListItem
                                                key={'/news'}

                                                title={'News'}
                                                href={'/news'}
                                            >
                                                View all recent and old news here
                                            </ListItem>
                                            <ListItem
                                                key={'/announcements'}
                                                title={'Announcements'}
                                                href={'/announcements'}
                                            >
                                                View all announcements here
                                            </ListItem>
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                {role === 'admin' && (
                                    <NavigationMenuItem>
                                        <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                            <a href="/admin">
                                                Admin
                                            </a>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                )}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </nav>
                </div>

                {/* Auth Section */}
                <div className="inline-flex items-center space-x-6 md:absolute md:right-8 md:top-5 mr-16">
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

