"use client";

import React, { useContext, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "../services/user/mutations";
import { Loader2, Mail, Lock } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Form, FormField, FormItem, FormControl, FormMessage } from "../components/ui/form";

import { AuthContext } from "./context/authcontext";
import { useRouter } from "next/navigation";

// Form Schema
const formSchema = z.object({
  email: z.string().min(1, { message: "Required" }).email("Invalid email"),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const Home = () => {
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate, isPending } = useLogin();

  function onSubmit(values: z.infer<typeof formSchema>) {
    //("Submitting login with:", values);
    mutate(values);
  }

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-black to-purple-900">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-black to-purple-900">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-black font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Please enter your details to sign in
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              {/* Email Input */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <FormControl>
                        <Input id="email" type="email" placeholder="Enter your email" className="pl-10 text-black" {...field} disabled={isPending} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Input */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <FormControl>
                        <Input id="password" type="password" placeholder="••••••••" className="pl-10 text-black" {...field} disabled={isPending} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Forgot Password */}
              {/* <div className="flex items-center justify-between">
                <Button variant="link" className="px-0 text-black text-sm">Forgot password?</Button>
              </div> */}

              {/* Sign In Button */}
              <Button type="submit" className="w-full text-white bg-black hover:bg-black" size="lg" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 animate-spin mr-3" />}
                Sign in
              </Button>
            </form>
          </Form>
        </CardContent>

        {/* Sign Up Link */}
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Dont have an account?{" "}
            <Link href="/Signup">
              <Button variant="link" className="px-1 text-black">Sign up</Button>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Home;