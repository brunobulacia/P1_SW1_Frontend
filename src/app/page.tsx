import AuthPage from "@/components/auth/auth";
import { PublicRoute } from "@/components/auth/PublicRoute";

function HomePage() {
  return (
    <PublicRoute>
      <AuthPage />
    </PublicRoute>
  );
}

export default HomePage;
