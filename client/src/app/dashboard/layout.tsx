"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  UsersRound,
  UserRound,
  PenSquare,
  LineChart,
  CircleHelp,
  // Search,
  CopyIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useLogout } from "@/services/user/mutations";
import { AuthContext } from "../context/authcontext";
import { useCreateGroup, useGenerateInvite } from "@/services/groups/mutations";
import { useGroupsLevelWise } from "@/services/groups/queries";
import { MembersLevel } from "@/types/group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Tasks } from "@/types/tasks";
import { useSubmitTask } from "@/services/tasks/mutations";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast"

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
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDeadline, setTaskDeadline] = useState<Date | undefined>(undefined);
  const [taskPriority, setTaskPriority] = useState<string | null>(null);
  const [userId, setUserId] = useState("");


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
  const { data } = useGroupsLevelWise();
  //(data, "levelWise");

  const handleGroupSubmit = () => {
    if (!groupName.trim()) return; // Prevent empty submissions

    createGroupMutation(groupName, {
      // Pass only the `groupName` string
      onSuccess: () => {
        setGroupName(""); // Reset input field
        setIsGroupModalOpen(false); // Close modal
      },
    });
  };

  useEffect(() => {
    if (selectedGroup && data?.Data) {
      const selectedGroupNumber = Number(selectedGroup);
      const selectedGroupData = data.Data[selectedGroupNumber];
      //(selectedGroupData);

      if (selectedGroupData) {
        setFilteredMembers(selectedGroupData.users);
      }
    } else {
      setFilteredMembers([]);
    }
  }, [selectedGroup, data]);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setUserId(id);
  }, []);
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedGroup) {
      // Call the mutation with selectedGroup and selectedParent
      generateInvite(
        { GroupId: selectedGroup, inviterId: selectedParent || "" },
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
            console.error("Error generating invite:", error);
          },
        }
      );
    }
  };

  // Import the mutation hook

  // In your component:
  const { mutate: submitTask, isPending: isSubmittingTask } = useSubmitTask();

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      selectedGroup &&
      selectedUser &&
      taskTitle &&
      taskDeadline &&
      taskPriority
    ) {
      // Create task object according to the Tasks interface
      const taskData: Tasks = {
        TaskName: taskTitle,
        Priority: taskPriority,
        DeadLine: taskDeadline,
        Status: "InProgress",
        groupId: selectedGroup,
        userId: selectedUser,
      };

      // Call the mutation function with the task data
      submitTask(taskData, {
        onSuccess: () => {
          // Handle success
          toast({
            title: "Success",
            description: "Task Created successfully",
        });
          setIsTaskModalOpen(false);
          resetForm();
        },
      });
    }
  };

  // Add a resetForm function to clear the form after submission
  const resetForm = () => {
    setTaskTitle("");
    setSelectedUser(null);
    setTaskDeadline(undefined);
    setTaskPriority(null);
    setSelectedGroup(null);
    setSelectedParent(null);
  };

  const handleCopyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert("Link copied to clipboard!"); // Replace with a toast or notification
    }
  };

  // Show loading or nothing while checking authentication
  if (auth?.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
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
            <a
              className="flex items-center space-x-2 px-4 py-4 hover:bg-blue-600 rounded"
              onClick={(e) => {
                e.preventDefault();
                setIsGroupModalOpen(true);
              }}
            >
              <UsersRound size={28} />
            </a>
            <a
              className="flex items-center space-x-2 px-4 py-4 hover:bg-blue-600 rounded"
              onClick={(e) => {
                e.preventDefault();
                setIsUserModalOpen(true);
              }}
            >
              <UserRound size={28} />
            </a>
            <a
              href="#"
              className="flex items-center space-x-2 px-4 py-4 hover:bg-blue-600 rounded"
              onClick={(e) => {
                e.preventDefault();
                setIsTaskModalOpen(true);
              }}
            >
              <PenSquare size={28} />
            </a>
            <a
              href="/analysis"
              className="flex items-center space-x-2 px-4 py-4 hover:bg-blue-600 rounded"
            >
              <LineChart size={28} />
            </a>
            <a
              href="#"
              className="flex items-center space-x-2 px-4 py-4 hover:bg-blue-600 rounded"
            >
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGroupModalOpen(false)}
              >
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
                    value={selectedGroup || ""}
                    onValueChange={setSelectedGroup}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(data?.Data || {}).map((group) => (
                        <SelectItem
                          key={group.groupId}
                          value={group.groupId.toString()}
                        >
                          {group.groupName}
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
                      value={selectedParent || ""}
                      onValueChange={setSelectedParent}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredMembers.map((member) => (
                          <SelectItem
                            key={member.id}
                            value={member.id.toString()}
                          >
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

      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Task</DialogTitle>
            <DialogDescription>
              Create a new task and assign it to a user with details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTaskSubmit}>
            <div className="grid gap-4 py-4 text-white">
              {/* Task Title */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Task
                </Label>
                <div className="col-span-3">
                  <Input
                    id="title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Enter task title"
                    required
                  />
                </div>
              </div>

              {/* Group Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group" className="text-right">
                  Group
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedGroup || ""}
                    onValueChange={setSelectedGroup}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(data?.Data || {}).map((group) => (
                        <SelectItem
                          key={group.groupId}
                          value={group.groupId.toString()}
                        >
                          {group.groupName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* User Assignment */}
              {selectedGroup && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="user" className="text-right">
                    Assigned To
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={selectedUser || ""}
                      onValueChange={setSelectedUser}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Filter users based on level */}
                        {filteredMembers
                          .filter((member) => {
                            // Get the current user's ID from localStorage
                            

                            // Convert selectedGroup to a number
                            const selectedGroupNumber = Number(selectedGroup);

                            // Get the current group using the numeric ID
                            const selectedGroupData =
                              data?.Data?.[selectedGroupNumber];

                            // Find the current user inside the selected group
                            const currentUser = selectedGroupData?.users?.find(
                              (user) => user.id === userId
                            );

                            // Get current user's level (default to 0 if not found)
                            const currentUserLevel = currentUser?.level || 0;

                            // Show members who have a level greater than the current user's level
                            return member.level > currentUserLevel;
                          })
                          .map((member) => (
                            <SelectItem
                              key={member.id}
                              value={member.id.toString()}
                            >
                              {member.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Deadline */}
              <div className="grid grid-cols-4 items-center gap-4 text-white">
                <Label htmlFor="deadline" className="text-right">
                  Deadline
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {taskDeadline ? (
                          format(taskDeadline, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={taskDeadline}
                        onSelect={setTaskDeadline}
                        initialFocus
                        required
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Priority */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <div className="col-span-3">
                  <Select
                    value={taskPriority || ""}
                    onValueChange={setTaskPriority}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status (Disabled, fixed as InProgress) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <div className="col-span-3">
                  <Select disabled value="InProgress">
                    <SelectTrigger>
                      <SelectValue placeholder="InProgress" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="InProgress">InProgress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTaskModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingTask}>
                {isSubmittingTask ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white">
          <div className="flex justify-end gap-6 items-center px-8 py-4">
            {/* Search Bar */}
            {/* <div className="relative flex justify-end w-96">
              <input
                type="search"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 rounded-full border border-black-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search size={20} />
              </div>
            </div> */}

            {/* Navigation Items */}
            <div className="flex items-center space-x-6">
              <a href="/analysis" className="text-gray-600 hover:text-gray-900">
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
        <Toaster />
      </div>
    </div>
  );
};

export default DashboardLayout;
