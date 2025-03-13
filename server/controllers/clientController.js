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
                                tasks: true, // Get all tasks, filter later
                                parentUsers: {
                                    include: {
                                        user: {
                                            include: {
                                                tasks: true,
                                                parentUsers:true, // Get parent user tasks, filter later
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

        // Filter out unrelated tasks and parentUsers
        const filteredGroups = groups.map((group) => ({
            ...group,
            members: group.members.map((member) => ({
                ...member,
                user: {
                    ...member.user,
                    tasks: member.user.tasks.filter(task => task.groupId === group.id), // ✅ Only tasks from this group
                    parentUsers: member.user.parentUsers
                        .filter(parent => parent.groupId === group.id) // ✅ Keep only parentUsers belonging to this group
                        .map(parent => ({
                            ...parent,
                            user: {
                                ...parent.user,
                                tasks: parent.user.tasks.filter(task => task.groupId === group.id), // ✅ Only parent user tasks from this group
                            },
                        })),
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
        console.log(groupId+userId)

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
export const generateInviteLink = async (req, res) => {
    try {
        const { groupId } = req.body;
        const inviterId = req.user.id; // User generating the invite link (parent)

        // Check if the group exists and the user is a member of the group
        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }

        const member = await prisma.groupMembers.findFirst({
            where: { groupId, userId: inviterId },
        });
        if (!member) {
            return res.status(403).json({ success: false, message: "You are not a member of this group" });
        }

        // Create a unique invite token
        const token = Math.random().toString(36).substring(2); // Simple random string (use a stronger method for production)

        // Set expiration time (e.g., 24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Create invite record with parentId (inviterId)
        const invite = await prisma.invite.create({
            data: {
                token,
                groupId,
                inviterId,  // Storing inviter as parentId
                status: 'pending',
                expiresAt,
            },
        });

        // Generate the invite link
        const inviteLink = `http://localhost:6000/group/invite/${token}`;

        return res.status(201).json({
            success: true,
            message: "Invite link generated successfully",
            inviteLink,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error generating invite link", error: error.message });
    }
};
export const acceptInvite = async (req, res) => {
    try {
        const { token } = req.params;
        const inviteeId = req.user.id; // User accepting the invite

        // Find the invite by token
        const invite = await prisma.invite.findUnique({ where: { token } });

        if (!invite) {
            return res.status(404).json({ success: false, message: "Invalid invite link" });
        }

        // Check if the invite has expired
        const currentDate = new Date();
        if (invite.expiresAt < currentDate) {
            return res.status(400).json({ success: false, message: "Invite link has expired" });
        }

        // Check if the invite is already used
        if (invite.status === 'accepted') {
            return res.status(400).json({ success: false, message: "Invite already used" });
        }

        // Get parentId from the invite (inviterId)
        const parentId = invite.inviterId;

        // Get the parent's level in the group
        const parentMember = await prisma.groupMembers.findFirst({
            where: { groupId: invite.groupId, userId: parentId },
            select: { level: true },
        });

        if (!parentMember) {
            return res.status(404).json({ success: false, message: "Parent not found in the group" });
        }

        const parentLevel = parentMember.level;

        // Start a transaction to ensure both inserts succeed
        const [groupMember, subUser] = await prisma.$transaction([
            // Add the invitee as a member of the group
            prisma.groupMembers.create({
                data: {
                    groupId: invite.groupId,
                    userId: inviteeId,
                    role: 'member', // You can adjust the role as needed
                    level: parentLevel + 1, // Assign the level based on the parent's level
                },
            }),
            // Add the invitee as a subUser
            prisma.subUser.create({
                data: {
                    parentId: parentId, // The inviter (parent)
                    userId: inviteeId, // The invitee
                    groupId: invite.groupId,
                    role: 'subUser', // Assigning subUser role
                    level: parentLevel + 1, // Assign the level based on the parent's level
                },
            }),
        ]);

        // Update invite status to accepted and store inviteeId
        await prisma.invite.update({
            where: { id: invite.id },
            data: {
                inviteeId,
                status: 'accepted',
                usedAt: new Date(),
            },
        });

        return res.status(200).json({
            success: true,
            message: "Invite accepted successfully",
            groupId: invite.groupId,
            groupMember,
            subUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error accepting invite", error: error.message });
    }
};
export const rejectInvite = async (req, res) => {
    try {
        const { token } = req.params;
        const inviteeId = req.user.id;
        // Find the invite by token
        const invite = await prisma.invite.findUnique({ where: { token } });
        if (!invite) {
            return res.status(404).json({ success: false, message: "Invalid invite link" });
        }
        // Reject the invite
        if (invite.status === 'accepted') {
            return res.status(400).json({ success: false, message: "Invite already accepted" });
        }
        await prisma.invite.update({
            where: { id: invite.id },
            data: {
                status: 'expired',  // Mark the invite as expired
            },
        });
        return res.status(200).json({ success: true, message: "Invite rejected successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error rejecting invite", error: error.message });
    }
};
