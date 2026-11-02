import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import { LoginForm } from "./features/auth/components/loginForm";
import { RegisterForm } from "./features/auth/components/registerForm";
import { Guard } from "./features/auth/guards";
import { AuthPage } from "./pages/authPage";
import { HomePage } from "./pages/homePage";
import { VaultPage } from "./pages/vaultPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Guard>
              <HomePage />
            </Guard>
          }
        />
        <Route
          path="/vault"
          element={
            <Guard>
              <VaultPage />
            </Guard>
          }
        />
        <Route
          path="/login"
          element={
            <AuthPage>
              <LoginForm />
            </AuthPage>
          }
        />
        <Route
          path="/register"
          element={
            <AuthPage>
              <RegisterForm />
            </AuthPage>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
