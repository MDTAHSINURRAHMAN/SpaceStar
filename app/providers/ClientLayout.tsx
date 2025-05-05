"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { Toaster } from "sonner";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <Toaster richColors position="top-center" />
      {children}
    </Provider>
  );
}
