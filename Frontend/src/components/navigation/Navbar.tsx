import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMarketplace } from "@/context/MarketplaceContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useMarketplace();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    return user.userType === "farmer" ? "/farmer/dashboard" : "/consumer/dashboard";
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="h-8 w-8 rounded-full bg-gray-800 transition-all duration-300 group-hover:scale-110"></span>
            <span className="font-display text-xl font-bold text-gray-800 transition-all duration-300 group-hover:text-gray-600">FarmChain</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/marketplace" className="text-gray-700 hover:text-gray-900 font-medium relative group">
              Marketplace
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-gray-900 font-medium relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-gray-900 font-medium relative group">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Search, Cart, and Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
            </form>

            <Link to="/cart" className="relative group">
              <ShoppingCart className="h-6 w-6 text-gray-700 transition-all duration-300 group-hover:scale-110 group-hover:text-gray-900" />
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-scale-up">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link 
                      to={getDashboardLink()} 
                      className="flex items-center w-full"
                    >
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link 
                      to={`${getDashboardLink()}?tab=profile`} 
                      className="flex items-center w-full"
                    >
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button asChild variant="outline" size="sm" className="transition-all duration-300 hover:scale-105">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="transition-all duration-300 hover:scale-105">
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden hover:scale-110 active:scale-90 transition-transform duration-200"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <Link to="/" className="flex items-center space-x-2 mb-10" onClick={() => setIsOpen(false)}>
            <span className="h-8 w-8 rounded-full bg-gray-800"></span>
            <span className="font-display text-xl font-bold">FarmChain</span>
          </Link>
          
          <nav className="flex flex-col space-y-4">
            <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link to="/marketplace" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setIsOpen(false)}>
              Marketplace
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setIsOpen(false)}>
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
          </nav>
          
          <div className="flex justify-between items-center">
            <Link to="/cart" className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              <span>Cart ({totalCartItems})</span>
            </Link>
            {isAuthenticated ? (
              <Link to={getDashboardLink()} className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-700" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <div className="flex space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Navbar;
