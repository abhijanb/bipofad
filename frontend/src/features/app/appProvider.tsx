import { Suspense, type ReactNode } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "./store";
import { AuthHydrator } from "@/features/auth/session";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Provider store={store}>
        <AuthHydrator />
        {children}
        <Toaster position="top-right" richColors closeButton theme="light" />
      </Provider>
    </Suspense>
  );
}
