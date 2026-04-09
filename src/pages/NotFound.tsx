import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <PublicLayout showFooter={false}>
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-foreground mb-2">Page not found</p>
      <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
      <Button asChild>
        <Link to="/">Go Home</Link>
      </Button>
    </div>
  </PublicLayout>
);

export default NotFound;
