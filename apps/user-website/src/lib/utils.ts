import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(isoString: string) {
  const date = new Date(isoString);

  // Get the month name
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];

  // Get the day, year
  const day = date.getDate();
  const year = date.getFullYear();

  // Get the hours and format it to 12-hour format
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // If the hour is 0, set it to 12

  // Combine everything into the desired format
  return `${month} ${day}, ${year} ${hours}:${minutes}${ampm}`;
}

export const s3 = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: "AKIAZ7SALBFD2SP2TPXB",
    secretAccessKey: "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",
  },
});
