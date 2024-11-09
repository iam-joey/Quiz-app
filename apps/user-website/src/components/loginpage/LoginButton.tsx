"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Facebook } from "lucide-react";

export default function LoginButton() {
  const handleSignIn = (provider: string) => {
    signIn(provider, {
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-r from-blue-100 to-blue-200 dark:from-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Choose your preferred sign-in method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full text-black dark:text-white hover:text-white hover:bg-[#4285F4] hover:border-[#4285F4] dark:hover:bg-[#4285F4] dark:hover:border-[#4285F4] dark:border-gray-600"
            onClick={() => handleSignIn("google")}
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Sign in with Google
          </Button>
          {/* <Button
            variant="outline"
            className="w-full text-black dark:text-white hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] dark:hover:bg-[#1877F2] dark:hover:border-[#1877F2] dark:border-gray-600"
            onClick={() => handleSignIn("facebook")}
          >
            <Facebook className="mr-2 h-4 w-4" />
            Sign in with Facebook
          </Button> */}
        </CardContent>
      </Card>
    </div>
  );
}
