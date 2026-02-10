"use client"

import { useAuth } from "@/lib/auth-context"
import {
  useLunchTokenForUser,
  useLunchTokens,
  useCollectLunchToken,
} from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { UtensilsCrossed, Clock, Leaf, Drumstick, CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { useState, useMemo } from "react"
import { toast } from "sonner"
import type { MealPreference } from "@/lib/types"

function getToday() {
  return new Date().toISOString().split("T")[0]
}

function isBefore11AM() {
  const now = new Date()
  return now.getHours() < 11
}

export default function LunchTokenPage() {
  const { user } = useAuth()
  const today = getToday()
  const { data: myToken, isLoading: tokenLoading } = useLunchTokenForUser(
    user?.id || "",
    today
  )
  const { data: allTokensToday, isLoading: allLoading } = useLunchTokens(today)
  const collectToken = useCollectLunchToken()
  const [preference, setPreference] = useState<MealPreference | null>(null)

  const canCollect = isBefore11AM()
  const alreadyCollected = !!myToken

  const isAdmin = user?.role === "admin" || user?.role === "superadmin"

  const stats = useMemo(() => {
    if (!allTokensToday) return { total: 0, veg: 0, nonVeg: 0 }
    return {
      total: allTokensToday.length,
      veg: allTokensToday.filter((t) => t.preference === "veg").length,
      nonVeg: allTokensToday.filter((t) => t.preference === "non-veg").length,
    }
  }, [allTokensToday])

  const handleCollect = () => {
    if (!user || !preference) return
    collectToken.mutate(
      { userId: user.id, userName: user.name, preference },
      {
        onSuccess: () => {
          toast.success("Lunch token collected successfully!")
          setPreference(null)
        },
        onError: (err) => {
          toast.error(err.message)
        },
      }
    )
  }

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Lunch Token</h1>
        <p className="text-sm text-muted-foreground">
          Collect your daily lunch token before 11:00 AM
        </p>
      </div>

      {/* Status banner */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {canCollect ? (
                <span className="text-xs text-green-600 font-medium">
                  Token collection is open (closes at 11:00 AM)
                </span>
              ) : (
                <span className="text-xs text-destructive font-medium">
                  Token collection is closed for today
                </span>
              )}
            </div>
          </div>
          {alreadyCollected ? (
            <Badge className="bg-green-100 text-green-800 gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Collected
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <XCircle className="h-3 w-3" />
              Not Collected
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Collect Token Card */}
      {tokenLoading ? (
        <Skeleton className="h-48" />
      ) : alreadyCollected ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Your Token for Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                {myToken?.preference === "veg" ? (
                  <Leaf className="h-6 w-6 text-green-600" />
                ) : (
                  <Drumstick className="h-6 w-6 text-orange-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground capitalize">
                  {myToken?.preference === "veg" ? "Vegetarian" : "Non-Vegetarian"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Collected at{" "}
                  {myToken
                    ? format(new Date(myToken.collectedAt), "h:mm a")
                    : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Select Your Meal Preference
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPreference("veg")}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  preference === "veg"
                    ? "border-green-500 bg-green-50"
                    : "border-border hover:border-green-300"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-foreground">Vegetarian</span>
              </button>
              <button
                type="button"
                onClick={() => setPreference("non-veg")}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  preference === "non-veg"
                    ? "border-orange-500 bg-orange-50"
                    : "border-border hover:border-orange-300"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <Drumstick className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-foreground">Non-Vegetarian</span>
              </button>
            </div>
            <Button
              onClick={handleCollect}
              disabled={!preference || !canCollect || collectToken.isPending}
              className="w-full"
            >
              {collectToken.isPending
                ? "Collecting..."
                : !canCollect
                  ? "Collection Closed (After 11 AM)"
                  : "Collect Lunch Token"}
            </Button>
            {!canCollect && (
              <p className="text-center text-xs text-destructive">
                Lunch token collection is only available before 11:00 AM.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin: Today's Summary */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              {"Today's Collection Summary"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {allLoading ? (
              <Skeleton className="h-16" />
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {stats.total}
                    </p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {stats.veg}
                    </p>
                    <p className="text-xs text-muted-foreground">Veg</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.nonVeg}
                    </p>
                    <p className="text-xs text-muted-foreground">Non-Veg</p>
                  </div>
                </div>

                {allTokensToday && allTokensToday.length > 0 && (
                  <div className="rounded-lg border border-border">
                    <div className="border-b border-border bg-muted/50 px-4 py-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Collected Tokens
                      </p>
                    </div>
                    <div className="divide-y divide-border">
                      {allTokensToday.map((token) => (
                        <div
                          key={token.id}
                          className="flex items-center justify-between px-4 py-2.5"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {token.userName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(token.collectedAt), "h:mm a")}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              token.preference === "veg"
                                ? "border-green-300 text-green-700"
                                : "border-orange-300 text-orange-700"
                            }
                          >
                            {token.preference === "veg" ? (
                              <Leaf className="mr-1 h-3 w-3" />
                            ) : (
                              <Drumstick className="mr-1 h-3 w-3" />
                            )}
                            {token.preference === "veg" ? "Veg" : "Non-Veg"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
