"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  FilePlus,
  FolderOpen,
  Home,
  Menu,
  Search,
  Settings,
  Share2,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Logo } from "@/features/marketing";
import { ThemeToggle } from "@/components/theme-toggle";
import { routes } from "@/lib/constants";

const items = [
  [Home, "Home", "/dashboard"],
  [FolderOpen, "My files", "/documents"],
  [FilePlus, "Recent", "/recent"],
  [Star, "Starred", "/starred"],
  [Share2, "Shared with me", "/shared"],
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const closeNavigation = () => setNavigationOpen(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeNavigation();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div className="app-shell">
      <button
        className={`sidebar-backdrop ${navigationOpen ? "is-open" : ""}`}
        type="button"
        aria-label="Close navigation"
        tabIndex={navigationOpen ? 0 : -1}
        onClick={closeNavigation}
      />
      <aside
        className={`sidebar ${navigationOpen ? "is-open" : ""}`}
        id="workspace-navigation"
      >
        <div className="sidebar-top">
          <Logo />
          <button
            className="sidebar-close icon-button"
            type="button"
            aria-label="Close navigation"
            onClick={closeNavigation}
          >
            <X size={19} />
          </button>
        </div>
        <Link
          className="btn new-file"
          style={{ marginTop: 22 }}
          href={routes.newDocument}
          onClick={closeNavigation}
        >
          <FilePlus size={16} />
          <span>New file</span>
        </Link>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          {items.map(([Icon, label, href]) => (
            <Link
              title={label}
              className="nav-item"
              href={href}
              key={href}
              onClick={closeNavigation}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
          <br />
          <Link
            title="Trash"
            className="nav-item"
            href="/trash"
            onClick={closeNavigation}
          >
            <Trash2 size={18} />
            <span>Trash</span>
          </Link>
          <Link
            title="Settings"
            className="nav-item"
            href="/settings"
            onClick={closeNavigation}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">AM</span>
            <div>
              <b>Alex Morgan</b>
              <small className="muted" style={{ display: "block" }}>
                alex@nexora.dev
              </small>
            </div>
          </div>
        </div>
      </aside>
      <section className="app-main">
        <header className="app-header">
          <div className="header-workspace">
            <button
              className="sidebar-toggle icon-button"
              type="button"
              aria-label="Open navigation"
              aria-controls="workspace-navigation"
              aria-expanded={navigationOpen}
              onClick={() => setNavigationOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="muted">Workspace</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className="header-search"
              type="button"
              aria-label="Search documents"
            >
              <Search size={15} />
              Search documents <kbd>⌘ K</kbd>
            </button>
            <ThemeToggle />
            <span className="avatar">AM</span>
          </div>
        </header>
        {children}
        <Link
          className="fab"
          href={routes.newDocument}
          aria-label="Create a new file"
        >
          <FilePlus size={22} />
        </Link>
      </section>
    </div>
  );
}
