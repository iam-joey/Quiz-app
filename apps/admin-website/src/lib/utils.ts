import { S3Client } from "@aws-sdk/client-s3";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const s3 = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: "AKIAZ7SALBFD2SP2TPXB",
    secretAccessKey: "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",
  },
});
