"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  BookOpenIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  MailIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Toaster, toast } from "sonner";

enum Program {
  MEDICINE = "MEDICINE",
  PHARMACY = "PHARMACY",
  DENTISTRY = "DENTISTRY",
}

interface UserProfile {
  id: string;
  name: string;
  studyProgram: Program | null;
  speciality: string | null;
  workPlace: string | null;
  university: string | null;
  promotion: string | null;
  email: string | null;
  image: string | null;
}

interface UserProfileUpdate {
  name?: string;
  studyProgram?: string;
  speciality?: string;
  workPlace?: string;
  university?: string;
  promotion?: string;
}

// Import the server actions
import { getProfile, updateProfile } from "@/src/lib/actions";

function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-16 h-16 border-4 border-blue-400 border-solid rounded-full animate-spin border-t-transparent"></div>
    </div>
  );
}

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { data: session } = useSession();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, [e.target.name]: e.target.value });
    }
  };

  const handleProgramChange = (value: Program) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, studyProgram: value });
    }
  };

  const handleSave = async () => {
    if (!userProfile || !session?.user?.id) return;

    setIsSaving(true);
    const updateData: UserProfileUpdate = {
      name: userProfile.name,
      studyProgram: userProfile.studyProgram || undefined,
      speciality: userProfile.speciality || undefined,
      workPlace: userProfile.workPlace || undefined,
      university: userProfile.university || undefined,
      promotion: userProfile.promotion || undefined,
    };

    const result = await updateProfile(session.user.id, updateData);
    setIsSaving(false);

    if (result.err) {
      toast.error(result.msg);
    } else {
      toast.success(result.msg);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      if (session?.user?.id) {
        setIsLoading(true);
        const result = await getProfile(session.user.id);
        if (!result.err && result.data) {
          setUserProfile({
            ...result.data,
            studyProgram: result.data.studyProgram as Program | null,
            email: session.user.email || null,
            image: session.user.image || null,
          });
          toast.success(result.msg);
        } else {
          toast.error(result.msg);
          setUserProfile(null);
        }
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [session]);

  if (isLoading) {
    return <Loader />;
  }

  if (!userProfile) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>No Profile Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                No profile data is available. Please try again later or contact
                support.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl mx-auto shadow-xl dark:bg-gray-800">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-700 dark:to-indigo-700 text-white rounded-t-lg">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-700 shadow-lg">
                  <AvatarImage
                    src={userProfile.image || ""}
                    alt={userProfile.name}
                  />
                  <AvatarFallback className="text-2xl font-bold bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                    {userProfile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl font-bold">
                    {userProfile.name}
                  </CardTitle>
                  <p className="text-blue-100 dark:text-blue-200 flex items-center">
                    <MailIcon className="w-4 h-4 mr-2" />
                    {userProfile.email}
                  </p>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <Button
                  variant={isEditing ? "secondary" : "default"}
                  onClick={() => setIsEditing(!isEditing)}
                  className="shadow-md hover:shadow-lg transition-shadow dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="studyProgram"
                  className="text-lg font-semibold text-gray-700 dark:text-gray-300"
                >
                  Study Program
                </Label>
                <Select
                  disabled={!isEditing}
                  value={userProfile.studyProgram || undefined}
                  onValueChange={(value) =>
                    handleProgramChange(value as Program)
                  }
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors">
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Program).map((program) => (
                      <SelectItem key={program} value={program}>
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="speciality"
                  className="text-lg font-semibold text-gray-700 dark:text-gray-300"
                >
                  Speciality
                </Label>
                <Input
                  id="speciality"
                  name="speciality"
                  value={userProfile.speciality || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="workPlace"
                  className="text-lg font-semibold text-gray-700 dark:text-gray-300"
                >
                  Work Place
                </Label>
                <Input
                  id="workPlace"
                  name="workPlace"
                  value={userProfile.workPlace || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="university"
                  className="text-lg font-semibold text-gray-700 dark:text-gray-300"
                >
                  University
                </Label>
                <Input
                  id="university"
                  name="university"
                  value={userProfile.university || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="promotion"
                  className="text-lg font-semibold text-gray-700 dark:text-gray-300"
                >
                  Promotion
                </Label>
                <Input
                  id="promotion"
                  name="promotion"
                  value={userProfile.promotion || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </div>
            </div>
            <Separator className="my-6 dark:bg-gray-600" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg shadow">
                <BookOpenIcon className="w-8 h-8 mx-auto text-blue-500 dark:text-blue-300 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Study Program
                </p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {userProfile.studyProgram}
                </p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg shadow">
                <BriefcaseIcon className="w-8 h-8 mx-auto text-indigo-500 dark:text-indigo-300 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Work Place
                </p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {userProfile.workPlace}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg shadow">
                <GraduationCapIcon className="w-8 h-8 mx-auto text-purple-500 dark:text-purple-300 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  University
                </p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {userProfile.university}
                </p>
              </div>
              <div className="bg-pink-50 dark:bg-pink-900 p-4 rounded-lg shadow">
                <CalendarIcon className="w-8 h-8 mx-auto text-pink-500 dark:text-pink-300 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Promotion
                </p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {userProfile.promotion}
                </p>
              </div>
            </div>
          </CardContent>
          {isEditing && (
            <CardFooter className="bg-gray-50 dark:bg-gray-700 rounded-b-lg">
              <Button
                className="mt-5 ml-auto bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
}
