"use client";

import { useContext, useEffect, useState } from "react";
import { useVerifyEmail } from "../../services/user/mutations";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation"; // Updated import
import { AuthContext } from "../context/authcontext";
import { toast } from "../../hooks/use-toast";

const VerifyEmail = () => {
  const [countdown, setCountdown] = useState(200);
  const { mutate } = useVerifyEmail();
  const router = useRouter();
  const auth = useContext(AuthContext);

  const isAuthenticated = auth?.data?.user?.id;
  const isLoading = auth?.isLoading;
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const userId = localStorage.getItem("userId");
    const userData = JSON.parse(localStorage.getItem("authData") || "{}");

    if (!userId || !userData) {
      router.push("/Signup");
      return;
    }

    const checkVerification = () => {
      mutate(
        { userId, ...userData },
        {
          onSuccess: (response) => {
            if (response?.status === 200) {
              alert("Email Verification and Registration is Complete ,now Proceed to Login")
              localStorage.removeItem("userData");
              router.push("/");
            }
          },
        }
      );
    };

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 5);
      checkVerification();
    }, 5000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      alert(
        "Email verification timeout. Please check your email and try again."
      );
      localStorage.removeItem("userId");
      localStorage.removeItem("authData");
      router.push("/Signup");
    }, 200000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [mutate, router]);

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
