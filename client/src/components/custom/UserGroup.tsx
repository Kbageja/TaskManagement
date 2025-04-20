import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState } from "react";
import TaskTable from "./TaskTable";
import { useDeleteSubUser } from "@/services/groups/mutations";

interface UserComponentProps {
  user: User;
  groupId: number;
  role: string;
  parentId?: string; // Add optional parentId parameter
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
  parentUsers?: ParentUser[];
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

const UserComponent = ({ user, role, groupId, parentId, level = 1 }: UserComponentProps) => {
  const [expanded, setExpanded] = useState(false);
  console.log(user, "userComponent");
  
  // Generate component key
  const componentKey = `${parentId ? parentId + '-' : ''}${user.id}`;
  const dataParentId = parentId || 'root';
  
  const toggleExpanded = () => {
    // Log component key and data-parent-id when expanding/collapsing
   
    
    setExpanded(!expanded);
  };

  const { mutate: deleteSubUserMutation } = useDeleteSubUser();

  // Handle delete user
  const handleDelete = (e: React.MouseEvent) => {
    console.log(groupId,"handleDelete");
    e.stopPropagation();
    deleteSubUserMutation({ 
      groupId, 
      parentId: parentId || "", 
      subUserId: user.id 
    });
    
    // Here you would add the actual delete functionality
    // For example: deleteUserMutation({ userId: user.id, parentId });
  };

  return (
    <div 
      key={componentKey}
      className="mb-6 rounded-lg overflow-hidden bg-white"
      data-parent-id={dataParentId}
    >
      {/* User Header */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-blue-50 border-b-2 border-[#A4C7FF] cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center space-x-2">
          <span className="font-medium">{user.name || ""}</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {role}
          </span>
        </div>
        <div className="flex gap-4 sm:gap-14 mt-2 sm:mt-0 items-center">
          <div className="text-sm text-gray-500">
            Sub Users: {user.parentUsers?.length || 0}
          </div>
          <div className="flex items-center space-x-2">
            {user.parentUsers && user.parentUsers.length > 0 && (
              <button 
                className="rounded-full p-1 hover:bg-blue-100"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded();
                }}
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
            <button 
              className="rounded-full p-1 hover:bg-red-100 text-red-600"
              onClick={handleDelete}
              title="Delete user"
            >
              <Trash2 size={16} />
            </button>
          </div>
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
          {user.parentUsers.map((subUserRelation) => {
            return (
              <UserComponent
                key={`${user.id}-${subUserRelation.user.id}`}
                user={subUserRelation.user}
                role={subUserRelation.role}
                groupId={groupId}
                parentId={user.id} // Pass current user's ID as the parentId
                level={level + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserComponent;