"use client";
import React from "react";
import { UserSetting } from "./UserSetting";
import { useRouter } from "next/navigation";
import Search from "../Search/Search";

function Navbar() {
  const router = useRouter();
  return (
    <div className="border p-3 flex justify-between items-center">
      <div
        onClick={() => {
          router.push("/");
        }}
        className="cursor-pointer"
      >
        LOGO
      </div>
      <Search />
      <UserSetting />
    </div>
  );
}

export default Navbar;
