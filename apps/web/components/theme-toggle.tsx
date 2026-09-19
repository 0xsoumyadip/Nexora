"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const storageKey = "docly-theme";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const next = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(storageKey, next ? "dark" : "light");
  }
  return <button className="icon-button" type="button" onClick={toggle} aria-label="Toggle theme" aria-pressed={dark}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button>;
}
