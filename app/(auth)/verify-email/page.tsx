import { Suspense } from "react";
import { VerifyEmailContent } from "../verify-email-content";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export const dynamic = "force-dynamic";

function VerifyFallback() {
  return (
    <Card className="flex flex-col items-center border-border py-12 text-center">
      <Skeleton className="mb-4 size-14 shrink-0 rounded-full" />
      <Skeleton className="mx-auto h-4 w-40 max-w-full" />
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
