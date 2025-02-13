import { sendMessage } from "../middleware/message.js";
import { sendData } from "../middleware/sendData.js";
import prisma from "../data/database.js";



export const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id; // User creating the group

        if (!name) {
            return sendMessage({ status: 400, message: "Group name is required" })(req, res);
        }

        // Fetch the user (owner) from the database
        const owner = await prisma.user.findUnique({ where: { id: userId } });

        if (!owner) {
            return res.status(400).json({ success: false, message: "Owner user not found" });
        }

        // Create the group
        const group = await prisma.group.create({
            data: {
                name,
                ownerId: userId, // Assign the group creator
            },
        });

        // Add the user as a member of the group with level 1
        await prisma.groupMembers.create({
            data: {
                groupId: group.id, // The newly created group's ID
                userId,            // The user who created the group
                role: "creator",    // Role is creator
                level: 1,           // Assign level 1 to creator
            },
        });

        return sendMessage({
            status: 201,
            message: "Group created successfully and user added to the group",
            data: group
        })(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
export const getAllGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        const groups = await prisma.group.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId: userId } } },
                ],
            },
            include: {
                members: {
                    include: {
                        user: {
                            include: {
                                tasks: true, // tasks of the user
                                parentUsers: {
                                    include: {
                                        user: {
                                            include: {
                                                tasks: true, // tasks of the parent user
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                tasks: true, // tasks directly related to the group
            },
        });

        // Now filter parentUsers to match the correct groupId
        const filteredGroups = groups.map((group) => ({
            ...group,
            members: group.members.map((member) => ({
                ...member,
                user: {
                    ...member.user,
                    parentUsers: member.user.parentUsers.filter(
                        (pu) => pu.groupId === group.id
                    ),
                },
            })),
        }));

        return sendData({
            status: 200,
            message: "Groups fetched successfully",
            Data: filteredGroups,
        })(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
export const deleteGroup = async (req, res) => {
    try {
        const groupId = Number(req.params.groupId);
        const userId = req.user.id; // Assuming you have user ID from authentication

        // Check if the group exists
        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }

        // Check if the user is a member of the group and retrieve their level
        const member = await prisma.groupMembers.findFirst({
            where: { groupId, userId }
        });

        if (!member) {
            return res.status(403).json({ success: false, message: "You are not a member of this group" });
        }

        if (member.level > 1) {
            return res.status(403).json({ success: false, message: "You do not have the authority to delete this group" });
        }

        // Delete members associated with the group
        await prisma.groupMembers.deleteMany({ where: { groupId } });
        
        // Delete the group itself
        await prisma.group.delete({ where: { id: groupId } });

        return res.status(200).json({ success: true, message: "Group and associated members deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error deleting group", error: error.message });
    }
};
export const createSubUser = async (req, res) => {
    try {
        const { parentId, userId, groupId, role } = req.body;

        // Ensure parent and user exist
        const parent = await prisma.user.findUnique({ where: { id: parentId } });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const group = await prisma.group.findUnique({ where: { id: groupId } });

        if (!parent || !user) {
            return res.status(400).json({ success: false, message: "Parent or user not found" });
        }

        if (!group) {
            return res.status(400).json({ success: false, message: "Group not found" });
        }

        // Get parent’s level
        const parentMember = await prisma.groupMembers.findFirst({
            where: { groupId, userId: parentId }
        });

        if (!parentMember) {
            return res.status(400).json({ success: false, message: "Parent is not a group member" });
        }

        const userLevel = parentMember.level + 1; // Sub-user level = Parent’s level + 1

        // Create sub-user relation
        const subUser = await prisma.subUser.create({
            data: {
                parentId,
                userId,
                groupId,
                role,
                level:userLevel,
            },
        });

        // Add the sub-user as a member of the group
        const groupMember = await prisma.groupMembers.create({
            data: {
                groupId,
                userId,
                role,  // Set the role for the user within the group
                level: userLevel,  // Assign level dynamically
            },
        });

        res.status(201).json({
            success: true,
            message: "Sub-user created and added to group successfully",
            subUser,
            groupMember,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating sub-user and adding to group",
            error: error.message,
        });
    }
};
export const deleteSubUser = async (req, res) => {
    try {
        const { groupId} = Number(req.params);
        const {parentId,subUserId} = req.body;
        const userId = req.user.id; // Assuming you have user ID from authentication


        const member = await prisma.groupMembers.findFirst({
            where: { groupId, userId }
        });

        if (!member) {
            return res.status(403).json({ success: false, message: "You are not a member of this group" });
        }

       

        // Check if the sub-user relation exists
        const subUser = await prisma.subUser.findFirst({
            where: { groupId, parentId, userId: subUserId },
        });

        if (!subUser) {
            return res.status(404).json({ success: false, message: "Sub-user relation not found" });
        }


        if (member.level > subUser.level) {
            return res.status(403).json({ success: false, message: "You do not have the authority to delete this group" });
        }


        // Delete the sub-user entry
        await prisma.subUser.delete({
            where: { id: subUser.id },
        });

        // Remove the sub-user from the group members table
        await prisma.groupMembers.deleteMany({
            where: { groupId, userId: subUserId },
        });

        return res.status(200).json({ success: true, message: "Sub-user deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error deleting sub-user", error: error.message });
    }
};



