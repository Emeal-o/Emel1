import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply saved theme before first paint to avoid flash
const stored = localStorage.getItem("f1-theme");
const theme = stored === "light" || stored === "monaco" ? stored : "dark";
document.documentElement.classList.add(theme);

createRoot(document.getElementById("root")!).render(<App />);
