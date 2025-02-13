import { sendMessage } from "../middleware/message.js";
import { sendData } from "../middleware/sendData.js";
import prisma from "../data/database.js";
import { sendEmailNotification } from "../utils/transporter.js";

// import nodemailer from "nodemailer";
// import { taskAssignedTemplate } from "../utils/emailTemplate.js";
export const createTask = async (req, res) => {
    try {
        const { TaskName, Priority, DeadLine, Status, groupId, Partners, parentId, userId } = req.body;

        if (!TaskName || !Priority || !DeadLine || !Status || !groupId || !parentId || !userId) {
            return sendMessage({ status: 400, message: "All fields are required" })(req, res);
        }

        // Fetch assigned user details
        const assignedUser = await prisma.groupMembers.findFirst({
            where: { groupId, userId },
            select: { userId: true, level: true, user: { select: { email: true, name: true } } }
        });

        if (!assignedUser) {
            return res.status(400).json({ success: false, message: "Assigned user is not part of the group" });
        }

        // Fetch parent user details
        const parentUser = await prisma.groupMembers.findFirst({
            where: { groupId, userId: parentId },
            select: { userId: true, level: true }
        });

        if (!parentUser) {
            return res.status(400).json({ success: false, message: "Parent user is not part of the group" });
        }

        // Ensure parent's level is strictly less than assigned user's level
        if (parentUser.level >= assignedUser.level) {
            return res.status(400).json({ success: false, message: "Parent's level must be strictly less than assigned user's level" });
        }

        // Create the task
        const task = await prisma.tasks.create({
            data: {
                TaskName,
                Priority,
                DeadLine: new Date(DeadLine),
                Status,
                userId,
                parentId,
                groupId,
                Partners: {
                    connect: Partners?.map(partnerId => ({ id: partnerId })) || []
                }
            },
        });

        // Send email notification
        await sendEmailNotification(assignedUser.user.email, task);

        return sendMessage({
            status: 201,
            message: "Task created successfully",
            data: task,
        })(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
export const getUserTasks = async (req, res) => {
    try {
        const {groupId } = req.params; // Assuming userId and groupId are passed in the request parameters
        const userId = req.user.id;

        // Fetch tasks based on userId and groupId
        const tasks = await prisma.tasks.findMany({
            where: {
                userId: userId,
                groupId: parseInt(groupId), // Ensure groupId is an integer
            },
        });

        // Define a priority mapping for sorting purposes
        const priorityOrder = {
            Low: 1,
            High: 3,
        };

        // Sort tasks first by DeadLine (ascending) and then by Priority (using priorityOrder)
        const sortedTasks = tasks.sort((a, b) => {
            // Sort by DeadLine first (ascending)
            if (new Date(a.DeadLine) < new Date(b.DeadLine)) return -1;
            if (new Date(a.DeadLine) > new Date(b.DeadLine)) return 1;

            // If DeadLine is the same, sort by Priority
            return priorityOrder[b.Priority] - priorityOrder[a.Priority];
        });

        return sendData({
            status: 200,
            message: "Tasks fetched successfully",
            Data: sortedTasks,
        })(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.id;

        // Fetch task details
        const task = await prisma.tasks.findUnique({
            where: { id: parseInt(taskId) },
            select: { userId: true, groupId: true }
        });

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        // Fetch deleting user's level
        const deletingUser = await prisma.groupMembers.findFirst({
            where: { groupId: task.groupId, userId },
            select: { level: true }
        });
        if (!deletingUser) {
            return res.status(403).json({ success: false, message: "User not part of the group" });
        }

        // Fetch assigned user's level
        const assignedUser = await prisma.groupMembers.findFirst({
            where: { groupId: task.groupId, userId: task.userId },
            select: { level: true }
        });
        if (!assignedUser) {
            return res.status(403).json({ success: false, message: "Assigned user not part of the group" });
        }

        // Ensure deleting user's level is strictly less than assigned user's level
        if (deletingUser.level >= assignedUser.level) {
            return res.status(403).json({ success: false, message: "You do not have permission to delete this task" });
        }

        // Delete task
        await prisma.tasks.delete({ where: { id: parseInt(taskId) } });

        return sendMessage({ status: 200, message: "Task deleted successfully" })(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { TaskName, Priority, DeadLine, Status } = req.body;
        const userId = req.user.id;

        // Fetch task details
        const task = await prisma.tasks.findUnique({
            where: { id: parseInt(taskId) },
            select: { userId: true, groupId: true }
        });

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        // Fetch updating user's level
        const updatingUser = await prisma.groupMembers.findFirst({
            where: { groupId: task.groupId, userId },
            select: { level: true }
        });

        if (!updatingUser) {
            return res.status(403).json({ success: false, message: "User not part of the group" });
        }

        // Fetch assigned user's level
        const assignedUser = await prisma.groupMembers.findFirst({
            where: { groupId: task.groupId, userId: task.userId },
            select: { level: true }
        });

        if (!assignedUser) {
            return res.status(403).json({ success: false, message: "Assigned user not part of the group" });
        }

        // Check permissions
        if (updatingUser.level > assignedUser.level) {
            return res.status(403).json({ success: false, message: "You do not have permission to update this task" });
        }

        let updateData = {};
        let isOnlyStatusUpdate = false;

        if (updatingUser.level < assignedUser.level) {
            // If the updating user has a strictly lower level, they can update everything
            updateData = {
                TaskName: TaskName || task.TaskName,
                Priority: Priority || task.Priority,
                DeadLine: DeadLine ? new Date(DeadLine) : task.DeadLine,
                Status: Status || task.Status,
            };
        } else if (updatingUser.level === assignedUser.level) {
            // If the updating user has the same level, they can only update Status
            if (Status) {
                updateData = { Status };
                isOnlyStatusUpdate = true;
            } else {
                return res.status(400).json({ success: false, message: "You can only update the Status field" });
            }
        }

        // Update task
        const updatedTask = await prisma.tasks.update({
            where: { id: parseInt(taskId) },
            data: updateData
        });

        return sendMessage({
            status: 200,
            message: isOnlyStatusUpdate ? "Task status updated successfully" : "Task updated successfully",
            data: updatedTask,
        })(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};