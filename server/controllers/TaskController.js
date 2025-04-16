import { sendMessage } from "../middleware/message.js";
import { sendData } from "../middleware/sendData.js";
import prisma from "../data/database.js";
import { sendEmailNotification } from "../utils/transporter.js";

// import nodemailer from "nodemailer";
// import { taskAssignedTemplate } from "../utils/emailTemplate.js";
export const createTask = async (req, res) => {
    try {
        const { TaskName, Priority, DeadLine, Status, groupId, Partners, userId } = req.body;
        const parentId =  req.user.id;
        const GroupId = parseInt(groupId);

        if (!TaskName || !Priority || !DeadLine || !Status || !GroupId || !parentId || !userId) {
            return sendMessage({ status: 400, message: "All fields are required" })(req, res);
        }

        // Fetch assigned user details
        const assignedUser = await prisma.groupMembers.findFirst({
            where: { groupId:GroupId, userId },
            select: { userId: true, level: true, user: { select: { email: true, name: true } } }
        });

        if (!assignedUser) {
            return res.status(400).json({ success: false, message: "Assigned user is not part of the group" });
        }

        // Fetch parent user details
        const parentUser = await prisma.groupMembers.findFirst({
            where: { groupId:GroupId, userId: parentId },
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
                groupId:GroupId,
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
export const getUserAllTasks = async (req, res) => {
    try {
        const { userId } = req.params;
        if(userId==undefined){
            return res.status(404).message("User Not Selected");
        }
        const { startDate, endDate, status, priority } = req.query; // Optional filters
        console.log(userId,"userid")
        console.log(req.query,"TaskQuery");

        let filters = {
            userId: userId,
        };

        // Apply Date Filter (if provided)
        if (startDate && endDate) {
            filters.CreatedAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        // Apply Status Filter (if provided)
        if (status) {
            filters.Status = status;
        }

        // Apply Priority Filter (if provided)
        if (priority) {
            filters.Priority = priority;
        }

        console.log(filters,"Filters")

        // Fetch tasks based on filters
        const tasks = await prisma.tasks.findMany({
            where: filters,
        });

        console.log(tasks,"Tasks");

        return sendData({
            status: 200,
            message: "Tasks fetched successfully",
            Data: tasks,
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
        const { id:taskId,TaskName, Priority, DeadLine, Status } = req.body;
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
// Get task analytics (group-wise & collective)
export const getTaskAnalytics = async (req, res) => {
    try {
        const { userId } = req.params; // Get userId from URL params

        // Fetch all tasks assigned to the user
        const tasks = await prisma.tasks.findMany({
            where: { userId:userId },
        });

        if (!tasks.length) {
            return res.status(404).json({ message: "No tasks found for this user" });
        }

        // Group tasks by groupId
        const groupedTasks = tasks.reduce((acc, task) => {
            if (!acc[task.groupId]) acc[task.groupId] = [];
            acc[task.groupId].push(task);
            return acc;
        }, {});

        let collectiveStats = {
            totalTasks: tasks.length,
            completedTasks: 0,
            onTimeTasks: 0,
            delayedTasks: 0,
            avgCompletionTime: 0,
        };

        let groupWiseStats = {};

        Object.keys(groupedTasks).forEach(groupId => {
            const groupTasks = groupedTasks[groupId];
            const completedTasks = groupTasks.filter(task => task.Status === "Completed");
            const delayedTasks = completedTasks.filter(task => new Date(task.UpdatedAt) > new Date(task.DeadLine));
            const onTimeTasks = completedTasks.length - delayedTasks.length;

            const avgCompletionTime = completedTasks.reduce((sum, task) => {
                return sum + (new Date(task.UpdatedAt) - new Date(task.CreatedAt));
            }, 0) / (completedTasks.length || 1);

            groupWiseStats[groupId] = {
                totalTasks: groupTasks.length,
                completedTasks: completedTasks.length,
                onTimeTasks,
                delayedTasks: delayedTasks.length,
                avgCompletionTime: avgCompletionTime / (1000 * 60 * 60), // Convert to hours
            };

            // Update collective statistics
            collectiveStats.completedTasks += completedTasks.length;
            collectiveStats.onTimeTasks += onTimeTasks;
            collectiveStats.delayedTasks += delayedTasks.length;
            collectiveStats.avgCompletionTime += avgCompletionTime;
        });

        // Normalize average completion time for collective stats
        collectiveStats.avgCompletionTime /= Object.keys(groupWiseStats).length || 1;
        collectiveStats.avgCompletionTime /= (1000 * 60 * 60); // Convert to hours

        return res.status(200).json({ collectiveStats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
// Get productivity trends (group-wise & collective)
export const getProductivityTrends = async (req, res) => {
    try {
        // Debug all request information
        console.log("Full request received:", {
            params: req.params,
        });
        
        // The issue is likely here - you're using req.params but the userId is in req.query
        const paramsUserId = req.params.userId;

        
        // Use the userId from query params instead of route params
        const userId =  paramsUserId;
        
        console.log("Final userId being used:", userId);
        
        if (!userId) {
            console.log("No userId provided in request");
            return res.status(400).json({ message: "userId is required" });
        }

        // Fetch tasks completed by the user
        console.log("Querying database for tasks with userId:", userId);
        const tasks = await prisma.tasks.findMany({
            where: { userId: userId, Status: "Completed" },
        });
        
        console.log(`Found ${tasks.length} completed tasks for user`);
        
        if (!tasks.length) {
            console.log("No completed tasks found for user:", userId);
            return res.status(200).json({ message: "No completed tasks found" });
        }

        let collectiveTrends = {};
        let groupWiseTrends = {};

        tasks.forEach(task => {
            console.log("Processing task:", {
                id: task.id,
                updatedAt: task.UpdatedAt,
                groupId: task.groupId
            });
            
            const month = new Date(task.UpdatedAt).getMonth() + 1;
            const groupId = task.groupId;

            // Update collective trends
            collectiveTrends[month] = (collectiveTrends[month] || 0) + 1;

            // Update group-wise trends
            if (!groupWiseTrends[groupId]) groupWiseTrends[groupId] = {};
            groupWiseTrends[groupId][month] = (groupWiseTrends[groupId][month] || 0) + 1;
        });

        const response = { collectiveTrends, groupWiseTrends };
        console.log("Final response data:", response);
        
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error in getProductivityTrends:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
// Get peak working hours (group-wise & collective)
export const getPeakHours = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch tasks completed by the user
        const tasks = await prisma.tasks.findMany({
            where: { userId: userId, Status: "Completed" },
        });

        if (!tasks.length) {
            return res.status(200).json({ message: "No completed tasks found" });
        }

        let collectivePeakHours = {};
        let groupWisePeakHours = {};

        tasks.forEach(task => {
            const hour = new Date(task.UpdatedAt).getHours();
            const groupId = task.groupId;
            // Update collective peak hours
            collectivePeakHours[hour] = (collectivePeakHours[hour] || 0) + 1;
            // Update group-wise peak hours
            if (!groupWisePeakHours[groupId]) groupWisePeakHours[groupId] = {};
            groupWisePeakHours[groupId][hour] = (groupWisePeakHours[groupId][hour] || 0) + 1;
        });

        return res.status(200).json({ collectivePeakHours, groupWisePeakHours });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

