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
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error loading stories
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Story Management</h1>
          <Button onClick={() => setIsCreating(!isCreating)}>
            {isCreating ? "Cancel" : "Add New Story"}
          </Button>
        </div>

        {isCreating && (
          <StoryForm
            formData={formData}
            onImageChange={handleImageChange}
            onContentChange={handleContentChange}
            onAddBlock={addContentBlock}
            onRemoveBlock={removeContentBlock}
            onSubmit={handleCreate}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {stories?.length === 0 && !isCreating && (
          <EmptyState onCreateClick={() => setIsCreating(true)} />
        )}
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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Create New Story</CardTitle>
      </CardHeader>
      <CardContent>
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
          <Button onClick={onSubmit} className="w-full">
            Create Story
          </Button>
        </div>
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Story</span>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={onUpdate}>Save</Button>
                <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={onDelete}>Delete</Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative h-48 w-full overflow-hidden rounded-md">
            <Image
              src={story.image}
              alt="Story image"
              fill
              className="object-cover"
            />
          </div>

          {isEditing ? (
            <div>
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
            </div>
          ) : (
            <div className="space-y-4">
              {story.content.map((block, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <h3 className="font-bold mb-2">{block.title}</h3>
                  <p className="text-gray-700">{block.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ImageUploadProps {
  image: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  optional?: boolean;
}

function ImageUpload({ image, onChange, optional }: ImageUploadProps) {
  return (
    <div>
      <label className="block mb-2">Image {optional && "(optional)"}</label>
      <Input type="file" accept="image/*" onChange={onChange} />
      {image && (
        <p className="mt-2 text-sm text-green-600">
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
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="font-medium">Content Blocks</label>
        <Button
          size="sm"
          variant="outline"
          onClick={onAdd}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Block
        </Button>
      </div>

      {blocks.map((block, index) => (
        <div key={index} className="p-4 border rounded-md mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Block {index + 1}</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(index)}
              disabled={blocks.length <= 1}
            >
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <Input
                value={block.title}
                onChange={(e) => onChange(index, "title", e.target.value)}
                placeholder="Enter title"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Description</label>
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

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center p-8 border rounded-md">
      <p className="text-gray-500 mb-4">No stories found</p>
      <Button onClick={onCreateClick}>Create Your First Story</Button>
    </div>
  );
}
