import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";

interface Item {
  id_item: string;
  nome_item: string;
  descricao_item: string | null;
  preco: number;
  id_categoria: string;
  status: 'ativo' | 'inativo';
  imagem_url: string | null;
}

const Items = () => {
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    categoria: "",
    imagemUrl: "",
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('itens')
        .select('*, categorias(nome_categoria)')
        .order('nome_item');

      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const itemData = {
        nome_item: formData.nome,
        descricao_item: formData.descricao || null,
        preco: parseFloat(formData.preco),
        id_categoria: formData.categoria,
        imagem_url: formData.imagemUrl || null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('itens')
          .update(itemData)
          .eq('id_item', editingItem.id_item);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('itens')
          .insert(itemData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      queryClient.invalidateQueries({ queryKey: ['itens'] });
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({ nome: "", descricao: "", preco: "", categoria: "", imagemUrl: "" });
      toast({
        title: editingItem ? "Item atualizado" : "Item criado",
        description: "Operação realizada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('itens')
        .update({ status: 'inativo' })
        .eq('id_item', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      queryClient.invalidateQueries({ queryKey: ['itens'] });
      toast({
        title: "Item desativado",
        description: "Item removido com sucesso",
      });
    },
  });

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      nome: item.nome_item,
      descricao: item.descricao_item || "",
      preco: item.preco.toString(),
      categoria: item.id_categoria,
      imagemUrl: item.imagem_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    setFormData({ nome: "", descricao: "", preco: "", categoria: "", imagemUrl: "" });
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Itens</h2>
            <p className="text-muted-foreground">
              Gerencie os itens do cardápio
            </p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((item: any) => (
                  <TableRow key={item.id_item}>
                    <TableCell className="font-medium">{item.nome_item}</TableCell>
                    <TableCell>{item.categorias?.nome_categoria}</TableCell>
                    <TableCell>R$ {item.preco.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'ativo' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(item.id_item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Item" : "Novo Item"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do item do cardápio
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: X-Burger"
                />
              </div>
              <div>
                <Label htmlFor="preco">Preço</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  placeholder="25.90"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nome_categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição do item"
              />
            </div>
            <div>
              <Label htmlFor="imagemUrl">URL da Imagem</Label>
              <Input
                id="imagemUrl"
                value={formData.imagemUrl}
                onChange={(e) => setFormData({ ...formData, imagemUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Items;