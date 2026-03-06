import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [showNotFound, setShowNotFound] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
      setShowNotFound(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!showNotFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;