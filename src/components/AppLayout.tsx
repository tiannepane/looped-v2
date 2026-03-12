import { Link, useLocation } from "react-router-dom";
import { Plus, Package, User } from "lucide-react";

const navItems = [
  { label: "New Listing", path: "/new", icon: Plus },
  { label: "My Items", path: "/items", icon: Package },
  { label: "Account", path: "/account", icon: User },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-card flex flex-col py-8 px-6 shrink-0">
        <Link to="/" className="text-xl font-black tracking-tight text-foreground mb-12">
          looped
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                  active
                    ? "text-foreground font-semibold bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 lg:p-12 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
