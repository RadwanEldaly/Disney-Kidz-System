import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, isPending } = useCurrentUserState();

  // When auth is off (VITE_AUTH_ENABLED=false), useCurrentUserState returns the
  // shared staff user immediately — open the dashboard with no login wall.
  if (!authEnabled) {
    return (
      <AppShell>
        <Outlet />
      </AppShell>
    );
  }

  if (isPending) {
    return (
      <div className="flex min-h-dvh bg-background">
        <div className="hidden w-60 border-r border-border md:block" />
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-48" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
