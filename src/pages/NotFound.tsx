import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-6">
        <h1 className="mb-2 text-8xl font-heading text-gold-gradient tracking-wider">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          This page doesn't exist
        </p>
        <Button asChild className="bg-gold-gradient text-primary-foreground hover:opacity-90">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Shop
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
