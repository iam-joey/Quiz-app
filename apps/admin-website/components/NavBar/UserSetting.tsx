"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { signOut, useSession } from "next-auth/react";
import React from "react";
import { useRouter } from "next/navigation";

export function UserSetting() {
  const session = useSession();
  const router = useRouter();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-11 w-11 border">
              <AvatarImage
                src={`https://robohash.org/${session.data?.user?.email}?set=set4`}
                alt="@shadcn"
              />
              <AvatarFallback>{session.data?.user?.name}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mt-2 w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Your Account</p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.data?.user?.name}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Logout
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                router.push("/flags");
              }}
            >
              Flags
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                router.push("/deletedcategorys");
              }}
            >
              deletedcategorys
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                router.push("/docs");
              }}
            >
              Docs
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
