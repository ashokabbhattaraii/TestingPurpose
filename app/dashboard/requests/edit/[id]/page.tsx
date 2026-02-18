"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useServiceRequest, useUpdateRequest } from "@/lib/queries";
import { useRouter, useParams } from "next/navigation";
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
import { ArrowLeft, Loader } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

// Extract categories and priorities from schema for consistency
const CATEGORIES = requestSchema._def.schema.shape.category._def.values;
const PRIORITIES = requestSchema._def.schema.shape.priority._def.values;

export default function EditRequestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: request, isLoading } = useServiceRequest(id);
  const updateRequest = useUpdateRequest();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      requestType: request?.requestType || "issue",
      title: request?.title || "",
      description: request?.description || "",
      category: request?.category || "Food and Supplies",
      priority: request?.priority || "medium",
      otherCategory: request?.otherCategory || "",
    },
  });

  // Update form when request data loads
  React.useEffect(() => {
    if (request) {
      form.reset({
        requestType: request.requestType || "issue",
        title: request.title,
        description: request.description,
        category: request.category,
        priority: request.priority,
        otherCategory: request.otherCategory || "",
      });
    }
  }, [request, form]);

  const category = form.watch("category");

  // Check authorization
  const isCreator = user?.id === request?.createdBy;
  const isNotPending = request && request.status !== "pending";

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm text-muted-foreground">Request not found.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/dashboard/requests">Back to Requests</Link>
        </Button>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm text-muted-foreground">
          You can only edit your own requests.
        </p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href={`/dashboard/requests/${id}`}>Back to Request</Link>
        </Button>
      </div>
    );
  }

  if (isNotPending) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm text-muted-foreground">
          You can only edit requests with pending status.
        </p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href={`/dashboard/requests/${id}`}>Back to Request</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = (values: RequestFormValues) => {
    updateRequest.mutate(
      {
        id: request.id,
        requestType: values.requestType,
        title: values.title,
        description: values.description || "",
        category: values.category,
        priority: values.priority,
        otherCategory:
          values.category === "Other" ? values.otherCategory : undefined,
        status: request.status,
        createdBy: request.createdBy,
        createdByName: request.createdByName,
        createdAt: request.createdAt,
        updatedAt: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Request updated successfully.");
          router.push(`/dashboard/requests/${request.id}`);
        },
        onError: (error) => {
          console.error("Failed to update request:", error);
          toast.error("Failed to update request. Please try again.");
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/requests/${id}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Request
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Edit Service Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Type *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <label
                          htmlFor="edit-type-issue"
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm transition-colors has-[*[data-state=checked]]:border-primary has-[*[data-state=checked]]:bg-primary/5"
                        >
                          <RadioGroupItem value="issue" id="edit-type-issue" />
                          <span className="font-medium text-foreground">Issue</span>
                        </label>
                        <label
                          htmlFor="edit-type-asset"
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm transition-colors has-[*[data-state=checked]]:border-primary has-[*[data-state=checked]]:bg-primary/5"
                        >
                          <RadioGroupItem value="asset-request" id="edit-type-asset" />
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

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={updateRequest.isPending}
                >
                  {updateRequest.isPending ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Request"
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/dashboard/requests/${id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
