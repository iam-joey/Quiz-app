"use client";
import React, { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./themer-provider";
import { Toaster } from "sonner";

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Toaster closeButton duration={1500} position="top-center" richColors />
      <ThemeProvider attribute="class" defaultTheme="dark">
        <SessionProvider>{children}</SessionProvider>
      </ThemeProvider>
    </>
  );
};
