"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  GraduationCap,
  Mail,
  MapPin,
  School,
  User,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfile } from "@/src/lib/actions";

interface User {
  id: string;
  name: string;
  studyProgram: string | null;
  speciality: string | null;
  workPlace: string | null;
  university: string | null;
  promotion: string | null;
  image: string | null;
  isPremium: boolean;
  email: string | null;
}

export default function ProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const toastId = toast.loading("Fetching profile...");
      try {
        const result = await getProfile(params.userId);
        if (result.err) {
          if (result.msg === "User not found") {
            setNotFound(true);
            toast.dismiss(toastId);
            toast.error("User profile not available");
          } else {
            throw new Error(result.msg);
          }
        } else if (result.data) {
          toast.dismiss(toastId);
          toast.success(result.msg);
          setUser({
            ...result.data,
            isPremium: true,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.dismiss(toastId);
        toast.error("An error occurred while fetching the profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params.userId]);

  if (loading) {
    return <LoadingProfile />;
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4">
        <div className="max-w-2xl mx-auto mt-8 bg-zinc-900 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-100 mb-4">
            User Profile Not Available
          </h1>
          <p className="text-zinc-400">
            The requested user profile could not be found.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-zinc-950 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Banner */}
            <div className="h-48 rounded-t-lg bg-gradient-to-r from-blue-500 to-purple-500" />

            {/* Avatar */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Avatar className="w-24 h-24 border-4 border-zinc-950">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback className="bg-zinc-800 text-zinc-100">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Content */}
            <div className="bg-zinc-900 rounded-b-lg pt-16 pb-8 px-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-zinc-100">
                  {user.name}
                </h1>
                {user.isPremium && (
                  <Badge
                    variant="secondary"
                    className="mt-2 bg-zinc-800 text-zinc-100"
                  >
                    Premium User
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                {user.email && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Mail className="w-5 h-5 text-zinc-500" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.studyProgram && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <GraduationCap className="w-5 h-5 text-zinc-500" />
                    <span>{user.studyProgram}</span>
                  </div>
                )}
                {user.speciality && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <User className="w-5 h-5 text-zinc-500" />
                    <span>{user.speciality}</span>
                  </div>
                )}
                {user.workPlace && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Briefcase className="w-5 h-5 text-zinc-500" />
                    <span>{user.workPlace}</span>
                  </div>
                )}
                {user.university && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <School className="w-5 h-5 text-zinc-500" />
                    <span>{user.university}</span>
                  </div>
                )}
                {user.promotion && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <MapPin className="w-5 h-5 text-zinc-500" />
                    <span>{user.promotion}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function LoadingProfile() {
  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="h-48 rounded-t-lg bg-gradient-to-r from-blue-500 to-purple-500" />
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Skeleton className="w-24 h-24 rounded-full" />
          </div>
          <div className="bg-zinc-900 rounded-b-lg pt-16 pb-8 px-8">
            <div className="text-center mb-8">
              <Skeleton className="h-8 w-48 mx-auto" />
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
