
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
  } from "@/components/ui/table";


  interface TaskTableProps {
    tasks: Task[];
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

 const TaskTable = ({ tasks }: TaskTableProps) => {
    if (!tasks || tasks.length === 0)
      return <p className="text-gray-500 text-sm">No tasks assigned</p>;
  
    const formatDate = (dateString: string) => {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };
  
    const getStatusColor = (status: string) => {
      switch (status) {
        case "Completed":
          return "bg-green-100 text-green-800";
        case "InProgress":
          return "bg-blue-100 text-blue-800";
        case "Blocked":
          return "bg-red-100 text-red-800";
        case "Pending":
          return "bg-yellow-100 text-yellow-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };
  
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case "High":
          return "bg-red-100 text-red-800";
        case "Medium":
          return "bg-orange-100 text-orange-800";
        case "Low":
          return "bg-green-100 text-green-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };
  
    return (
      <div className="overflow-x-auto"> 
        <Table className="text-black bg-white min-w-[600px]"> 
          <TableHeader className="bg-white text-black">
            <TableRow className="text-black hover:bg-white">
              <TableHead className="text-black px-3 font-semibold py-2 text-left">
                Task Name
              </TableHead>
              <TableHead className="px-3 text-black py-2 font-semibold text-left">
                Priority
              </TableHead>
              <TableHead className="px-3 text-black py-2 font-semibold text-left">
                Deadline
              </TableHead>
              <TableHead className="px-3 text-black py-2 font-semibold text-left">
                Status
              </TableHead>
              <TableHead className="px-3 text-black font-semibold py-2 text-left">
                Created
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {tasks.map((task: Task) => (
              <TableRow
                key={task.id}
                className="border border-black even:bg-gray-50">
                <TableCell className="border border-black px-3 py-3 font-medium">
                  {task.TaskName}
                </TableCell>
                <TableCell className="border border-black px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${getPriorityColor(
                      task.Priority
                    )}`}>
                    {task.Priority}
                  </span>
                </TableCell>
                <TableCell className="border border-black font-medium px-3 py-2">
                  {formatDate(task.DeadLine)}
                </TableCell>
                <TableCell className="border border-black px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(
                      task.Status
                    )}`}>
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
      </div>
    );
  };

  export default TaskTable;