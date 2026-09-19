"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="status-page"><AlertTriangle size={42} /><h1>Something went wrong</h1><p>We could not load this part of Docly. Please try again.</p><button className="btn" type="button" onClick={reset}>Try again</button></main>;
}
