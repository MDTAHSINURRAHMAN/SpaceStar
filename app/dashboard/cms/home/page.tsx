"use client";

import { useState } from "react";
import {
  useGetAllTextsQuery,
  useCreateTextMutation,
  useUpdateTextMutation,
  useDeleteTextMutation,
} from "@/lib/api/homeApi";
import { TextEntry } from "@/types/home";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const [newText, setNewText] = useState("");
  const [editText, setEditText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: texts, isLoading, error } = useGetAllTextsQuery();
  const [createText] = useCreateTextMutation();
  const [updateText] = useUpdateTextMutation();
  const [deleteText] = useDeleteTextMutation();

  const handleCreate = async () => {
    if (!newText.trim()) return;
    try {
      await createText({ text: newText });
      setNewText("");
      toast.success("Text created successfully");
    } catch (err) {
      console.error("Create error:", err);
      toast.error("Failed to create text");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editText.trim()) return;
    try {
      await updateText({ id, text: editText });
      setIsEditing(false);
      setEditText("");
      toast.success("Text updated successfully");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update text");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteText(id);
      toast.success("Text deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete text");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error loading texts
      </div>
    );
  }

  // Check if we have any text entries
  const hasText = texts && texts.length > 0;
  const singleText = hasText ? texts[0] : null;

  return (
    <div className="container mx-auto p-6">
      {!hasText && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Home Text</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Enter text for homepage..."
              className="flex-1"
            />
            <Button onClick={handleCreate}>Add Text</Button>
          </CardContent>
        </Card>
      )}

      {singleText && (
        <Card>
          <CardHeader>
            <CardTitle>Home Text</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="flex flex-col gap-4">
                <Input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleUpdate(singleText._id)}>Save</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-lg">{singleText.text}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(true);
                      setEditText(singleText.text);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(singleText._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
