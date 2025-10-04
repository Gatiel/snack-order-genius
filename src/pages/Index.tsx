import { useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard, { Product } from "@/components/ProductCard";
import Cart, { CartItem } from "@/components/Cart";

import burgerImg from "@/assets/burger.jpg";
import pizzaImg from "@/assets/pizza.jpg";
import drinkImg from "@/assets/drink.jpg";
import friesImg from "@/assets/fries.jpg";

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "X-Burger Clássico",
    description: "Hambúrguer suculento com queijo, alface, tomate e molho especial",
    price: 25.90,
    image: burgerImg,
    category: "Lanches",
  },
  {
    id: 2,
    name: "Pizza Margherita",
    description: "Molho de tomate, mussarela, manjericão fresco e azeite",
    price: 45.00,
    image: pizzaImg,
    category: "Pizzas",
  },
  {
    id: 3,
    name: "Refrigerante Gelado",
    description: "Coca-Cola, Guaraná ou Sprite - 350ml",
    price: 5.90,
    image: drinkImg,
    category: "Bebidas",
  },
  {
    id: 4,
    name: "Batata Frita Grande",
    description: "Porção generosa de batatas crocantes com sal especial",
    price: 15.00,
    image: friesImg,
    category: "Acompanhamentos",
  },
  {
    id: 5,
    name: "X-Bacon",
    description: "Hambúrguer com bacon crocante, queijo e cebola caramelizada",
    price: 29.90,
    image: burgerImg,
    category: "Lanches",
  },
  {
    id: 6,
    name: "Pizza Calabresa",
    description: "Molho de tomate, mussarela, calabresa e cebola",
    price: 48.00,
    image: pizzaImg,
    category: "Pizzas",
  },
];

const CATEGORIES = Array.from(new Set(PRODUCTS.map(p => p.category)));

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removido do carrinho");
  };

  const handleCheckout = () => {
    toast.success("Pedido realizado com sucesso!");
    setCartItems([]);
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <Hero onSearch={setSearchQuery} />
      
      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <main className="container px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {selectedCategory || "Todos os produtos"}
          </h2>
          <p className="text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"} encontrado{filteredProducts.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
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
