"use client";
import React, { useContext, useEffect } from "react";
import {
  UsersRound,
  UserRound,
  PenSquare,
  LineChart,
  CircleHelp,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/services/user/mutations";
import { AuthContext } from "../context/authcontext";

// Define types for the layout props
type LayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const { mutate: logout, isPending } = useLogout(); // Use `mutate` from `useMutation`
  
  // Check if user data exists and has an ID
  const isAuthenticated = auth?.data?.user?.id;
  //("Auth state:", isAuthenticated ? "Authenticated" : "Not authenticated");

  useEffect(() => {
    // If auth is not loading and the user is not authenticated, redirect to home
    if (!auth?.isLoading && !isAuthenticated) {
      //("User not authenticated, redirecting to home");
      router.push("/");
    }
  }, [isAuthenticated, auth?.isLoading, router]);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        // Make sure to call the context logout to clean up storage
        auth?.logout();
        router.push("/");
      },
    });
  };

  // Show loading or nothing while checking authentication
  if (auth?.isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If not authenticated and still loading, don't render the dashboard content
  if (!isAuthenticated && !auth?.isLoading) {
    return null; // This will prevent flashing the dashboard before redirect
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-16 bg-blue-800 text-white">
        {/* Logo Section */}
        <div className="py-4 pr-2 pl-[0.8rem]">
          <div className="h-10 pr-8 w-10 bg-white rounded-md"></div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-20 flex-col justify-center align-center">
          <div className="space-y-6">
            <a href="#" className="flex items-center space-x-2 px-4 py-4 hover:bg-blue-600 rounded">
              <UsersRound size={28} />
            </a>
            <a href="#" className="flex items-center space-x-2 px-4 py-4 hover:bg-blue-600 rounded">
              <UserRound size={28} />
            </a>
            <a href="#" className="flex items-center space-x-2 px-4 py-4 hover:bg-blue-600 rounded">
              <PenSquare size={28} />
            </a>
            <a href="#" className="flex items-center space-x-2 px-4 py-4 hover:bg-blue-600 rounded">
              <LineChart size={28} />
            </a>
            <a href="#" className="flex items-center space-x-2 px-4 py-4 hover:bg-blue-600 rounded">
              <CircleHelp size={28} />
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white">
          <div className="flex justify-end gap-6 items-center px-8 py-4">
            {/* Search Bar */}
            <div className="relative flex justify-end w-96">
              <input
                type="search"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 rounded-full border border-black-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search size={20} />
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Analysis
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Help
              </a>
              <button
                className="px-4 py-2.5 text-sm font-medium border border-black-1px text-white bg-black hover:bg-white hover:text-black rounded-full"
                onClick={handleLogout}
                disabled={isPending} // Disable button while logging out
              >
                {isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;