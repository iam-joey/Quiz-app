"use client";
import { authOptions } from "@/src/lib/auth";
import { useSession } from "next-auth/react";
import React, { createContext, useContext, useState, useEffect } from "react";

const ActiveUserContext = createContext<number>(32);

export const ActiveUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeUsers, setActiveUsers] = useState<number>(32);
  //@ts-ignore
  const session = useSession(authOptions);
  useEffect(() => {
    if (!session.data?.user) return;
    const fetchActiveUsers = async () => {
      const res = await fetch("/api/getActiveUserCount");
      const data = await res.json();
      setActiveUsers(data.count);
    };

    const updateUserPresence = async () => {
      if (session.data?.user) {
        //@ts-ignore
        await fetch(
          `/api/updatepresence/${session.data.user.id}-${session.data.user.name}`,
          {
            method: "POST",
          }
        );
      }
    };

    fetchActiveUsers();
    const countInterval = setInterval(fetchActiveUsers, 60000); //fetch user count every 5 minute
    updateUserPresence();
    const presenceInterval = setInterval(updateUserPresence, 300000); //update user presence every 5 minutes

    return () => {
      clearInterval(countInterval);
      clearInterval(presenceInterval);
    };
  }, [session.data?.user]);

  return (
    <ActiveUserContext.Provider value={activeUsers}>
      {children}
    </ActiveUserContext.Provider>
  );
};

export const useActiveUsers = () => useContext(ActiveUserContext);
