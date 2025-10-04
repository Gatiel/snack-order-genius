import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Item {
  id_item: string;
  nome_item: string;
  descricao_item: string | null;
  preco: number;
  id_categoria: string;
  status: 'ativo' | 'inativo';
  data_cadastro: string;
  imagem_url: string | null;
}

interface UseItemsParams {
  categoryId?: string | null;
  searchQuery?: string;
}

export const useItems = ({ categoryId, searchQuery }: UseItemsParams = {}) => {
  return useQuery({
    queryKey: ['itens', categoryId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('itens')
        .select('*')
        .eq('status', 'ativo');

      if (categoryId) {
        query = query.eq('id_categoria', categoryId);
      }

      if (searchQuery) {
        query = query.or(`nome_item.ilike.%${searchQuery}%,descricao_item.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('nome_item');

      if (error) {
        console.error('Erro ao buscar itens:', error);
        throw error;
      }

      return data as Item[];
    },
  });
};
