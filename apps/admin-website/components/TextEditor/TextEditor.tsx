"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

import "react-quill/dist/quill.snow.css";

export default function TextEditor() {
  const [editorContent, setEditorContent] = useState("");
  const [savedContent, setSavedContent] = useState("");

  const handleSave = () => {
    setSavedContent(editorContent);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Text Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-md">
          <ReactQuill
            theme="snow"
            value={editorContent}
            onChange={setEditorContent}
            className="h-64"
          />
        </div>
        {savedContent && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Saved Content:</h3>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: savedContent }}
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save</Button>
      </CardFooter>
    </Card>
  );
}
