"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { getDeletedCategorys, undoDeleteCategory } from "@/src/lib/actions";
import { Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";

function extractOriginalName(fullName: string): string {
  const parts = fullName.split("_");
  if (parts.length >= 3) {
    return parts.slice(1, -1).join("_");
  }
  return fullName;
}

export default function DeletedCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [undoingId, setUndoingId] = useState<string | null>(null);
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getDeletedCategorys();
      if (result.err) {
        setError(result.msg);
      } else {
        setCategories(result.data || []);
      }
    } catch (err) {
      setError("Failed to fetch deleted categories");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUndoDelete(id: string) {
    setUndoingId(id);
    try {
      const result = await undoDeleteCategory(id);
      if (result.err) {
        toast.error(result.msg);
      } else {
        toast.success(result.msg);
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      }
    } catch (err) {
      toast.error("Failed to undo delete");
    } finally {
      setUndoingId(null);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Toaster position="top-center" />
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Deleted Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div
              className="p-4 bg-red-100 border border-red-400 text-red-700 rounded"
              role="alert"
            >
              <p>{error}</p>
            </div>
          ) : categories.length === 0 ? (
            <div
              className="p-4 bg-gray-100 border border-gray-300 text-gray-700 rounded"
              role="status"
            >
              <p>No deleted categories found.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-lg font-medium">
                      {extractOriginalName(category.name)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUndoDelete(category.id)}
                      disabled={undoingId === category.id}
                    >
                      {undoingId === category.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Undoing...
                        </>
                      ) : (
                        "Undo Delete"
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
