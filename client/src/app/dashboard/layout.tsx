"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  UsersRound,
  UserRound,
  PenSquare,
  LineChart,
  CircleHelp,
  Search,
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useLogout } from "@/services/user/mutations";
import { AuthContext } from "../context/authcontext";
import { useCreateGroup } from "@/services/groups/mutations";


// Define types for the layout props
type LayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const { mutate: logout, isPending } = useLogout(); // Use `mutate` from `useMutation`
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  // Form states
  const [groupName, setGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedParent, setSelectedParent] = useState("");
  
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

  const groups = [
    { id: 1, name: "Development Team" },
    { id: 2, name: "Marketing Team" },
    { id: 3, name: "CTO GROUP" }
  ];
  
  const parents = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Robert Johnson" }
  ];

  const { mutate: createGroupMutation } = useCreateGroup();

  const handleGroupSubmit = () => {
    if (!groupName.trim()) return; // Prevent empty submissions
  
    console.log("Creating new group:", { name: groupName });
  
    createGroupMutation(groupName, { // Pass only the `groupName` string
      onSuccess: () => {
        setGroupName(""); // Reset input field
        setIsGroupModalOpen(false); // Close modal
      },
    });
  };
  
  
  
  const handleUserSubmit = () => {
    console.log("Creating new user:", { selectedGroup, selectedParent });
    // Add your API call to create a user here
    setSelectedGroup("");
    setSelectedParent("");
    setIsUserModalOpen(false);
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
            <a  className="flex items-center space-x-2 px-4 py-4 hover:bg-blue-600 rounded" onClick={(e) => {
              e.preventDefault();
              setIsGroupModalOpen(true);
            }}>
              <UsersRound size={28} />
            </a>
            <a  className="flex items-center space-x-2 px-4 py-4 hover:bg-blue-600 rounded" onClick={(e) => {
              e.preventDefault();
              setIsUserModalOpen(true);
            }}>
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

      <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
        <DialogContent className="sm:max-w-md  ">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a new group to organize users and assign tasks.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGroupSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="groupName" className="text-right">
                  Group Name
                </Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter group name"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsGroupModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Group</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* User Creation Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user and assign them to a group and parent.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUserSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group" className="text-right">
                  Group
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedGroup}
                    onValueChange={setSelectedGroup}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parent" className="text-right">
                  Parent
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedParent}
                    onValueChange={setSelectedParent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a parent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {parents.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id.toString()}>
                          {parent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUserModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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