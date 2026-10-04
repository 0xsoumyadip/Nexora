"use client";

import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/constants";
import { useSession } from "@nexora/auth/client"
import { useRouter } from "next/navigation";
import { ApiError } from "@/client";
import { createDocument } from "../lib/auth";
import { useEffect } from "react";

export function NewDocument() {

  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return null;
  }

  const userId = session.user.id;

  async function handleClick() {
    try {
      const result = await createDocument(userId);
      console.log(result);
    } catch (error) {
      if (error instanceof ApiError) {
        console.log("Create new document error: ", error.message)
      }
      console.log("Unable to create new document");
    }
  }

  return (
    <div className="app-content new-doc">
      <Link className="btn ghost" href={routes.dashboard}>
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
      <div className="page-title" style={{ marginTop: 24 }}>
        <div>
          <h1>Create a new document</h1>
          <p>Start with a blank page and write freely.</p>
        </div>
      </div>
      <div className="new-card">
        <span className="doc-icon">
          <FileText size={22} />
        </span>
        <h2>Blank document</h2>
        <p>
          Start with an empty page and shape it around the work in front of you.
        </p>
        <button className="btn full" type="button" onClick={handleClick}>
          Create document
        </button>
      </div>
      <div className="disabled-options">
        <div className="disabled-option">
          <b>Start from template</b>
          <br />
          <small>Coming soon</small>
        </div>
        <div className="disabled-option">
          <b>Import file</b>
          <br />
          <small>Coming soon</small>
        </div>
      </div>
    </div>
  );
}
