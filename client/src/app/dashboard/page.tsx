"use client"
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Plus, Minus, Save, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

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
  role:string;
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

interface Group {
  id: number;
  name: string;
  ownerId: string;
  createdAt: string;
  members: Member[];
  tasks: Task[];
}

interface Member {
  id: number;
  groupId: number;
  userId: string;
  role: string;
  level: number;
  user: User;
}

interface DummyDataType {
  message: string;
  Data: Group[];
}
interface TaskTableProps {
  tasks: Task[];
}


interface UserComponentProps {
  user: User;
  groupId: number;
  level?: number;
}

const UserComponent = ({ user, groupId, level = 1 }: UserComponentProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div key={user.id} className="mb-6 rounded-lg overflow-hidden bg-white">
      {/* User Header */}
      <div 
        className="flex justify-between items-center p-4 bg-blue-50 border-b-2 border-[#A4C7FF] cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center space-x-2">
          {user.parentUsers && user.parentUsers.length > 0 && (
            <button className="rounded-full p-1 hover:bg-blue-100">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          <span className="font-medium">{user.name}</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {user.role}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {user.parentUsers?.length || 0} Sub Users
        </div>
      </div>
      
      {/* If this user has tasks, show them */}
      {user.tasks && user.tasks.length > 0 && (
        <div className="p-4 border-b border-gray-300 mb-6 bg-white">
          <h4 className="font-medium mb-2">Tasks</h4>
          <TaskTable tasks={user.tasks} />
        </div>
      )}
      
      {/* If this user has sub-users and is expanded, show them */}
      {expanded && user.parentUsers && user.parentUsers.length > 0 && (
        <div className="ml-6 mt-2 bg-white">
          {user.parentUsers.map((subUserRelation) => (
            <UserComponent 
              key={subUserRelation.id} 
              user={subUserRelation.user} 
              groupId={groupId} 
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Task Table Component


const TaskTable = ({ tasks }: TaskTableProps) => {
  if (!tasks || tasks.length === 0) return <p className="text-gray-500 text-sm">No tasks assigned</p>;

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'InProgress': return 'bg-blue-100 text-blue-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Table className="text-black bg-white ">
      <TableHeader className="bg-white text-black">
        <TableRow className=" text-black  hover:bg-white">
          <TableHead className=" text-black px-3 font-semibold py-2 text-left">Task Name</TableHead>
          <TableHead className=" px-3 text-black py-2 font-semibold text-left">Priority</TableHead>
          <TableHead className=" px-3 text-black py-2 font-semibold text-left">Deadline</TableHead>
          <TableHead className=" px-3 text-black py-2 font-semibold text-left">Status</TableHead>
          <TableHead className=" px-3 text-black font-semibold py-2 text-left">Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="">
        {tasks.map((task: Task) => (
          <TableRow key={task.id} className="border border-black rounded-xl even:bg-gray-50">
            <TableCell className="border border-black px-3 py-3  font-medium">
              {task.TaskName}
            </TableCell>
            <TableCell className="border border-black px-3 py-2">
              <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.Priority)}`}>
                {task.Priority}
              </span>
            </TableCell>
            <TableCell className="border border-black font-medium px-3 py-2">
              {formatDate(task.DeadLine)}
            </TableCell>
            <TableCell className="border border-black px-3 py-2">
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.Status)}`}>
                {task.Status}
              </span>
            </TableCell>
            <TableCell className="border border-black px-3 py-2 text-gray-500 text-sm">
              {formatDate(task.CreatedAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const dummyData: DummyDataType = {
    message: "Groups fetched successfully",
    Data: [
      {
        id: 19,
        name: "CFO GROUP",
        ownerId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
        createdAt: "2025-02-12T09:04:34.875Z",
        members: [
          {
            id: 24,
            groupId: 19,
            userId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
            role: "creator",
            level: 1,
            user: {
              id: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
              name: "Kinshuk",
              role: "creator",
              email: "kinshukbageja@gmail.com",
              password: "$2b$10$Dz8JWwinEYvj58d2nQlKye0Lu5lMbEnFrzGmOUAhEp4gQe5.seLKu",
              createdAt: "2025-02-10T16:57:03.691Z",
              tasks: [],
              parentUsers: [
                {
                  id: 15,
                  parentId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
                  userId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                  groupId: 19,
                  role: "subUser",
                  level: 2,
                  user: {
                    id: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                    name: "Kb",
                    role: "subUser",
                    email: "kbdeveloper04@gmail.com",
                    password: "$2b$10$nwfWc//1vMef.U2tCMiFd.gIx0Rfm3jMtdBXbc1XXRcvk84svNhom",
                    createdAt: "2025-02-10T16:57:56.747Z",
                    tasks: [],
                  },
                },
              ],
            },
          },
          {
            id: 28,
            groupId: 19,
            userId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
            role: "member",
            level: 2,
            user: {
              id: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
              name: "Kb",
              role: "member",
              email: "kbdeveloper04@gmail.com",
              password: "$2b$10$nwfWc//1vMef.U2tCMiFd.gIx0Rfm3jMtdBXbc1XXRcvk84svNhom",
              createdAt: "2025-02-10T16:57:56.747Z",
              tasks: [],
              parentUsers: [],
            },
          },
        ],
        tasks: [],
      },
      {
        id: 20,
        name: "CTO GROUP",
        ownerId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
        createdAt: "2025-02-12T18:07:51.633Z",
        members: [
          {
            id: 26,
            groupId: 20,
            userId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
            role: "creator",
            level: 1,
            user: {
              id: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
              name: "Kinshuk",
              role: "creator",
              email: "kinshukbageja@gmail.com",
              password: "$2b$10$Dz8JWwinEYvj58d2nQlKye0Lu5lMbEnFrzGmOUAhEp4gQe5.seLKu",
              createdAt: "2025-02-10T16:57:03.691Z",
              tasks: [
                {
                  id: 3,
                  userId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
                  parentId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
                  groupId: 20,
                  TaskName: "Enhance Navbar UI",
                  Priority: "Low",
                  DeadLine: "2025-02-15T23:59:59.000Z",
                  Status: "Completed",
                  UpdatedAt: "2025-02-13T07:13:36.530Z",
                  CreatedAt: "2025-02-11T13:03:33.000Z"
                },
              ],
              parentUsers: [
                {
                  id: 14,
                  parentId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
                  userId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                  groupId: 20,
                  role: "subUser",
                  level: 2,
                  user: {
                    id: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                    name: "Kb",
                    role: "subUser",
                    email: "kbdeveloper04@gmail.com",
                    password: "$2b$10$nwfWc//1vMef.U2tCMiFd.gIx0Rfm3jMtdBXbc1XXRcvk84svNhom",
                    createdAt: "2025-02-10T16:57:56.747Z",
                    tasks: [
                      {
                        id: 1,
                        userId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                        parentId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
                        groupId: 20,
                        TaskName: "Complete API Development",
                        Priority: "High",
                        DeadLine: "2025-02-15T23:59:59.000Z",
                        Status: "Blocked",
                        UpdatedAt: "2025-02-13T07:23:43.673Z",
                        CreatedAt: "2025-02-10T13:03:33.000Z"
                      },
                      {
                        id: 3,
                        userId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                        parentId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
                        groupId: 20,
                        TaskName: "Enhance Navbar UI",
                        Priority: "Low",
                        DeadLine: "2025-02-15T23:59:59.000Z",
                        Status: "Completed",
                        UpdatedAt: "2025-02-13T07:13:36.530Z",
                        CreatedAt: "2025-02-11T13:03:33.000Z"
                      },
                      {
                        id: 4,
                        userId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                        parentId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
                        groupId: 20,
                        TaskName: "Enhance Footer Development",
                        Priority: "Low",
                        DeadLine: "2025-02-16T23:59:59.000Z",
                        Status: "InProgress",
                        UpdatedAt: "2025-02-13T12:15:49.961Z",
                        CreatedAt: "2025-02-10T13:03:33.000Z"
                      },
                      {
                        id: 5,
                        userId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                        parentId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
                        groupId: 20,
                        TaskName: "Complete the Remaining Mailing Controller",
                        Priority: "High",
                        DeadLine: "2025-02-14T23:59:59.000Z",
                        Status: "InProgress",
                        UpdatedAt: "2025-02-13T12:29:19.613Z",
                        CreatedAt: "2025-02-12T13:03:33.000Z"
                      }
                    ],
                    parentUsers: [
                      {
                        id: 24,
                        parentId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                        userId: "0b7b210a-662e-442d-83ca-b8ca1fdfdfd",
                        groupId: 20,
                        role: "subUser",
                        level: 2,
                        user: {
                          id: "0b7b210a-662e-442d-83ca-b8ca1fdfdfd",
                          name: "Kb2",
                          email: "kbdeveloper04@gmail.com",
                          role: "subUser",
                          password: "$2b$10$nwfWc//1vMef.U2tCMiFd.gIx0Rfm3jMtdBXbc1XXRcvk84svNhom",
                          createdAt: "2025-02-10T16:57:56.747Z",
                          tasks: [
                            {
                              id: 15,
                              userId: "0b7b210a-662e-442d-83ca-b8ca1fdfdfd",
                              parentId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                              groupId: 20,
                              TaskName: "Complete API Development",
                              Priority: "High",
                              DeadLine: "2025-02-15T23:59:59.000Z",
                              Status: "Blocked",
                              UpdatedAt: "2025-02-13T07:23:43.673Z",
                              CreatedAt: "2025-02-10T13:03:33.000Z"
                            },
                          ],
                        },
                      },
                    ]
                  },
                },
              ],
            },
          }, 
          {
            id: 27,
            groupId: 20,
            userId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
            role: "subUser",
            level: 2,
            user: {
              id: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
              name: "Kb",
              role: "subUser",
              email: "kbdeveloper04@gmail.com",
              password: "$2b$10$nwfWc//1vMef.U2tCMiFd.gIx0Rfm3jMtdBXbc1XXRcvk84svNhom",
              createdAt: "2025-02-10T16:57:56.747Z",
              tasks: [
                {
                  id: 1,
                  userId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                  parentId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
                  groupId: 20,
                  TaskName: "Complete API Development",
                  Priority: "High",
                  DeadLine: "2025-02-15T23:59:59.000Z",
                  Status: "Blocked",
                  UpdatedAt: "2025-02-13T07:23:43.673Z",
                  CreatedAt: "2025-02-10T13:03:33.000Z"
                },
                {
                  id: 3,
                  userId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                  parentId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
                  groupId: 20,
                  TaskName: "Enhance Navbar UI",
                  Priority: "Low",
                  DeadLine: "2025-02-15T23:59:59.000Z",
                  Status: "Completed",
                  UpdatedAt: "2025-02-13T07:13:36.530Z",
                  CreatedAt: "2025-02-11T13:03:33.000Z"
                },
                {
                  id: 4,
                  userId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                  parentId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
                  groupId: 20,
                  TaskName: "Enhance Footer Development",
                  Priority: "Low",
                  DeadLine: "2025-02-16T23:59:59.000Z",
                  Status: "InProgress",
                  UpdatedAt: "2025-02-13T12:15:49.961Z",
                  CreatedAt: "2025-02-10T13:03:33.000Z"
                },
                {
                  id: 5,
                  userId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                  parentId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
                  groupId: 20,
                  TaskName: "Complete the Remaining Mailing Controller",
                  Priority: "High",
                  DeadLine: "2025-02-14T23:59:59.000Z",
                  Status: "InProgress",
                  UpdatedAt: "2025-02-13T12:29:19.613Z",
                  CreatedAt: "2025-02-12T13:03:33.000Z"
                }
              ],
              parentUsers: [
                {
                  id: 24,
                  parentId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                  userId: "0b7b210a-662e-442d-83ca-b8ca1fdfdfd",
                  groupId: 20,
                  role: "subUser",
                  level: 2,
                  user: {
                    id: "0b7b210a-662e-442d-83ca-b8ca1fdfdfd",
                    name: "Kb2",
                    email: "kbdeveloper04@gmail.com",
                    role: "subUser",
                    password: "$2b$10$nwfWc//1vMef.U2tCMiFd.gIx0Rfm3jMtdBXbc1XXRcvk84svNhom",
                    createdAt: "2025-02-10T16:57:56.747Z",
                    tasks: [
                      {
                        id: 15,
                        userId: "0b7b210a-662e-442d-83ca-b8ca1fdfdfd",
                        parentId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                        groupId: 20,
                        TaskName: "Complete API Development",
                        Priority: "High",
                        DeadLine: "2025-02-15T23:59:59.000Z",
                        Status: "Blocked",
                        UpdatedAt: "2025-02-13T07:23:43.673Z",
                        CreatedAt: "2025-02-10T13:03:33.000Z"
                      },
                    ],
                  },
                },
              ]
            }
          },
          {
            id: 29,
            groupId: 20,
            userId: "0b7b210a-662e-442d-83ca-b8ca1fdfdfd",
            role: "subUser",
            level: 2,
            user: {
              id: "0b7b210a-662e-442d-83ca-b8ca1fdfdfd",
              name: "Kb2",
              role: "subUser",
              email: "kbdeveloper04@gmail.com",
              password: "$2b$10$nwfWc//1vMef.U2tCMiFd.gIx0Rfm3jMtdBXbc1XXRcvk84svNhom",
              createdAt: "2025-02-10T16:57:56.747Z",
              tasks: [
                {
                  id: 15,
                  userId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                  parentId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
                  groupId: 20,
                  TaskName: "Complete API Development",
                  Priority: "High",
                  DeadLine: "2025-02-15T23:59:59.000Z",
                  Status: "Blocked",
                  UpdatedAt: "2025-02-13T07:23:43.673Z",
                  CreatedAt: "2025-02-10T13:03:33.000Z"
                },
                {
                  id: 34,
                  userId: "0b7b210a-662e-442d-83ca-b8ca1f297b7f",
                  parentId: "4ed532fc-d37c-49b9-9db9-b1a02a235714",
                  groupId: 20,
                  TaskName: "Enhance Navbar UI",
                  Priority: "Low",
                  DeadLine: "2025-02-15T23:59:59.000Z",
                  Status: "Completed",
                  UpdatedAt: "2025-02-13T07:13:36.530Z",
                  CreatedAt: "2025-02-11T13:03:33.000Z"
                },
              ],
              parentUsers: [
              ]
            }
          }
        ],
        tasks: [],
      },
    ],
  };

  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openGroups, setOpenGroups] = useState<number[]>([]);
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
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
        <div className="w-64 h-screen bg-gray-900 border-r border-gray-700 shadow-lg flex flex-col">
          <div className="p-4 border-b border-gray-700 bg-gray-800">
            <h2 className="text-lg font-semibold text-white tracking-wide">Groups</h2>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {dummyData.Data.map((group) => (                   
              <div key={group.id} className="px-2 py-1.5 border-b border-gray-800">
                <button 
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between text-gray-200 hover:bg-gray-800 rounded-md py-1.5 px-3 transition-colors duration-200"
                >                       
                  <span className="font-medium tracking-wide">{group.name}</span>                       
                  {expandedGroups[group.id] ? (
                    <ChevronUp size={16} className="text-cyan-400" />
                  ) : (
                    <ChevronDown size={16} className="text-cyan-400" />
                  )}
                </button>                     
                {expandedGroups[group.id] && (                       
                  <div className="pl-3 mt-1 border-l border-gray-700 ml-2">                          
                    {group.members
                      .filter((member) => member.level === 1)
                      .map((member) => (                             
                        <div key={member.user.id} className="mb-1">
                          <button 
                            onClick={() => setOpenUsers(prev => prev.includes(member.user.id) ? prev.filter(id => id !== member.user.id) : [...prev, member.user.id])}
                            className="w-full flex items-center justify-between text-gray-300 hover:bg-gray-800 rounded py-1.5 px-2 text-sm transition-colors duration-200"
                          >                                 
                            <span className="text-gray-300">{member.user.name}</span>                                 
                            {member.user.parentUsers && member.user.parentUsers.length > 0 &&
                              (openUsers.includes(member.user.id) ? (
                                <ChevronUp size={14} className="text-gray-500" />
                              ) : (
                                <ChevronDown size={14} className="text-gray-500" />
                              ))
                            }
                          </button>
                          {openUsers.includes(member.user.id) &&
                            member.user.parentUsers && 
                            member.user.parentUsers.length > 0 && (                                   
                              <div className="pl-4 py-1">                                      
                                {member.user.parentUsers.map((parentUser) => (                                       
                                  <div key={parentUser.user.id} className="flex items-center py-1 px-2 text-xs text-gray-400 hover:bg-gray-800 rounded">
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
          backgroundColor: "white"
        }}
        onClick={handleContentClick}
      >
        <div className="relative z-10 left-[5%]">
          <h1 className="text-4xl font-bold mb-10">Dashboard</h1>
          <div className="space-y-6">
            {dummyData?.Data && dummyData.Data.length > 0 ? (
              dummyData.Data.map(group => (
                <Card key={group.id} className="shadow-md w-[90%] rounded-lg border-t-4 border-t-[#A4C7FF] text-black bg-white">
                  <CardHeader className="bg-white">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center space-x-2">
                        <span>{group.name}</span>
                      </CardTitle>
                      <div className="text-sm flex gap-16 mx-4 font-medium italic text-black">
                        <div>Created: {formatDate(group.createdAt)}</div>
                        <div> Members: {group.members.length}</div> 
                        <button 
                          onClick={() => toggleGroup(group.id)} 
                          className="rounded-full px-1 "
                        >
                          {expandedGroups[group.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>    
                      </div>
                    </div>
                  </CardHeader>
                  {expandedGroups[group.id] && (
                    <CardContent className="pt-6 text-black bg-white">
                      {group.members
                        .filter(member => member.level === 1)
                        .map(member => (
                          <UserComponent 
                            key={member.id} 
                            user={member.user} 
                            groupId={group.id} 
                          />
                        ))}
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" size="lg" className="flex bg-blue-600 rounded-xl text-white font-bold items-center">
                          <Plus size={16} className="mr-1" /> Add User
                        </Button>
                        <Button variant="outline" size="lg" className="flex bg-blue-600 rounded-xl text-white font-bold items-center">
                          Assign Task
                        </Button>
                        <Button variant="outline" size="lg" className="flex bg-blue-600 rounded-xl text-white font-bold items-center">
                          <Minus size={16} className="mr-1" /> Remove
                        </Button>
                        <Button variant="outline" size="lg" className="flex bg-blue-600 rounded-xl text-white font-bold items-center">
                          <Save size={16} className="mr-1" /> Save Changes
                        </Button>
                      </div>
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