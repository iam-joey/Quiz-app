"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function RichTextEditorComponent() {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(
    '<h1>Click the Edit button to modify this text.</h1><p>You can make it <strong>bold</strong>, <em>italic</em>, or add <u>underline</u>. You can also add bullet points:</p><ul><li>Point 1</li><li>Point 2</li></ul><h1>Lavde</h1><h1>hello</h1><p><span class="ql-size-small">Small text</span></p><p><span class="ql-size-large">Large text</span></p><p><span class="ql-size-huge">Huge text</span></p>'
  );

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "color",
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        {isEditing ? (
          <ReactQuill
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            className="h-64"
          />
        ) : (
          <div
            className="prose max-w-none ql-editor custom-quill-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleEditToggle}>
          {isEditing ? "Save" : "Edit"}
        </Button>
      </CardFooter>
    </Card>
  );
}
