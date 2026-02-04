import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize theme from localStorage or system preference before render
if (typeof window !== 'undefined') {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}

createRoot(document.getElementById("root")!).render(<App />);
