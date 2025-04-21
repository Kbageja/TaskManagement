"use client";

import React, { useContext, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "../../services/user/mutations";
import { Loader2 } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Form, FormField, FormItem, FormControl, FormMessage } from "../../components/ui/form";
import { useRouter } from "next/navigation"; // Updated import
import { AuthContext } from "../context/authcontext";

const formSchema = z.object({
  name: z.string().min(1, { message: "Required" }),
  email: z.string().min(1, { message: "Required" }).email("Invalid email"), 
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type RegisterData = z.infer<typeof formSchema>;

const Signup = () => {
  const router = useRouter();
  const auth = useContext(AuthContext);
  
  const isAuthenticated = auth?.data?.user?.id;
  const isLoading = auth?.isLoading;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
     router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router]);
  
  const form = useForm<RegisterData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const { mutate, isPending } = useRegister();

  function onSubmit(values: RegisterData) {
    mutate(values, {
      onSuccess: (response) => {
        if (response?.data?.userId) {
          if (typeof window !== "undefined") {
            localStorage.setItem("userId", response.data.userId);
            localStorage.setItem("authData", JSON.stringify(values));
          }
          router.push("/verifyemail");
        }
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-black to-purple-900">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-black text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Please enter your details to sign up
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <Label htmlFor="name" className="text-black">Name</Label>
                  <FormControl>
                    <Input id="name" type="text" className="text-black" placeholder="Enter your Name" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <Label htmlFor="email" className="text-black">Email</Label>
                  <FormControl>
                    <Input id="email" type="email" className="text-black" placeholder="Enter your email" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <Label htmlFor="password" className="text-black">Password</Label>
                  <FormControl>
                    <Input id="password" type="password" className="text-black" placeholder="••••••••" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full bg-black hover:bg-black text-white" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Sign up
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/" className="px-1 text-black hover:underline">
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;