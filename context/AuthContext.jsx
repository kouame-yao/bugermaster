import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // contiendra uid, email...
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/userconnect/recupeuser", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok) {
          setUser(data?.user); // { uid, email, ... }
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour utiliser l'auth
export function useAuth() {
  return useContext(AuthContext);
}
