import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { sendMessage } from "../middleware/message.js";
import bcrypt from "bcrypt"

dotenv.config();
export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
export const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        const redirectTo = process.env.FRONTENDURL; // Change this to your actual frontend URL

        // Step 1: Register user in Supabase and send confirmation email
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: redirectTo },
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({
            message: "Signup initiated. Please check your email to verify your account.",
            userId: data?.user?.id,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
export const verifyEmail = async (req, res) => {
    try {
        const { userId, email, password, name } = req.body;

        if (!userId || !email || !password || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ✅ Step 1: Check if the email is verified using Supabase Auth API
        const { data: userData, error: fetchError } = await supabase.auth.admin.getUserById(userId);

        if (fetchError) {
            console.error("Error fetching user data:", fetchError);
            return res.status(500).json({ error: "Error checking email verification." });
        }

        if (!userData?.user?.email_confirmed_at) {
            return res.status(400).json({ message: "Email not verified. Please check your inbox." });
        }

        // ✅ Step 2: Hash password and store user in the "User" table
        const hashedPassword = await bcrypt.hash(password, 10);

        const { error: profileError } = await supabase
            .from("User")
            .insert([{ id: userId, name, email, password: hashedPassword }]);

        if (profileError) {
            return res.status(400).json({ error: profileError.message });
        }

        return res.status(200).json({ message: "Email verified and user registered successfully!",data:userData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendMessage({ status: 400, message: "Email and password are required" })(req, res);
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return sendMessage({ status: 401, message: "Invalid email or password" })(req, res);
        }

        res.status(200).json({ message: "Login successful",data });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
export const isLoggedIn = async (req, res) => {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
            return sendMessage({ status: 401, message: "Unauthorized: No active session" })(req, res);
        }

        res.status(200).json({
            message: "User is authenticated",
            user: data.session.user,
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
export const logout = async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Clear any authentication cookies that might be set
        res.clearCookie('sb-auth-token');
        res.clearCookie('sb-refresh-token');
        // Add any other cookies that might be related to authentication
        
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};


