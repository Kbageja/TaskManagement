"use client"
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  // Plus,
  // Minus,
  // Save,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import UserComponent from "../../components/custom/UserGroup";
import { useGroups } from "../../services/groups/queries";
import { useDeleteGroup } from "../../services/groups/mutations";


// Dummy data type definitions
interface Task {
  id: number;
  userId: string;
  parentId: string;
  groupId: number;
  TaskName: string;
  Priority: string;
  DeadLine: string;
  Status: string;
  UpdatedAt: string;
  CreatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  role: string;
  tasks: Task[];
  parentUsers?: ParentUser[]; // Make `parentUsers` optional
}

interface ParentUser {
  id: number;
  parentId: string;
  userId: string;
  groupId: number;
  role: string;
  level: number;
  user: User;
}

// interface Group {
//   id: number;
//   name: string;
//   ownerId: string;
//   createdAt: string;
//   members: Member[];
//   tasks: Task[];
// }

// interface Member {
//   id: number;
//   groupId: number;
//   userId: string;
//   role: string;
//   level: number;
//   user: User;
// }



const Dashboard = () => {
  const { data: dummyData, isLoading, isError, error } = useGroups();
  //(dummyData,"dashboard")

  
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(
    {}
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [openUsers, setOpenUsers] = useState<string[]>([]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleContentClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const { mutate: deleteGroupMutation } = useDeleteGroup();

  const handleDelete = (groupId: number) => {
    deleteGroupMutation(groupId);
  };

  if (isLoading) {
    //("loading");
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  if (!dummyData) {
    return <div>No data available.</div>; // Handle the case where dummyData is undefined
  }

  //(tasks,"useTasks")



  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 h-full bg-white text-black transition-all duration-300 ease-in-out z-10 shadow-md overflow-hidden`}
        style={{
          left: "62px",
          width: sidebarOpen ? "250px" : "0px",
        }}
      >
        <div className="w-64 h-screen bg-white border-r border-gray-700 shadow-lg flex flex-col">
          <div className="p-4 border-b border-gray-700 bg-white">
            <h2 className="text-lg font-semibold text-black tracking-wide">
              Groups
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {dummyData.Data.map((group) => (
              <div
                key={group.id}
                className="px-2 py-1.5 border-b border-gray-800"
              >
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between text-black hover:bg-blue-50 rounded-md py-1.5 px-3 transition-colors duration-200"
                >
                  <span className="font-medium tracking-wide">
                    {group.name}
                  </span>
                  {expandedGroups[group.id] ? (
                    <ChevronUp size={16} className="text-black" />
                  ) : (
                    <ChevronDown size={16} className="text-black" />
                  )}
                </button>
                {expandedGroups[group.id] && (
                  <div className="pl-3 mt-1 border-l border-gray-700 ml-2">
                    {group.members
                      .filter((member) => member.level === 1)
                      .map((member) => (
                        <div key={member.user.id} className="mb-1">
                          <button
                            onClick={() =>
                              setOpenUsers((prev) =>
                                prev.includes(member.user.id)
                                  ? prev.filter((id) => id !== member.user.id)
                                  : [...prev, member.user.id]
                              )
                            }
                            className="w-full flex items-center justify-between text-gray-300 hover:bg-blue-50 rounded py-1.5 px-2 text-sm transition-colors duration-200"
                          >
                            <span className="text-black">
                              {member.user.name}
                            </span>
                            {member.user.parentUsers &&
                              member.user.parentUsers.length > 0 &&
                              (openUsers.includes(member.user.id) ? (
                                <ChevronUp size={14} className="text-black" />
                              ) : (
                                <ChevronDown size={14} className="text-black" />
                              ))}
                          </button>
                          {openUsers.includes(member.user.id) &&
                            member.user.parentUsers &&
                            member.user.parentUsers.length > 0 && (
                              <div className="pl-4 py-1">
                                {member.user.parentUsers.map((parentUser) => (
                                  <div
                                    key={parentUser.user.id}
                                    className="flex items-center py-1 px-2 text-xs text-black  hover:bg-blue-50 rounded"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2"></div>
                                    {parentUser.user.name}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-1/2 transform -translate-y-1/2 z-20 text-black flex items-center justify-center rounded-r-md transition-all duration-300"
        style={{
          left: sidebarOpen ? "310px" : "64px",
        }}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* Main content */}
      <main
        className={`transition-all w-full min-h-full duration-300 rounded-xl p-8 pt-4 text-black relative`}
        style={{
          marginLeft: sidebarOpen ? "230px" : "0",
          backgroundSize: "25px 25px",
          backgroundImage: `
            linear-gradient(to right, rgba(205, 205, 205, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(205, 205, 205, 0.2) 1px, transparent 1px)
          `,
          backgroundColor: "white",
        }}
        onClick={handleContentClick}
      >
        <div className="relative z-10 left-[5%]">
          <h1 className="text-4xl font-bold mb-10">Dashboard</h1>
          <div className="space-y-6">
            {dummyData?.Data && dummyData.Data.length > 0 ? (
              dummyData.Data.map((group) => (
                <Card
                  key={group.id}
                  className="shadow-md w-full md:w-[90%] rounded-lg border-t-4 border-t-[#A4C7FF] text-black bg-white"
                >
                  <CardHeader className="bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <CardTitle className="flex items-center space-x-2">
                        <span>{group.name}</span>
                      </CardTitle>
                      <div className="text-sm flex flex-col md:flex-row gap-2 md:gap-16 mt-2 md:mt-0 mx-4 font-medium italic text-black">
                        <div>Created: {formatDate(group.createdAt)}</div>
                        <div>Members: {group.members.length}</div>
                        <button
                          onClick={() => toggleGroup(group.id)}
                          className="rounded-full px-1"
                        >
                          {expandedGroups[group.id] ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                        <button onClick={() => handleDelete(group.id)}>
                          <Trash2 className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  {expandedGroups[group.id] && (
                    <CardContent className="pt-6 text-black bg-white">
                      {group.members
                        .filter((member) => member.level === 1)
                        .map((member) => (
                          <UserComponent
                            key={member.id}
                            user={member.user}
                            role={member.role}
                            groupId={group.id}
                          />
                        ))}
                      {/* <div className="flex flex-wrap justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="lg"
                          className="flex bg-[#f8d93f] rounded-2xl text-black font-bold items-center w-full sm:w-auto"
                        >
                          <Plus size={16} className="mr-1" /> Add User
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="flex bg-[#f8d93f] rounded-2xl text-black font-bold items-center w-full sm:w-auto"
                        >
                          Assign Task
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="flex bg-[#f8d93f] rounded-2xl text-black font-bold items-center w-full sm:w-auto"
                        >
                          <Minus size={16} className="mr-1" /> Remove
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="flex bg-[#f8d93f] rounded-2xl text-black font-bold items-center w-full sm:w-auto"
                        >
                          <Save size={16} className="mr-1" /> Save Changes
                        </Button>
                      </div> */}
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
