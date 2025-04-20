// utils/taskUtils.ts
import { UpdatedTask } from "@/types/tasks";

// Task interface
export interface Task {
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

// Conversion function
export function convertToTask(updatedTask: UpdatedTask): Task {
  return {
    id: updatedTask.id,
    TaskName: updatedTask.TaskName,
    Priority: updatedTask.Priority,
    DeadLine: String(updatedTask.DeadLine),
    Status: updatedTask.Status,
    groupId: updatedTask.groupId,
    userId: updatedTask.userId,
    parentId: updatedTask.parentId,
    CreatedAt: String(updatedTask.CreatedAt),
    UpdatedAt: String(updatedTask.UpdatedAt),
  };
}