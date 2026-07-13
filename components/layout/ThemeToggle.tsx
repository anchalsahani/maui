import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  return (
    <button
      type="button"
      data-theme-toggle
      aria-label="Switch to dark mode"
      className="maui-button-secondary group flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:-translate-y-0.5 sm:h-11 sm:w-11"
    >
      <Sun
        size={18}
        className="hidden transition-transform duration-200 group-hover:scale-105 dark-theme-icon-light"
      />
      <Moon
        size={18}
        className="transition-transform duration-200 group-hover:scale-105 dark-theme-icon-dark"
      />
    </button>
  );
}
