export const sendMessage = ({ status, message }) => (req, res) => {
    return res.status(status).json({ message });
};