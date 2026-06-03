import { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="text-center max-w-md">
            <h1 className="font-heading text-5xl text-gold-gradient mb-4">Something Broke</h1>
            <p className="text-muted-foreground text-sm mb-6">{this.state.error?.message || "An unexpected error occurred. Try reloading the page."}</p>
            <div className="flex gap-3 justify-center">
              <Button asChild className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider"><Link to="/">Home</Link></Button>
              <Button variant="outline" onClick={() => location.reload()} className="border-primary text-primary">Reload</Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
