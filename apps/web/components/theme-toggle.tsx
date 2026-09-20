import { Moon } from "lucide-react";

export function ThemeToggle() {
  return (
    <button className="icon-button" type="button" aria-label="Toggle theme">
      <Moon size={17} />
    </button>
  );
}
