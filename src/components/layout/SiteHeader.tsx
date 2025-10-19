import { useMemo } from "react";
import "../../styles/components/shell.css";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Admin Login", path: "/login" },
];

export interface SiteHeaderProps {
  currentPath?: string;
}

function normalizeBase(base: string) {
  if (!base) return "/";
  return base.endsWith("/") ? base : `${base}/`;
}

function joinBase(base: string, path: string) {
  if (path.startsWith("http")) return path;
  const normalizedBase = normalizeBase(base);
  if (path === "/") return normalizedBase;
  return `${normalizedBase}${path.replace(/^\//, "")}`;
}

function normalizePath(path: string, basePrefix: string) {
  if (!path) return "/";
  let normalized = path;
  if (basePrefix && normalized.startsWith(basePrefix)) {
    normalized = normalized.slice(basePrefix.length) || "/";
  }
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  return normalized.replace(/\/+$/, "") || "/";
}

const SiteHeader = ({ currentPath }: SiteHeaderProps) => {
  const baseUrl = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = normalizeBase(baseUrl);
  const basePrefix = normalizedBase === "/" ? "" : normalizedBase.replace(/\/$/, "");

  const activePath = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname;
    }
    return currentPath ?? "/";
  }, [currentPath]);

  const normalizedActivePath = normalizePath(activePath, basePrefix);

  return (
    <header className="shell-header">
      <div className="shell-header__glow" aria-hidden="true" />
      <div className="shell-header__inner">
        <a className="shell-header__brand" href={joinBase(baseUrl, "/")}>
          <span className="shell-header__mark">FS</span>
          <span className="shell-header__text">
            <strong>Frontend Shop</strong>
            <small>Interface Studio</small>
          </span>
        </a>
        <nav className="shell-header__nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const href = joinBase(baseUrl, item.path);
            const normalizedItemPath = normalizePath(item.path, "");
            const isActive = normalizedActivePath === normalizedItemPath;

            return (
              <a
                key={item.path}
                href={href}
                className={`shell-header__link ${isActive ? "is-active" : ""}`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="shell-header__actions">
          <a className="shell-header__ghost" href={joinBase(baseUrl, "/docs")}>
            Docs
          </a>
          <a className="shell-header__cta" href={joinBase(baseUrl, "/login")}>
            Launch Console
          </a>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
