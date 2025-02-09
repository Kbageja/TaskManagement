import { sendMessage } from "../middleware/message.js";
import { PrismaClient } from "@prisma/client";
import { sendData } from "../middleware/sendData.js";


const prisma = new PrismaClient();

// Create a Group
export const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) {
            return sendMessage({ status: 400, message: "Group name is required" })(req, res);
        }

        const group = await prisma.group.create({
            data: {
                name,
                userId,
            },
        });

        return sendMessage({ status: 201, message: "Group created successfully", data: group })(req, res);
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
                    { userId: userId }, // Groups created by the user
                    { members: { some: { userId: userId } } }, // Groups where the user is a member
                ],
            },
            include: {
                members: {
                    include: {
                        user: {
                            include: {
                                tasks: true,
                                subUsers: true,
                            },
                        },
                    },
                },
                tasks: true,
            },
        });

        return sendData({ status: 200, message: "Groups fetched successfully", Data: groups })(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};


