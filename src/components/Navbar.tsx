import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  User, 
  LogOut, 
  Settings, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Cart } from './Cart';
import { AuthForm } from './AuthForm';

export const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Productos', href: '/#productos' },
    { name: 'Categorías', href: '/#categorias' },
    { name: 'Ofertas', href: '/#ofertas' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-gray-900">
              Cart Catalogue Palace
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Cart */}
            <Cart />

            {/* User Menu or Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {profile?.full_name || user.email}
                    </span>
                    {profile?.role === 'admin' && (
                      <Badge variant="secondary" className="ml-1">
                        Admin
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/perfil" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Panel de Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Sheet open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Ingresar
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Autenticación</SheetTitle>
                    <SheetDescription>
                      Inicia sesión o crea una cuenta para continuar
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <AuthForm onSuccess={handleAuthSuccess} />
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <Store className="h-6 w-6 text-primary" />
                    <span>Cart Catalogue Palace</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile User Actions */}
                  {user && (
                    <>
                      <div className="border-t pt-4 space-y-2">
                        <div className="px-3 py-2">
                          <p className="text-sm font-medium text-gray-900">
                            {profile?.full_name || user.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.email}
                          </p>
                          {profile?.role === 'admin' && (
                            <Badge variant="secondary" className="mt-1">
                              Administrador
                            </Badge>
                          )}
                        </div>
                        
                        <Link
                          to="/perfil"
                          className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="inline mr-2 h-4 w-4" />
                          Mi Perfil
                        </Link>
                        
                        {profile?.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <ShieldCheck className="inline mr-2 h-4 w-4" />
                            Panel de Admin
                          </Link>
                        )}
                        
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-3"
                          onClick={handleSignOut}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Cerrar Sesión
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}; 