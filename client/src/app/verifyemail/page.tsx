"use client";

import { useContext, useEffect, useState } from "react";
import { useVerifyEmail } from "@/services/user/mutations";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { AuthContext } from "../context/authcontext";


const VerifyEmail = () => {
  const [countdown, setCountdown] = useState(200); // 5 minutes countdown
  const { mutate, isPending } = useVerifyEmail();
    const router = useRouter();
    const auth = useContext(AuthContext);
    
    // Check if user is already authenticated and not in loading state
    const isAuthenticated = auth?.data?.user?.id;
    const isLoading = auth?.isLoading;
  
    useEffect(() => {
      // Only redirect if authentication check is complete and user is authenticated
      if (!isLoading && isAuthenticated) {
        router.push("/dashboard");
      }
    }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");

    if (!userId || !userData) {
      window.location.href = "/Signup";
      return;
    }
    const checkVerification = () => {
      mutate({ userId, ...userData }, {
        onSuccess: (response) => {
          if (response?.status === 200) {
            localStorage.removeItem("userData");
            window.location.href = "/dashboard";
          }
        }
      });
    };

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 5);
      checkVerification();
    }, 5000);

    setTimeout(() => {
      clearInterval(interval);
      alert("Email verification timeout. Please check your email and try again.");
      localStorage.removeItem("userId");
      localStorage.removeItem("userData");
      window.location.href = "/Signup";
    }, 200000);

    return () => clearInterval(interval);
  }, [mutate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-black to-purple-900">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-white mx-auto" />
        <p className="text-white mt-4">Checking email verification...</p>
        <p className="text-gray-400">Time remaining: {countdown} seconds</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
