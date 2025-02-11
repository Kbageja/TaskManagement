import { sendMessage } from "../middleware/message.js";
import { sendData } from "../middleware/sendData.js";
import prisma from "../data/database.js";



export const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id; // User creating the group
        console.log(userId);

        if (!name) {
            return sendMessage({ status: 400, message: "Group name is required" })(req, res);
        }

        // Fetch the user (owner) from the database
        const owner = await prisma.user.findUnique({ where: { id: userId } });
        console.log(owner);

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

 

        // Add the user as a member of the group in the groupMembers table
        await prisma.groupMembers.create({
            data: {
                groupId: group.id, // The newly created group's ID
                userId,            // The user who created the group
                role: "creator",    // Pass the role as a string
            },
        });

        return sendMessage({ status: 201, message: "Group created successfully and user added to the group", data: group })(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};


// Fetch All Groups with Members and Their Tasks & SubUsers
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
                                tasks: true,
                                parentUsers: {
                                    include: { user: true },
                                },
                            },
                        },
                    },
                },
                tasks: true,
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

        // Create sub-user relation
        const subUser = await prisma.subUser.create({
            data: {
                parentId,
                userId,
                groupId,
                role,
            },
        });

        // Add the sub-user as a member of the group
        const groupMember = await prisma.groupMembers.create({
            data: {
                groupId,
                userId,
                role,  // Set the role for the user within the group
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



