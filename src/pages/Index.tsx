import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard, { Product } from "@/components/ProductCard";
import Cart, { CartItem } from "@/components/Cart";
import { useCategories } from "@/hooks/useCategories";
import { useItems } from "@/hooks/useItems";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

import burgerImg from "@/assets/burger.jpg";
import pizzaImg from "@/assets/pizza.jpg";
import drinkImg from "@/assets/drink.jpg";
import friesImg from "@/assets/fries.jpg";

// Mapeamento de imagens padrão por categoria
const DEFAULT_IMAGES: Record<string, string> = {
  'Lanches': burgerImg,
  'Pizzas': pizzaImg,
  'Bebidas': drinkImg,
  'Acompanhamentos': friesImg,
};

const Index = () => {
  const navigate = useNavigate();
  const { isAdmin, isGerente } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { data: items = [], isLoading: loadingItems } = useItems({
    categoryId: selectedCategoryId,
    searchQuery,
  });

  // Mapear categorias para obter nomes
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(cat => {
      map[cat.id_categoria] = cat.nome_categoria;
    });
    return map;
  }, [categories]);

  // Transformar itens do banco em formato Product
  const products: Product[] = useMemo(() => {
    return items.map(item => ({
      id: item.id_item,
      name: item.nome_item,
      description: item.descricao_item || '',
      price: Number(item.preco),
      image: item.imagem_url || DEFAULT_IMAGES[categoryMap[item.id_categoria]] || burgerImg,
      category: categoryMap[item.id_categoria] || 'Outros',
    }));
  }, [items, categoryMap]);

  const categoryNames = categories.map(cat => cat.nome_categoria);

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        toast.success(`${product.name} adicionado novamente!`);
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success(`${product.name} adicionado ao carrinho!`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removido do carrinho");
  };

  const handleCheckout = () => {
    toast.success("Pedido realizado com sucesso!");
    setCartItems([]);
    setIsCartOpen(false);
  };

  const handleCategorySelect = (categoryName: string | null) => {
    if (!categoryName) {
      setSelectedCategoryId(null);
      return;
    }
    
    const category = categories.find(cat => cat.nome_categoria === categoryName);
    setSelectedCategoryId(category?.id_categoria || null);
  };

  const selectedCategoryName = selectedCategoryId 
    ? categoryMap[selectedCategoryId] 
    : null;

  if (loadingCategories || loadingItems) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <Hero onSearch={setSearchQuery} />
      
      {(isAdmin() || isGerente()) && (
        <div className="container px-4 py-4">
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Acessar Painel Administrativo
          </Button>
        </div>
      )}
      
      <CategoryFilter
        categories={categoryNames}
        selectedCategory={selectedCategoryName}
        onSelectCategory={handleCategorySelect}
      />

      <main className="container px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {selectedCategoryName || "Todos os produtos"}
          </h2>
          <p className="text-muted-foreground">
            {products.length} {products.length === 1 ? "produto" : "produtos"} encontrado{products.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        )}
      </main>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Index;
