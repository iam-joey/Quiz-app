"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ToggleMode } from "./ToggleButton"; 

function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState({
    profile: false,
    createTest: false,
    history: false,
    logout: false,
  });

  const handleAction = async (action: string, path?: string) => {
    setIsLoading((prev) => ({ ...prev, [action]: true }));
    try {
      if (action === "logout") {
        await signOut();
      } else if (path) {
        await router.push(path);
      } else {
        toast.info("Coming soon");
      }
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      toast.error(`Failed to ${action}. Please try again.`);
    } finally {
      setIsLoading((prev) => ({ ...prev, [action]: false }));
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname.includes('/test/')) {
      e.preventDefault();
      window.dispatchEvent(new Event('logo-click'));
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex justify-between items-center p-4 border-b border-zinc-600 dark:bg-gray-800">
      <div
        className="cursor-pointer"
        onClick={handleLogoClick}
        role="button"
        tabIndex={0}
        aria-label="Go to home page"
      >
        Logo
      </div>
      <div className="flex justify-between gap-4">
        <ToggleMode />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Avatar className="h-11 w-11 border">
                <AvatarImage
                  src={`https://robohash.org/asdasd?set=set4`}
                  alt="User avatar"
                />
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dark:bg-gray-700">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleAction("profile", "/profile")}
              disabled={isLoading.profile}
            >
              {isLoading.profile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Profile"
              )}
            </DropdownMenuItem>
            {/* <DropdownMenuItem
              onClick={() => handleAction("createTest")}
              disabled={isLoading.createTest}
            >
              {isLoading.createTest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Test"
              )}
            </DropdownMenuItem> */}
            {/* <DropdownMenuItem
              onClick={() => handleAction("history", "/history")}
              disabled={isLoading.history}
            >
              {isLoading.history ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "History"
              )}
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleAction("logout")}
              disabled={isLoading.logout}
            >
              {isLoading.logout ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                "Logout"
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default NavBar;
