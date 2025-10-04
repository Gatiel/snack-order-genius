import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";

type Usuario = {
  id_usuario: string;
  nome: string;
  email: string;
  telefone?: string | null;
  papel: "admin" | "usuario";
  status: "ativo" | "inativo";
  data_cadastro: string;
};

const Customers = () => {
  const { profile, loading: authLoading } = useAuthUser();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("usuarios")
        .select("id_usuario,nome,email,telefone,papel,status,data_cadastro");

      if (error) {
        console.error("Erro ao buscar usuários:", error);
        setUsuarios([]);
      } else {
        setUsuarios(data as Usuario[]);
      }
      setLoading(false);
    }

    // Only load if user is admin (client-side check)
    if (profile?.papel === "admin") {
      load();
    }
  }, [profile]);

  if (authLoading) {
    return <div className="p-8">Carregando usuário...</div>;
  }

  if (!profile) {
    return <div className="p-8">Você precisa estar logado para acessar esta página.</div>;
  }

  if (profile.papel !== "admin") {
    return <div className="p-8">Acesso negado: apenas gerentes (admin) podem ver esta página.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={0} onCartClick={() => {}} />
      <main className="container p-6">
        <h1 className="text-2xl font-bold mb-4">Informações dos clientes</h1>
        {loading ? (
          <div>Carregando clientes...</div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full table-auto">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Nome</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Telefone</th>
                  <th className="p-2 text-left">Papel</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Cadastrado em</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id_usuario} className="odd:bg-background/50">
                    <td className="p-2">{u.nome}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.telefone || "-"}</td>
                    <td className="p-2">{u.papel}</td>
                    <td className="p-2">{u.status}</td>
                    <td className="p-2">{new Date(u.data_cadastro).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Customers;
