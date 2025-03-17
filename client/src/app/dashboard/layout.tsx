"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  UsersRound,
  UserRound,
  PenSquare,
  LineChart,
  CircleHelp,
  Search,
  CopyIcon,
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
import { useCreateGroup, useGenerateInvite } from "@/services/groups/mutations";
import { getGroupsLevelWise } from "@/services/groups/queries";
import { MembersLevel } from "@/types/group";


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
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [filteredMembers, setFilteredMembers] = useState<MembersLevel[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const { mutate: generateInvite } = useGenerateInvite();
  
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


  const { mutate: createGroupMutation } = useCreateGroup();
  const {data,isLoading,isError} = getGroupsLevelWise();

  const handleGroupSubmit = () => {
    if (!groupName.trim()) return; // Prevent empty submissions
  
    createGroupMutation(groupName, { // Pass only the `groupName` string
      onSuccess: () => {
        setGroupName(""); // Reset input field
        setIsGroupModalOpen(false); // Close modal
      },
    });
  };
  
  useEffect(() => {
    if (selectedGroup && data?.Data) {
      const selectedGroupData = data.Data.find(
        (group) => group.id.toString() === selectedGroup
      );
      
      if (selectedGroupData) {
        setFilteredMembers(selectedGroupData.members);
      }
    } else {
      setFilteredMembers([]);
    }
  }, [selectedGroup, data]);

  
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedGroup) {
      // Call the mutation with selectedGroup and selectedParent
      generateInvite(
        { GroupId: selectedGroup, inviterId: selectedParent || '' },
        {
          onSuccess: (data) => {
            // Set the invite link returned from the mutation
            setInviteLink(data.inviteLink); // Adjust based on your API response

            // Reset all states after 12 hours
            setTimeout(() => {
              setSelectedGroup(null);
              setSelectedParent(null);
              setFilteredMembers([]);
              setInviteLink(null);
            }, 12 * 60 * 10 * 1000); // 12 hours in milliseconds
          },
          onError: (error) => {
            console.error('Error generating invite:', error);
          },
        }
      );
    }
  };


  const handleCopyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert('Link copied to clipboard!'); // Replace with a toast or notification
    }
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
            {/* Group Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group" className="text-right">
                Group
              </Label>
              <div className="col-span-3">
                <Select
                  value={selectedGroup || ''}
                  onValueChange={setSelectedGroup}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {data?.Data?.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Parent Selection (Conditional Rendering) */}
            {selectedGroup && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parent" className="text-right">
                  Parent
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedParent || ''}
                    onValueChange={setSelectedParent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a parent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Display Invite Link */}
          {inviteLink && (
            <div className="m-4  flex  pl-10 items-center gap-2">
              <span className="text-sm text-white">{inviteLink}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyToClipboard}
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUserModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Generate Link</Button>
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