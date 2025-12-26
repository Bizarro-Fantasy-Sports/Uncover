// src/layouts/RootLayout.tsx
import { Outlet } from "react-router";
import { Navbar } from "@/components";

export function RootLayout() {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
