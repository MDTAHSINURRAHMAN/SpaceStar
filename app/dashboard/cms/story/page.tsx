"use client";

import { useState } from "react";
import {
  useGetAllStoriesQuery,
  useCreateStoryMutation,
  useUpdateStoryMutation,
  useDeleteStoryMutation,
} from "@/lib/api/storyApi";
import { StoryEntry, StoryContentBlock } from "@/types/story";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import RequireAuth from "@/app/providers/RequireAuth";
import Loader from "@/app/components/Loader";
import { Header } from "@/app/components/header/Header";

interface StoryFormData {
  image: File | null;
  content: StoryContentBlock[];
}

const INITIAL_FORM_STATE: StoryFormData = {
  image: null,
  content: [{ title: "", description: "" }]
};

export default function StoryPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StoryFormData>(INITIAL_FORM_STATE);

  const { data: stories, isLoading, error } = useGetAllStoriesQuery();
  const [createStory] = useCreateStoryMutation();
  const [updateStory] = useUpdateStoryMutation();
  const [deleteStory] = useDeleteStoryMutation();

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
  };

  const handleContentChange = (
    index: number,
    field: keyof StoryContentBlock,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.map((block, i) => 
        i === index ? { ...block, [field]: value } : block
      )
    }));
  };

  const addContentBlock = () => {
    setFormData(prev => ({
      ...prev,
      content: [...prev.content, { title: "", description: "" }]
    }));
  };

  const removeContentBlock = (index: number) => {
    if (formData.content.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };

  const validateForm = () => {
    if (!formData.image && !editingId) {
      toast.error("Please select an image");
      return false;
    }

    if (formData.content.some(block => !block.title || !block.description)) {
      toast.error("Please fill in all content fields");
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

      await createStory(formDataToSend);
      setIsCreating(false);
      resetForm();
      toast.success("Story created successfully");
    } catch (err) {
      console.error("Create error:", err);
      toast.error("Failed to create story");
    }
  };

  const handleEdit = (story: StoryEntry) => {
    setEditingId(story._id);
    setFormData({
      image: null,
      content: story.content
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

      await updateStory({ id, formData: formDataToSend });
      setEditingId(null);
      resetForm();
      toast.success("Story updated successfully");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update story");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      await deleteStory(id);
      toast.success("Story deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete story");
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
        Error loading stories
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="font-roboto">
        <div className="w-full">
          <Header pageName="Story Page" />
        </div>
        <div className="w-2/3 mx-auto mt-8">
          {!stories?.length && !isCreating && (
            <Card className="mb-6 border-none shadow-none">
              <CardContent>
                <Button 
                  onClick={() => setIsCreating(true)}
                  variant="spaceStarOutline"
                  className="w-1/3 font-normal text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Story
                </Button>
              </CardContent>
            </Card>
          )}

          {isCreating && (
            <Card className="border-none shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Create New Story</CardTitle>
              </CardHeader>
              <CardContent>
                <StoryForm
                  formData={formData}
                  onImageChange={handleImageChange}
                  onContentChange={handleContentChange}
                  onAddBlock={addContentBlock}
                  onRemoveBlock={removeContentBlock}
                  onSubmit={handleCreate}
                />
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6">
            {stories?.map((story) => (
              <StoryCard
                key={story._id}
                story={story}
                isEditing={editingId === story._id}
                formData={formData}
                onEdit={() => handleEdit(story)}
                onUpdate={() => handleUpdate(story._id)}
                onDelete={() => handleDelete(story._id)}
                onCancel={() => {
                  setEditingId(null);
                  resetForm();
                }}
                onImageChange={handleImageChange}
                onContentChange={handleContentChange}
                onAddBlock={addContentBlock}
                onRemoveBlock={removeContentBlock}
              />
            ))}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

interface StoryFormProps {
  formData: StoryFormData;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (index: number, field: keyof StoryContentBlock, value: string) => void;
  onAddBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onSubmit: () => void;
}

function StoryForm({
  formData,
  onImageChange,
  onContentChange,
  onAddBlock,
  onRemoveBlock,
  onSubmit
}: StoryFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <ImageUpload
          image={formData.image}
          onChange={onImageChange}
        />
        <ContentBlockList
          blocks={formData.content}
          onChange={onContentChange}
          onAdd={onAddBlock}
          onRemove={onRemoveBlock}
        />
        <div className="flex gap-2">
          <Button 
            onClick={onSubmit}
            variant="spaceStarOutline"
            className="flex-1 font-medium hover:bg-blue-50 rounded-full transition-all border-2 border-gray-200 hover:border-gray-300 py-2"
          >
            Create Story
          </Button>
        </div>
      </div>
    </div>
  );
}

interface StoryCardProps {
  story: StoryEntry;
  isEditing: boolean;
  formData: StoryFormData;
  onEdit: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (index: number, field: keyof StoryContentBlock, value: string) => void;
  onAddBlock: () => void;
  onRemoveBlock: (index: number) => void;
}

function StoryCard({
  story,
  isEditing,
  formData,
  onEdit,
  onUpdate,
  onDelete,
  onCancel,
  onImageChange,
  onContentChange,
  onAddBlock,
  onRemoveBlock
}: StoryCardProps) {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 w-full overflow-hidden rounded-md">
        <Image
          src={story.image}
          alt="Story image"
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
          <ContentBlockList
            blocks={formData.content}
            onChange={onContentChange}
            onAdd={onAddBlock}
            onRemove={onRemoveBlock}
          />
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
          {story.content.map((block, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-bold mb-2">{block.title}</h3>
              <p className="text-gray-700">{block.description}</p>
            </div>
          ))}
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
      <label className="text-sm font-medium">Image {optional && "(optional)"}</label>
      <Input type="file" accept="image/*" onChange={onChange} />
      {image && (
        <p className="text-sm text-green-600">
          Image selected: {image.name}
        </p>
      )}
    </div>
  );
}

interface ContentBlockListProps {
  blocks: StoryContentBlock[];
  onChange: (index: number, field: keyof StoryContentBlock, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

function ContentBlockList({
  blocks,
  onChange,
  onAdd,
  onRemove
}: ContentBlockListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Content Blocks</label>
        <Button
          variant="spaceStarOutline"
          onClick={onAdd}
          className="font-normal text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Block
        </Button>
      </div>

      {blocks.map((block, index) => (
        <div key={index} className="p-4 border rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Block {index + 1}</h3>
            <Button
              variant="ghost"
              onClick={() => onRemove(index)}
              disabled={blocks.length <= 1}
              className="p-1"
            >
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={block.title}
                onChange={(e) => onChange(index, "title", e.target.value)}
                placeholder="Enter title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={block.description}
                onChange={(e) => onChange(index, "description", e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
