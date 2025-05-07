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
import { Header } from "@/app/components/header/Header";

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
      <Button 
        variant="spaceStarOutline"
        onClick={onSubmit}
        className="font-normal text-gray-700 hover:shadow-sm rounded-full transition-all border border-gray-700"
      >
        {submitLabel}
      </Button>
      {showCancel && (
        <Button 
          variant="spaceStarOutline" 
          onClick={onCancel}
          className="font-normal bg-red-500 text-white hover:shadow-sm rounded-full transition-all cursor-pointer"
        >
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
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error loading texts
      </div>
    );
  }

  const hasText = texts && texts.length > 0;
  const singleText = hasText ? texts[0] : null;

  return (
    <RequireAuth>
      <div className="font-roboto">
        <div className="w-full">
          <Header pageName="Home Page" />
        </div>
        <div className="px-10 mt-4">
          {!hasText && (
            <Card className="mb-6 border-none shadow-none">
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
            <Card className="border-none shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Promotional Text</CardTitle>
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
                  <div className="flex flex-col gap-4 p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <p className="text-lg text-gray-800 font-medium leading-relaxed p-4 bg-gray-50 rounded-md">{singleText.text}</p>
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="spaceStarOutline"
                        onClick={() => {
                          setIsEditing(true);
                          setEditText(singleText.text);
                        }}
                        className="flex-1 font-medium hover:bg-blue-50 rounded-full transition-all border-2 border-gray-200 hover:border-gray-300 py-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="spaceStarOutline"
                        onClick={() => handleDelete(singleText._id)}
                        className="flex-1 font-medium text-white bg-red-500 hover:bg-red-600 rounded-full transition-all shadow-sm hover:shadow-md"
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
      </div>
    </RequireAuth>
  );
}
