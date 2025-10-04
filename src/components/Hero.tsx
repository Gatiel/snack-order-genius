import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import heroImg from "@/assets/hero-bg.jpg";

interface HeroProps {
  onSearch: (query: string) => void;
}

const Hero = ({ onSearch }: HeroProps) => {
  return (
    <section 
      className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-background"
      style={{
        backgroundImage: `url(${heroImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="container relative px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Peça seu lanche favorito
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Entrega rápida e comida deliciosa na sua casa
          </p>
          
          <div className="relative mx-auto max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por lanches, bebidas..."
              className="pl-10 h-12 bg-card"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
