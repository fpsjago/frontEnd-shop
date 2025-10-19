import { useMemo } from "react";
import "../../styles/components/shell.css";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "admin login", href: "/login" }

];

export interface SiteHeaderProps {
  currentPath?: string;
}

const SiteHeader = ({ currentPath }: SiteHeaderProps) => {
  const activePath = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname;
    }
    return currentPath ?? "/";
  }, [currentPath]);

  return (
    <header className="shell-header">
      <div className="shell-header__glow" aria-hidden="true" />
      <div className="shell-header__inner">
        <a className="shell-header__brand" href="/">
          <span className="shell-header__mark">FS</span>
          <span className="shell-header__text">
            <strong>Frontend Shop</strong>
            <small>Interface Studio</small>
          </span>
        </a>
        <nav className="shell-header__nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`shell-header__link ${activePath === item.href ? "is-active" : ""}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="shell-header__actions">
          <a className="shell-header__ghost" href="/docs">
            Docs
          </a>
          <a className="shell-header__cta" href="/login">
            Launch Console
          </a>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
