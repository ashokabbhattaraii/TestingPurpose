import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ServiceRequest,
  RequestStatus,
  LunchToken,
  MealPreference,
  Notification,
} from "./types";
import {
  serviceRequests,
  announcements,
  users,
  analyticsData,
  lunchTokens,
  notifications,
  getSortedAnnouncements,
} from "./data";

// Simulate async fetch
function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export function useServiceRequests(userId?: string) {
  return useQuery({
    queryKey: ["serviceRequests", userId],
    queryFn: () => {
      const filtered = userId
        ? serviceRequests.filter((r) => r.createdBy === userId)
        : serviceRequests;
      return delay([...filtered]);
    },
  });
}

export function useServiceRequest(id: string) {
  return useQuery({
    queryKey: ["serviceRequest", id],
    queryFn: () => {
      const found = serviceRequests.find((r) => r.id === id);
      return delay(found || null);
    },
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: () => delay(getSortedAnnouncements()),
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => delay([...users]),
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => delay({ ...analyticsData }),
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      newRequest: Omit<ServiceRequest, "id" | "createdAt" | "updatedAt">,
    ) => {
      const request: ServiceRequest = {
        ...newRequest,
        id: `SR-${String(serviceRequests.length + 1).padStart(3, "0")}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      serviceRequests.unshift(request);
      return delay(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<ServiceRequest, "title" | "description" | "category" | "priority" | "otherCategory">>;
    }) => {
      const request = serviceRequests.find((r) => r.id === id);
      if (!request) throw new Error("Request not found");
      Object.assign(request, updates, { updatedAt: new Date().toISOString() });
      return delay(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
      queryClient.invalidateQueries({ queryKey: ["serviceRequest"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const index = serviceRequests.findIndex((r) => r.id === id);
      if (index === -1) throw new Error("Request not found");
      serviceRequests.splice(index, 1);
      return delay({ success: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
      queryClient.invalidateQueries({ queryKey: ["serviceRequest"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: import("./types").UserRole;
    }) => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        user.role = role;
      }
      return delay(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) => {
      const request = serviceRequests.find((r) => r.id === id);
      if (request) {
        request.status = status;
        request.updatedAt = new Date().toISOString();
      }
      return delay(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
      queryClient.invalidateQueries({ queryKey: ["serviceRequest"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useAssignRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      assignedToId,
      assignedToName,
      assignedByName,
    }: {
      requestId: string;
      assignedToId: string;
      assignedToName: string;
      assignedByName: string;
    }) => {
      const request = serviceRequests.find((r) => r.id === requestId);
      if (request) {
        request.assignedTo = assignedToId;
        request.assignedToName = assignedToName;
        request.updatedAt = new Date().toISOString();
        if (request.status === "pending") {
          request.status = "in-progress";
        }
      }
      // Create a notification for the assigned user
      const notif: Notification = {
        id: `n-${Date.now()}`,
        userId: assignedToId,
        title: "New Assignment",
        message: `${assignedByName} assigned you to request ${requestId}: ${request?.title || ""}`,
        read: false,
        createdAt: new Date().toISOString(),
        link: `/dashboard/requests/${requestId}`,
      };
      notifications.unshift(notif);
      return delay(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
      queryClient.invalidateQueries({ queryKey: ["serviceRequest"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// --- Lunch Token Hooks ---

export function useLunchTokens(date?: string) {
  return useQuery({
    queryKey: ["lunchTokens", date],
    queryFn: () => {
      const filtered = date
        ? lunchTokens.filter((t) => t.date === date)
        : lunchTokens;
      return delay([...filtered]);
    },
  });
}

export function useLunchTokenForUser(userId: string, date: string) {
  return useQuery({
    queryKey: ["lunchToken", userId, date],
    queryFn: () => {
      const found = lunchTokens.find(
        (t) => t.userId === userId && t.date === date,
      );
      return delay(found || null);
    },
  });
}

export function useCollectLunchToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      userName,
      preference,
    }: {
      userId: string;
      userName: string;
      preference: MealPreference;
    }) => {
      const today = new Date().toISOString().split("T")[0];
      const existing = lunchTokens.find(
        (t) => t.userId === userId && t.date === today,
      );
      if (existing) {
        throw new Error("Token already collected for today");
      }
      const token: LunchToken = {
        id: `lt-${Date.now()}`,
        userId,
        userName,
        date: today,
        preference,
        collectedAt: new Date().toISOString(),
      };
      lunchTokens.unshift(token);
      return delay(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lunchTokens"] });
      queryClient.invalidateQueries({ queryKey: ["lunchToken"] });
    },
  });
}

// --- Notification Hooks ---

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => {
      const filtered = userId
        ? notifications.filter((n) => n.userId === userId && !n.read)
        : notifications.filter((n) => !n.read);
      return delay([...filtered]);
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => {
      const notif = notifications.find((n) => n.id === notificationId);
      if (notif) {
        notif.read = true;
      }
      return delay(notif);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// --- Announcement Hooks ---

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      content,
      authorId,
      authorName,
    }: {
      title: string;
      content: string;
      authorId: string;
      authorName: string;
    }) => {
      const announcement = {
        id: `a${announcements.length + 1}`,
        title,
        content,
        author: authorId,
        authorName,
        createdAt: new Date().toISOString(),
        pinned: false,
      };
      announcements.unshift(announcement);
      return delay(announcement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export function usePinAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      announcementId,
      pinned,
    }: {
      announcementId: string;
      pinned: boolean;
    }) => {
      const announcement = announcements.find((a) => a.id === announcementId);
      if (announcement) {
        announcement.pinned = pinned;
      }
      return delay(announcement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}
