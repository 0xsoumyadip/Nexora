"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
export function ThemeToggle() { const [dark, setDark] = useState(false); useEffect(() => setDark(document.documentElement.classList.contains("dark")), []); const toggle = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle("dark", next); localStorage.setItem("docly-theme", next ? "dark" : "light"); }; return <button className="icon-button" onClick={toggle} aria-label="Toggle theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>; }
