"use client";

import React from "react";
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
import { ArrowLeft } from "lucide-react";
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

// Extract categories and priorities from schema for consistency
const CATEGORIES = requestSchema._def.schema.shape.category._def.values;
const PRIORITIES = requestSchema._def.schema.shape.priority._def.values;

export default function NewRequestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const createRequest = useCreateRequest();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Food and Supplies",
      priority: "medium",
      otherCategory: "",
    },
  });

  const category = form.watch("category");

  const handleSubmit = (values: RequestFormValues) => {
    if (!user?.id || !user?.name) {
      toast.error("User information is missing. Please log in again.");
      return;
    }

    createRequest.mutate(
      {
        title: values.title,
        description: values.description || "",
        category: values.category,
        priority: values.priority,
        otherCategory:
          values.category === "Other" ? values.otherCategory : undefined,
        status: "pending",
        createdBy: user.id,
        createdByName: user.name,
      },
      {
        onSuccess: () => {
          toast.success("Request submitted successfully.");
          form.reset();
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
