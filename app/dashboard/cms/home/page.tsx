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

interface FormData {
  text: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  twitter: string;
}

interface TextFormProps {
  data: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
  showCancel?: boolean;
}

const TextForm = ({
  data,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  showCancel,
}: TextFormProps) => (
  <div className="flex flex-col gap-4">
    <Input
      value={data.text}
      onChange={(e) => onChange("text", e.target.value)}
      placeholder="Enter promotional text..."
      className="w-full"
    />
    <Input
      value={data.instagram}
      onChange={(e) => onChange("instagram", e.target.value)}
      placeholder="Instagram URL"
      className="w-full"
    />
    <Input
      value={data.facebook}
      onChange={(e) => onChange("facebook", e.target.value)}
      placeholder="Facebook URL"
      className="w-full"
    />
    <Input
      value={data.whatsapp}
      onChange={(e) => onChange("whatsapp", e.target.value)}
      placeholder="WhatsApp number"
      className="w-full"
    />
    <Input
      value={data.twitter}
      onChange={(e) => onChange("twitter", e.target.value)}
      placeholder="Twitter URL"
      className="w-full"
    />
    <div className="gap-2">
      <Button
        variant="spaceStarOutline"
        onClick={onSubmit}
        className="w-1/3 flex-1 font-medium text-gray-700 hover:bg-gray-50 rounded-full transition-all hover:shadow-md border-2 border-gray-500 hover:border-gray-500 py-2 mr-3"
      >
        {submitLabel}
      </Button>
      {showCancel && (
        <Button
          variant="spaceStarOutline"
          onClick={onCancel}
          className="w-1/3 flex-1 font-medium text-white bg-red-500 hover:bg-red-600 rounded-full transition-all shadow-sm hover:shadow-md"
        >
          Cancel
        </Button>
      )}
    </div>
  </div>
);

const emptyFormData: FormData = {
  text: "",
  instagram: "",
  facebook: "",
  whatsapp: "",
  twitter: "",
};

export default function HomePage() {
  const [newData, setNewData] = useState<FormData>(emptyFormData);
  const [editData, setEditData] = useState<FormData>(emptyFormData);
  const [isEditing, setIsEditing] = useState(false);

  const { data: texts, isLoading, error } = useGetAllTextsQuery();
  const [createText] = useCreateTextMutation();
  const [updateText] = useUpdateTextMutation();
  const [deleteText] = useDeleteTextMutation();

  const handleCreate = async () => {
    if (!newData.text.trim()) return;
    try {
      await createText(newData);
      setNewData(emptyFormData);
      toast.success("Content created successfully");
    } catch (err) {
      console.error("Create error:", err);
      toast.error("Failed to create content");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editData.text.trim()) return;
    try {
      await updateText({ id, ...editData });
      setIsEditing(false);
      setEditData(emptyFormData);
      toast.success("Content updated successfully");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update content");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteText(id);
      toast.success("Content deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete content");
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
        Error loading content
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
        <div className="w-2/3 mx-auto mt-8">
          {!hasText && (
            <Card className="mb-6 border-none shadow-none">
              <CardContent>
                <TextForm
                  data={newData}
                  onChange={(field, value) =>
                    setNewData((prev) => ({ ...prev, [field]: value }))
                  }
                  onSubmit={handleCreate}
                  submitLabel="Add Content"
                />
              </CardContent>
            </Card>
          )}

          {singleText && (
            <Card className="border-none shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <TextForm
                    data={editData}
                    onChange={(field, value) =>
                      setEditData((prev) => ({ ...prev, [field]: value }))
                    }
                    onSubmit={() => handleUpdate(singleText._id)}
                    onCancel={() => {
                      setIsEditing(false);
                      setEditData(emptyFormData);
                    }}
                    submitLabel="Save"
                    showCancel
                  />
                ) : (
                  <div className="flex flex-col gap-4 p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="space-y-4">
                      <p className="text-lg text-gray-800 font-medium leading-relaxed p-4 bg-gray-50 rounded-md">
                        {singleText.text}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-md">
                          <p className="font-medium">Instagram:</p>
                          <p className="text-gray-600">
                            {singleText.instagram}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-md">
                          <p className="font-medium">Facebook:</p>
                          <p className="text-gray-600">{singleText.facebook}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-md">
                          <p className="font-medium">WhatsApp:</p>
                          <p className="text-gray-600">{singleText.whatsapp}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-md">
                          <p className="font-medium">Twitter:</p>
                          <p className="text-gray-600">{singleText.twitter}</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant="spaceStarOutline"
                        onClick={() => {
                          setIsEditing(true);
                          setEditData({
                            text: singleText.text,
                            instagram: singleText.instagram,
                            facebook: singleText.facebook,
                            whatsapp: singleText.whatsapp,
                            twitter: singleText.twitter,
                          });
                        }}
                        className="w-1/3 flex-1 font-medium text-gray-700 hover:bg-gray-50 rounded-full transition-all hover:shadow-md border-2 border-gray-500 hover:border-gray-500 py-2 mr-3"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="spaceStarOutline"
                        onClick={() => handleDelete(singleText._id)}
                        className="w-1/3 flex-1 font-medium text-white bg-red-500 hover:bg-red-600 rounded-full transition-all shadow-sm hover:shadow-md"
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
