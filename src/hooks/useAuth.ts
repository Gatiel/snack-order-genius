import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "gerente" | "funcionario" | "cliente";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configurar listener primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Buscar roles do usuário
        if (session?.user) {
          setTimeout(async () => {
            const { data } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id);
            
            if (data) {
              setRoles(data.map(r => r.role as UserRole));
            }
          }, 0);
        } else {
          setRoles([]);
        }
      }
    );

    // Depois verificar sessão existente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Buscar roles do usuário
      if (session?.user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);
        
        if (data) {
          setRoles(data.map(r => r.role as UserRole));
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
  };

  const hasRole = (role: UserRole) => {
    return roles.includes(role);
  };

  const isAdmin = () => hasRole("admin");
  const isGerente = () => hasRole("gerente");
  const isFuncionario = () => hasRole("funcionario");
  const isCliente = () => hasRole("cliente");

  return {
    user,
    session,
    roles,
    loading,
    signOut,
    hasRole,
    isAdmin,
    isGerente,
    isFuncionario,
    isCliente,
    isAuthenticated: !!user,
  };
};