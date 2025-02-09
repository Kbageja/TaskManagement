export const sendData = ({ status, message,Data }) => (req, res) => {
    return res.status(status).json({ message,Data });
};
