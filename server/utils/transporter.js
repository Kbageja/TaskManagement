import { taskAssignedTemplate } from "./emailTemplate.js";
import nodemailer from "nodemailer";

export const sendEmailNotification = async (recipientEmail, task) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, // Replace with your email
            pass: process.env.EMAIL_PASS  // Replace with your email password or app password
        }
    });

    const mailOptions = {
        from: `"Nudgr" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: "New Task Assigned",
        html: taskAssignedTemplate(task)
    };

    await transporter.sendMail(mailOptions);
};