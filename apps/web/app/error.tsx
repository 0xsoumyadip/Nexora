"use client";

import { AlertTriangle } from "lucide-react";
export default function Error() { return <main className="status-page"><AlertTriangle size={42} /><h1>Something went wrong</h1><p>We could not load this part of Nexora. Please try again.</p><button className="btn" type="button">Try again</button></main>; }
