import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { sendMessage } from "../middleware/message.js";
import bcrypt from "bcrypt"

dotenv.config();
export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const signup = async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password || !fullName) {
            return sendMessage({ status: 400, message: "All fields are required" })(req, res);
        }

        if (password.length < 8) {
            return sendMessage({ status: 400, message: "Password must be at least 8 characters long" })(req, res);
        }

        const redirectTo = "https://google.com"; // Change this to your frontend URL

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: redirectTo },
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Added await

        if (data?.user) {
            const { error: profileError } = await supabase
                .from("User")
                .insert([{ id: data.user.id, name: fullName, email, password: hashedPassword }]);

            if (profileError) {
                return res.status(400).json({ error: profileError.message });
            }
        }

        res.status(201).json({ message: "Signup successful. Please check your email for verification." });
    } catch (error) {
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

        res.status(200).json({ message: "Login successful" });
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

        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};


