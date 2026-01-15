// src/layouts/RootLayout.tsx
import { Outlet } from "react-router";

export function RootLayout() {
  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
