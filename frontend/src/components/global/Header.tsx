import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Monitor, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

interface HeaderProps {
  currentPage?: string;
}

export function Header({ currentPage }: HeaderProps) {
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Devices", path: "/devices" },
    { name: "Notifications", path: "/notifications" },
  ];

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Monitor className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">DeviceWatch</h1>
            <p className="text-sm text-muted-foreground">Sistema de Monitoramento</p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex items-center space-x-6">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
