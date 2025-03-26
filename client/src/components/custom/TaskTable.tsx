"use client"
import React, { useState, useEffect } from 'react';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Pencil, Save } from "lucide-react"; 
import { useUpdateTask } from '@/services/tasks/mutations';
import { UpdatedTask } from '@/types/tasks';
import { useToast } from '@/hooks/use-toast';


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

interface TaskTableProps {
    tasks: Task[];
}

const TaskTable = ({ tasks }: TaskTableProps) => {
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editedTasks, setEditedTasks] = useState<{ [key: number]: Partial<Task> }>({});
    const { toast } = useToast();
    
    const updateTaskMutation = useUpdateTask();

    useEffect(() => {
        if (updateTaskMutation.isSuccess) {
            console.log('Task updated successfully', updateTaskMutation.data);
            toast({
                title: "Success",
                description: "Task updated successfully",
            });
            setEditingTaskId(null);
        }

        if (updateTaskMutation.isError) {
            console.error('Task update failed', updateTaskMutation.error);
            toast({
                title: "Error",
                description: "Failed to update task",
                variant: "destructive",
            });
        }
    }, [updateTaskMutation.isSuccess, updateTaskMutation.isError, toast]);

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

    const handleSaveClick = (task: Task) => {
        try {
            console.group('Task Save Process');
            console.log('Original Task:', task);
            
            const editedTaskData = editedTasks[task.id] || {};
            console.log('Edited Task Data:', editedTaskData);

            const updatedTask = {
                ...task,
                ...editedTaskData,
                id: task.id,
                DeadLine: editedTaskData.DeadLine 
                    ? new Date(editedTaskData.DeadLine) 
                    : new Date(task.DeadLine),
                groupId: task.groupId,
                userId: task.userId,
                parentId: task.parentId,
                createdAt: new Date(task.CreatedAt),
                updatedAt: new Date()
            };

            console.log('Prepared Update Task:', updatedTask);

            const requiredFields: (keyof Task)[] = ['TaskName', 'Priority', 'Status', 'DeadLine'];
            const missingFields = requiredFields.filter(field => 
                !updatedTask[field] || updatedTask[field] === ''
            );

            if (missingFields.length > 0) {
                console.error('Missing required fields:', missingFields);
                toast({
                    title: "Validation Error",
                    description: `Missing required fields: ${missingFields.join(', ')}`,
                    variant: "destructive"
                });
                return;
            }

            updateTaskMutation.mutate(updatedTask as UpdatedTask);
            
            console.log('Mutation called');
            console.groupEnd();
        } catch (error) {
            console.error('Error in handleSaveClick:', error);
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive"
            });
        }
    };

    const handleEditClick = (task: Task) => {
        setEditingTaskId(task.id);
        setEditedTasks(prev => ({
            ...prev,
            [task.id]: { ...task }
        }));
    };

    const handleInputChange = (taskId: number, field: keyof Task, value: string) => {
        setEditedTasks(prev => ({
            ...prev,
            [taskId]: {
                ...prev[taskId],
                [field]: value
            }
        }));
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
            case "Low":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="relative"> 
            <Table className="text-black bg-white min-w-[800px]"> 
                <TableHeader className="bg-white text-black">
                    <TableRow className="text-black hover:bg-white">
                        <TableHead className="text-black px-3 font-semibold py-2 text-left">Task Name</TableHead>
                        <TableHead className="px-3 text-black py-2 font-semibold text-left">Priority</TableHead>
                        <TableHead className="px-3 text-black py-2 font-semibold text-left">Deadline</TableHead>
                        <TableHead className="px-3 text-black py-2 font-semibold text-left">Status</TableHead>
                        <TableHead className="px-3 text-black font-semibold py-2 text-left">Created</TableHead>
                        <TableHead className="px-3 text-black font-semibold py-2 text-left">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task: Task) => (
                        <TableRow
                            key={task.id}
                            className={`border border-black even:bg-gray-50 ${
                                updateTaskMutation.isPending && updateTaskMutation.variables?.id === task.id 
                                    ? 'opacity-50' 
                                    : ''
                            }`}>
                            {/* Task Name */}
                            <TableCell className="border border-black px-3 py-3 font-medium">
                                {editingTaskId === task.id ? (
                                    <Input 
                                        value={editedTasks[task.id]?.TaskName || task.TaskName}
                                        onChange={(e) => handleInputChange(task.id, 'TaskName', e.target.value)}
                                        className="w-full"
                                        disabled={updateTaskMutation.isPending}
                                    />
                                ) : (
                                    task.TaskName
                                )}
                            </TableCell>

                            {/* Priority */}
                            <TableCell className="border border-black px-3 py-2">
                                {editingTaskId === task.id ? (
                                    <Select 
                                        value={editedTasks[task.id]?.Priority || task.Priority}
                                        onValueChange={(value) => handleInputChange(task.id, 'Priority', value)}
                                        disabled={updateTaskMutation.isPending}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${getPriorityColor(
                                            task.Priority
                                        )}`}>
                                        {task.Priority}
                                    </span>
                                )}
                            </TableCell>

                            {/* Deadline */}
                            <TableCell className="border border-black font-medium px-3 py-2">
                                {editingTaskId === task.id ? (
                                    <Input 
                                        type="date"
                                        value={editedTasks[task.id]?.DeadLine ? 
                                            new Date(editedTasks[task.id]?.DeadLine || '').toISOString().split('T')[0] : 
                                            new Date(task.DeadLine).toISOString().split('T')[0]
                                        }
                                        onChange={(e) => handleInputChange(task.id, 'DeadLine', e.target.value)}
                                        className="w-full"
                                        disabled={updateTaskMutation.isPending}
                                    />
                                ) : (
                                    formatDate(task.DeadLine)
                                )}
                            </TableCell>

                            {/* Status */}
                            <TableCell className="border border-black px-3 py-2">
                                {editingTaskId === task.id ? (
                                    <Select 
                                        value={editedTasks[task.id]?.Status || task.Status}
                                        onValueChange={(value) => handleInputChange(task.id, 'Status', value)}
                                        disabled={updateTaskMutation.isPending}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Blocked">Blocked</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                            <SelectItem value="InProgress">In Progress</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                            task.Status
                                        )}`}>
                                        {task.Status}
                                    </span>
                                )}
                            </TableCell>

                            {/* Created At */}
                            <TableCell className="border border-black px-3 py-2 text-gray-500 text-sm">
                                {formatDate(task.CreatedAt)}
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="border border-black px-3 py-2 relative">
                                {editingTaskId === task.id ? (
                                    <Button 
                                        size="sm" 
                                        onClick={() => handleSaveClick(task)}
                                        className="mr-2"
                                        disabled={updateTaskMutation.isPending}
                                    >
                                        {updateTaskMutation.isPending && updateTaskMutation.variables?.id === task.id ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <Save />
                                        )}
                                    </Button>
                                ) : (
                                    <Button 
                                        size="sm" 
                                        onClick={() => handleEditClick(task)}
                                        disabled={updateTaskMutation.isPending}
                                    >
                                        <Pencil />
                                    </Button>
                                )}
                                
                                {updateTaskMutation.isPending && updateTaskMutation.variables?.id === task.id && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {updateTaskMutation.isPending && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            )}
        </div>
    );
};

export default TaskTable;