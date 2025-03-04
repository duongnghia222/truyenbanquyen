'use client';

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import the GoogleAnalytics component with SSR disabled
const GoogleAnalytics = dynamic(
  () => import("./GoogleAnalytics"),
  { ssr: false }
);

export default function GoogleAnalyticsWrapper({ 
  measurementId 
}: { 
  measurementId: string 
}) {
  return (
    <Suspense fallback={null}>
      <GoogleAnalytics GA_MEASUREMENT_ID={measurementId} />
    </Suspense>
  );
} 