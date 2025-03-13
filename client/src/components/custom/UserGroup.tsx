import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import TaskTable from "./TaskTable";


interface UserComponentProps {
    user: User;
    groupId: number;
    role:String;
    level?: number;
  }

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
  

const UserComponent = ({ user,role, groupId, level = 1 }: UserComponentProps) => {
    const [expanded, setExpanded] = useState(false);
  
    const toggleExpanded = () => {
      setExpanded(!expanded);
    };
  
    return (
      <div key={user.id} className="mb-6 rounded-lg overflow-hidden bg-white">
        {/* User Header */}
        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-blue-50 border-b-2 border-[#A4C7FF] cursor-pointer"
          onClick={toggleExpanded}
        >
          <div className="flex items-center space-x-2">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {role}
            </span>
          </div>
          <div className="flex gap-4 sm:gap-14 mt-2 sm:mt-0">
            <div className="text-sm text-gray-500">
              Sub Users: {user.parentUsers?.length || 0}
            </div>
            {user.parentUsers && user.parentUsers.length > 0 && (
              <button className="rounded-full p-1 hover:bg-blue-100">
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
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
          <div className="ml-2 sm:ml-6 mt-2 bg-white">
            {user.parentUsers.map((subUserRelation) => (
              <UserComponent
                key={subUserRelation.id}
                user={subUserRelation.user}
                role ={subUserRelation.role}
                groupId={groupId}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  export default UserComponent;