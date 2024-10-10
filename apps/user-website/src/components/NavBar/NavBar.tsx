"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { ToggleMode } from "./ToggleButton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
function NavBar() {
  const router = useRouter();
  return (
    <div className="flex justify-between items-center p-4 border-b border-zinc-600 dark:bg-gray-800">
      <div
        className="cursor-pointer"
        onClick={() => {
          router.push("/");
        }}
      >
        Logo
      </div>
      <div className="flex justify-between gap-4">
        <ToggleMode />
        <div>
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
                    alt="user"
                  />
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-gray-700">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  router.push("/profile");
                  // toast.info("Coming soon");
                }}
              >
                Proifle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // router.push("/profile");
                  toast.info("Coming soon");
                }}
              >
                Create Test
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  router.push("/history");
                }}
              >
                History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  signOut();
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
