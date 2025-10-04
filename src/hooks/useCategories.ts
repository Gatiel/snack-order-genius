import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id_categoria: string;
  nome_categoria: string;
  descricao_categoria: string | null;
  status: 'ativo' | 'inativo';
  created_at: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('status', 'ativo')
        .order('nome_categoria');

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
      }

      return data as Category[];
    },
  });
};
