import { supabase } from "../controllers/AuthControllers.js";
import { sendMessage } from "./message.js";

export const isAuthenticated = async (req, res, next) => {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
            return sendMessage({ status: 401, message: "Unauthorized: No active session" })(req, res);
        }

        req.user = data.session.user;
        next();
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
