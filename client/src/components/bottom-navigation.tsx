import { Link, useLocation } from "wouter";
import { Target, TrendingUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    {
      path: "/",
      label: "Goals",
      icon: Target,
      testId: "nav-goals",
    },
    {
      path: "/progress",
      label: "Progress",
      icon: TrendingUp,
      testId: "nav-progress",
    },
    {
      path: "/reflect",
      label: "Reflect",
      icon: BookOpen,
      testId: "nav-reflect",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50" data-testid="bottom-navigation">
      <div className="max-w-2xl mx-auto px-4">
        <div className="grid grid-cols-3 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex flex-col items-center justify-center h-full gap-1 transition-colors relative hover-elevate active-elevate-2",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                data-testid={item.testId}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-12 bg-primary rounded-full" />
                )}
                <Icon className="h-5 w-5" />
                <span className={cn(
                  "text-xs",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
