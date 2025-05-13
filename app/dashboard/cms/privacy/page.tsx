"use client";

import { useState } from "react";
import {
  useGetAllPrivaciesQuery,
  useCreatePrivacyMutation,
  useUpdatePrivacyMutation,
  useDeletePrivacyMutation,
} from "@/lib/api/privacyApi";
import { PrivacyEntry, TipTapContent } from "@/types/privacy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import RequireAuth from "@/app/providers/RequireAuth";
import Loader from "@/app/components/Loader";
import { Header } from "@/app/components/header/Header";
import TipTapEditor from "@/app/components/TipTapEditor";
import TipTapContentDisplay from "@/app/components/TipTapContent";

interface PrivacyFormData {
  image: File | null;
  content: TipTapContent;
}

// Default empty TipTap document structure
const EMPTY_TIPTAP_CONTENT: TipTapContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "",
        },
      ],
    },
  ],
};

const INITIAL_FORM_STATE: PrivacyFormData = {
  image: null,
  content: EMPTY_TIPTAP_CONTENT,
};

export default function PrivacyPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PrivacyFormData>(INITIAL_FORM_STATE);

  const { data: privacies, isLoading, error } = useGetAllPrivaciesQuery();
  const [createPrivacy] = useCreatePrivacyMutation();
  const [updatePrivacy] = useUpdatePrivacyMutation();
  const [deletePrivacy] = useDeletePrivacyMutation();

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
  };

  const handleContentChange = (content: TipTapContent) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files![0],
      }));
    }
  };

  const validateForm = () => {
    if (!formData.image && !editingId) {
      toast.error("Please select an image");
      return false;
    }

    // Check if the content is empty (only has an empty paragraph)
    const isEmpty =
      formData.content.content.length === 1 &&
      formData.content.content[0].type === "paragraph" &&
      (!formData.content.content[0].content ||
        formData.content.content[0].content.length === 0 ||
        (formData.content.content[0].content.length === 1 &&
          formData.content.content[0].content[0].text === ""));

    if (isEmpty) {
      toast.error("Please add some content");
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("image", formData.image!);
      formDataToSend.append("content", JSON.stringify(formData.content));

      await createPrivacy(formDataToSend);
      setIsCreating(false);
      resetForm();
      toast.success("Privacy created successfully");
    } catch (err) {
      console.error("Create error:", err);
      toast.error("Failed to create privacy");
    }
  };

  const handleEdit = (privacy: PrivacyEntry) => {
    setEditingId(privacy._id);
    setFormData({
      image: null,
      content: privacy.content,
    });
  };

  const handleUpdate = async (id: string) => {
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
      formDataToSend.append("content", JSON.stringify(formData.content));

      await updatePrivacy({
        id,
        formData: formDataToSend,
        content: formData.content,
      });
      setEditingId(null);
      resetForm();
      toast.success("Privacy updated successfully");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update privacy");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      await deletePrivacy(id);
      toast.success("Privacy deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete privacy");
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
        Error loading privacies
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="font-roboto">
        <div className="w-full">
          <Header pageName="Privacy Page" />
        </div>
        <div className="w-2/3 mx-auto mt-8">
          {!privacies?.length && !isCreating && (
            <Card className="mb-6 border-none shadow-none">
              <CardContent>
                <Button
                  onClick={() => setIsCreating(true)}
                  variant="spaceStarOutline"
                  className="w-1/3 font-normal text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Privacy
                </Button>
              </CardContent>
            </Card>
          )}

          {isCreating && (
            <Card className="border-none shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Create New Privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PrivacyForm
                  formData={formData}
                  onImageChange={handleImageChange}
                  onContentChange={handleContentChange}
                  onSubmit={handleCreate}
                />
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6">
            {privacies?.map((privacy) => (
              <PrivacyCard
                key={privacy._id}
                privacy={privacy}
                isEditing={editingId === privacy._id}
                formData={formData}
                onEdit={() => handleEdit(privacy)}
                onUpdate={() => handleUpdate(privacy._id)}
                onDelete={() => handleDelete(privacy._id)}
                onCancel={() => {
                  setEditingId(null);
                  resetForm();
                }}
                onImageChange={handleImageChange}
                onContentChange={handleContentChange}
              />
            ))}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

interface PrivacyFormProps {
  formData: PrivacyFormData;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (content: TipTapContent) => void;
  onSubmit: () => void;
}

function PrivacyForm({
  formData,
  onImageChange,
  onContentChange,
  onSubmit,
}: PrivacyFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <ImageUpload image={formData.image} onChange={onImageChange} />
        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <TipTapEditor content={formData.content} onChange={onContentChange} />
        </div>
        <div className="">
          <Button
            onClick={onSubmit}
            variant="spaceStarOutline"
            className="w-1/3 flex-1 font-medium text-gray-700 hover:bg-gray-50 rounded-full transition-all hover:shadow-md border-2 border-gray-500 hover:border-gray-500 py-2 mr-3"
          >
            Create Privacy
          </Button>
        </div>
      </div>
    </div>
  );
}

interface PrivacyCardProps {
  privacy: PrivacyEntry;
  isEditing: boolean;
  formData: PrivacyFormData;
  onEdit: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (content: TipTapContent) => void;
}

function PrivacyCard({
  privacy,
  isEditing,
  formData,
  onEdit,
  onUpdate,
  onDelete,
  onCancel,
  onImageChange,
  onContentChange,
}: PrivacyCardProps) {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 w-full overflow-hidden rounded-md">
        <Image
          src={privacy.image}
          alt="Privacy image"
          fill
          className="object-cover"
        />
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <ImageUpload
            image={formData.image}
            onChange={onImageChange}
            optional
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <TipTapEditor
              content={formData.content}
              onChange={onContentChange}
            />
          </div>
          <div className="gap-3 pt-2">
            <Button
              variant="spaceStarOutline"
              onClick={onUpdate}
              className="w-1/3 flex-1 font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md rounded-full transition-all border-2 border-gray-500 hover:border-gray-500 py-2 mr-3"
            >
              Save
            </Button>
            <Button
              variant="spaceStarOutline"
              onClick={onCancel}
              className="w-1/3 flex-1 font-medium text-white bg-red-500 hover:bg-red-600 rounded-full transition-all shadow-sm hover:shadow-md"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <TipTapContentDisplay content={privacy.content} />
          </div>
          <div className="gap-3 pt-2">
            <Button
              variant="spaceStarOutline"
              onClick={onEdit}
              className="w-1/3 flex-1 font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md rounded-full transition-all border-2 border-gray-500 hover:border-gray-500 py-2 mr-3"
            >
              Edit
            </Button>
            <Button
              variant="spaceStarOutline"
              onClick={onDelete}
              className="w-1/3 flex-1 font-medium text-white bg-red-500 hover:bg-red-600 rounded-full transition-all shadow-sm hover:shadow-md"
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ImageUploadProps {
  image: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  optional?: boolean;
}

function ImageUpload({ image, onChange, optional }: ImageUploadProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Image {optional && "(optional)"}
      </label>
      <Input type="file" accept="image/*" onChange={onChange} />
      {image && (
        <p className="text-sm text-green-600">Image selected: {image.name}</p>
      )}
    </div>
  );
}
