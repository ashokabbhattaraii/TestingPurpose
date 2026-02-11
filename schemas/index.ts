import * as z from "zod";

// Request validation schema
export const requestSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    category: z.enum(
      ["Food and Supplies", "Office Maintenance", "Cleaning", "Other"] as const,
      {
        errorMap: () => ({ message: "Please select a valid category" }),
      },
    ),
    priority: z.enum(["low", "medium", "high"] as const, {
      errorMap: () => ({ message: "Please select a valid priority" }),
    }),
    otherCategory: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.category === "Other") {
        return (
          data.otherCategory &&
          data.otherCategory.trim().length >= 3 &&
          data.otherCategory.trim().length <= 15
        );
      }
      return true;
    },
    {
      message: "Please specify the category (3-15 characters)",
      path: ["otherCategory"],
    },
  );

export type RequestFormValues = z.infer<typeof requestSchema>;
