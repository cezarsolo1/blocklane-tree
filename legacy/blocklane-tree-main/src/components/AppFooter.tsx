import { Link } from "react-router-dom";
import { getConcreteRoutes } from "@/routes/listPublicRoutes";

export default function AppFooter() {
  const links = getConcreteRoutes();

  return (
    <footer className="w-full border-t mt-8">
      <div className="mx-auto max-w-7xl px-4 py-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="whitespace-nowrap">Pagina's:</span>
          {links.map((to, i) => (
            <span key={to} className="flex items-center">
              <Link
                to={to}
                className="hover:underline hover:text-foreground transition-colors"
              >
                {to}
              </Link>
              {i < links.length - 1 && <span className="px-2 select-none">·</span>}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}