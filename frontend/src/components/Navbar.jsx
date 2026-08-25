import { useState } from "react";

function Navbar() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode((previous) => !previous);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🏪</span>
        <span>DokanSathi</span>
      </div>

      <div className="navbar-search">
        <span className="search-icon">⌕</span>

        <input
          type="text"
          placeholder="Search products, orders..."
        />
      </div>

      <div className="navbar-actions">
        <button
          className="theme-button"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        <button className="notification-button">
          🔔
        </button>

        <div className="user-menu">
          <span>Guest</span>
          <span>▼</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;