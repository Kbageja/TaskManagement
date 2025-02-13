import { format } from 'date-fns';

export const taskAssignedTemplate = (task) => {
    const formattedDeadline = format(new Date(task.DeadLine), "EEEE, dd MMMM yyyy, hh:mm a");

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #007bff; text-align: center;">New Task Assigned</h2>
        <p style="font-size: 16px; color: #555;">A new task has been assigned to you. Below are the details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Task Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${task.TaskName}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Deadline:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${formattedDeadline}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Priority:</td>
                <td style="padding: 10px;">${task.Priority}</td>
            </tr>
        </table>

        <p style="margin-top: 20px; text-align: center;">
            <a href="https://your-task-dashboard.com/tasks/${task.id}" 
               style="padding: 10px 15px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
               View Task
            </a>
        </p>

        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
            This is an automated email. Please do not reply.
        </p>
    </div>`;
};
