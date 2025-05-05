"use client";

import { useState } from "react";
import {
  useGetAllTextsQuery,
  useCreateTextMutation,
  useUpdateTextMutation,
  useDeleteTextMutation,
} from "@/lib/api/homeApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import RequireAuth from "@/app/providers/RequireAuth";
import Loader from "@/app/components/Loader";
interface TextFormProps {
  text: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
  showCancel?: boolean;
}

const TextForm = ({ text, onChange, onSubmit, onCancel, submitLabel, showCancel }: TextFormProps) => (
  <div className="flex flex-col gap-4">
    <Input
      value={text}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter promotional text..."
      className="w-full"
    />
    <div className="flex gap-2">
      <Button onClick={onSubmit}>{submitLabel}</Button>
      {showCancel && (
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  </div>
);

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
        <Loader />
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

  const hasText = texts && texts.length > 0;
  const singleText = hasText ? texts[0] : null;

  return (
    <RequireAuth>
      <div className="container mx-auto p-6">
        {!hasText && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Promotional Text</CardTitle>
            </CardHeader>
            <CardContent>
              <TextForm
                text={newText}
                onChange={setNewText}
                onSubmit={handleCreate}
                submitLabel="Add Text"
              />
            </CardContent>
          </Card>
        )}

        {singleText && (
          <Card>
            <CardHeader>
              <CardTitle>Promotional Text</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <TextForm
                  text={editText}
                  onChange={setEditText}
                  onSubmit={() => handleUpdate(singleText._id)}
                  onCancel={() => {
                    setIsEditing(false);
                    setEditText("");
                  }}
                  submitLabel="Save"
                  showCancel
                />
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
    </RequireAuth>
  );
}
