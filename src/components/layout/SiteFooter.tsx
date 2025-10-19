import "../../styles/components/shell.css";

const SiteFooter = () => {
  return (
    <footer className="shell-footer">
      <div className="shell-footer__glow" aria-hidden="true" />
      <div className="shell-footer__inner">
        <div className="shell-footer__brand">
          <span className="shell-footer__mark">FS</span>
          <div>
            <strong>Frontend Shop</strong>
            <p>Crafting modular commerce and content experiences.</p>
          </div>
        </div>

        <div className="shell-footer__columns">
          <div>
            <h3>Product</h3>
            <a href="/products">Marketplace</a>
            <a href="/pricing">Pricing</a>
            <a href="/roadmap">Roadmap</a>
          </div>
          <div>
            <h3>Resources</h3>
            <a href="/docs">Documentation</a>
            <a href="/blog">Stories</a>
            <a href="/support">Support</a>
          </div>
          <div>
            <h3>Company</h3>
            <a href="/about">About</a>
            <a href="/careers">Careers</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </div>
      <div className="shell-footer__bottom">
        <p>© {new Date().getFullYear()} Frontend Shop. All rights reserved.</p>
        <div className="shell-footer__legal">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/status">Status</a>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
