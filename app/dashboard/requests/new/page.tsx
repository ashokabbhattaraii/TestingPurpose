"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCreateRequest } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Paperclip, X, FileText, ImageIcon, File } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { requestSchema, type RequestFormValues } from "@/schemas";
import type { Attachment } from "@/lib/types";

const CATEGORIES = requestSchema._def.schema.shape.category._def.values;
const PRIORITIES = requestSchema._def.schema.shape.priority._def.values;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;
const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-muted-foreground" />;
  if (type === "application/pdf") return <FileText className="h-4 w-4 text-red-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

export default function NewRequestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const createRequest = useCreateRequest();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      requestType: "issue",
      title: "",
      description: "",
      category: "Food and Supplies",
      priority: "medium",
      otherCategory: "",
    },
  });

  const category = form.watch("category");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_FILES - attachments.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }

    const newAttachments: Attachment[] = [];
    const fileArray = Array.from(files).slice(0, remaining);

    for (const file of fileArray) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" is not a supported file type.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds 5MB limit.`);
        continue;
      }
      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((a) => a.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSubmit = (values: RequestFormValues) => {
    if (!user?.id || !user?.name) {
      toast.error("User information is missing. Please log in again.");
      return;
    }

    createRequest.mutate(
      {
        requestType: values.requestType,
        title: values.title,
        description: values.description || "",
        category: values.category,
        priority: values.priority,
        otherCategory:
          values.category === "Other" ? values.otherCategory : undefined,
        status: "pending",
        createdBy: user.id,
        createdByName: user.name,
        attachments: attachments.length > 0 ? attachments : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Request submitted successfully.");
          form.reset();
          setAttachments([]);
          router.push("/dashboard/requests");
        },
        onError: (error) => {
          console.error("Failed to submit request:", error);
          toast.error("Failed to submit request. Please try again.");
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/requests">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Requests
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            New Service Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-4"
            >
              {/* Request Type Radio */}
              <FormField
                control={form.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Type *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        <label
                          htmlFor="type-issue"
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm transition-colors has-[*[data-state=checked]]:border-primary has-[*[data-state=checked]]:bg-primary/5"
                        >
                          <RadioGroupItem value="issue" id="type-issue" />
                          <span className="font-medium text-foreground">Issue</span>
                        </label>
                        <label
                          htmlFor="type-asset"
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm transition-colors has-[*[data-state=checked]]:border-primary has-[*[data-state=checked]]:bg-primary/5"
                        >
                          <RadioGroupItem value="asset-request" id="type-asset" />
                          <span className="font-medium text-foreground">Asset Request</span>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description of your request"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details about your request..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map(
                            (cat: RequestFormValues["category"]) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRIORITIES.map(
                            (priority: RequestFormValues["priority"]) => (
                              <SelectItem key={priority} value={priority}>
                                {priority.charAt(0).toUpperCase() +
                                  priority.slice(1)}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {category === "Other" && (
                <FormField
                  control={form.control}
                  name="otherCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specify Category *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Please specify your category (3-15 characters)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Attachments */}
              <div className="flex flex-col gap-2">
                <FormLabel>Attachments</FormLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Upload attachments"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachments.length >= MAX_FILES}
                  className="w-fit gap-2"
                >
                  <Paperclip className="h-4 w-4" />
                  Add Attachment
                </Button>
                <p className="text-xs text-muted-foreground">
                  Max {MAX_FILES} files, up to 5MB each. Supported: images, PDF, Word, text.
                </p>

                {attachments.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                      >
                        {getFileIcon(att.type)}
                        <span className="flex-1 truncate text-foreground">
                          {att.name}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatFileSize(att.size)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => removeAttachment(att.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                          <span className="sr-only">Remove {att.name}</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="mt-2"
                disabled={createRequest.isPending}
              >
                {createRequest.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
