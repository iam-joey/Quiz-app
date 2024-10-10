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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  BookOpenIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  MailIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { authOptions } from "@/src/lib/auth";
import { toast } from "sonner";

enum Program {
  MEDICINE = "MEDICINE",
  PHARMACY = "PHARMACY",
  DENTISTRY = "DENTISTRY",
}

interface UserProfile {
  name: string;
  studyProgram: Program | null;
  speciality: string | null;
  workPlace: string | null;
  university: string | null;
  promotion: string | null;
  profileCompleted: boolean;
  email: string | null;
  // emailVerified: Date | null;
  image: string | null;
}

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Dr. Jane Doe",
    studyProgram: Program.MEDICINE,
    speciality: "Cardiology",
    workPlace: "Central Hospital",
    university: "Medical University",
    promotion: "2022",
    profileCompleted: true,
    email: "jane.doe@example.com",
    // emailVerified: new Date("2023-01-01"),
    image: "/placeholder.svg?height=200&width=200",
  });
  //@ts-ignore
  const session = useSession(authOptions);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserProfile({ ...userProfile, [e.target.name]: e.target.value });
  };

  const handleProgramChange = (value: Program) => {
    setUserProfile({ ...userProfile, studyProgram: value });
  };

  const handleSave = () => {
    console.log("Saving profile:", userProfile);
    setIsEditing(false);
  };

  useEffect(() => {
    if (session.data?.user) {
      setUserProfile({
        name: session.data.user.name!,
        email: session.data.user.email!,
        image: session.data.user.image!,
        studyProgram: Program.MEDICINE,
        speciality: "Cardiology",
        workPlace: "Central Hospital",
        university: "Medical University",
        promotion: "2022",
        profileCompleted: true,
        // emailVerified: true,
      });
    }
  }, [session.data?.user]);

  return (
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
                onClick={
                  () => toast.info("Coming Soon")
                  // setIsEditing(!isEditing)}
                }
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
                onValueChange={(value) => handleProgramChange(value as Program)}
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
              className="ml-auto bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </CardFooter>
        )}
      </Card>
      {/* {JSON.stringify(session.data?.user)} */}
    </div>
  );
}
