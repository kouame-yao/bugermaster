// components/ProtectedRoute.jsx
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/"); // redirection si non connecté
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <p className="p-5 text-center">Chargement...</p>; // ou un loader
  }

  return children;
}
