import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserProfile = {
  id_usuario: string;
  nome: string;
  email: string;
  papel: "admin" | "usuario";
  telefone?: string | null;
  data_cadastro?: string;
  status?: "ativo" | "inativo";
} | null;

export function useAuthUser() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const sessionResult = await supabase.auth.getSession();
        const userId = sessionResult?.data?.session?.user?.id;

        if (!userId) {
          if (mounted) setProfile(null);
          return;
        }

        const { data, error } = await supabase
          .from("usuarios")
          .select("id_usuario,nome,email,papel,telefone,data_cadastro,status")
          .eq("id_usuario", userId)
          .single();

        if (error) {
          console.error("Failed to load user profile:", error);
          if (mounted) setProfile(null);
        } else {
          if (mounted) setProfile(data as UserProfile);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      // reload profile on auth change
      load();
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return { profile, loading } as const;
}

export async function signOut() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Erro ao deslogar:", err);
  }
}
