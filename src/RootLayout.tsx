// src/layouts/RootLayout.tsx
import { Outlet } from "react-router";
import Navbar from "./components/Navbar";

export default function RootLayout() {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
