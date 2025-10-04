import { ShoppingCart, Search, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoginModal from "@/components/LoginModal";
import { useAuthUser, signOut } from "@/hooks/useAuthUser";

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

const Header = ({ cartItemsCount, onCartClick }: HeaderProps) => {
  const { profile } = useAuthUser();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <span className="text-xl font-bold text-primary-foreground">L</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">LancheRápido</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onCartClick}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {cartItemsCount}
              </Badge>
            )}
          </Button>

          {profile ? (
            <Button variant="ghost" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />Sair
            </Button>
          ) : (
            <LoginModal>
              <Button variant="ghost">
                <LogIn className="h-4 w-4 mr-2" />Entrar
              </Button>
            </LoginModal>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
