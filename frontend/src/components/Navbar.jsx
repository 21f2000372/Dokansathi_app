// import { useState } from "react";

// function Navbar() {
//   const [darkMode, setDarkMode] = useState(false);

//   const toggleTheme = () => {
//     setDarkMode((previous) => !previous);
//     document.documentElement.classList.toggle("dark");
//   };

//   return (
//     <header className="navbar">
//       <div className="navbar-brand">
//         <span className="brand-icon">🏪</span>
//         <span>DokanSathi</span>
//       </div>

//       <div className="navbar-search">
//         <span className="search-icon">⌕</span>

//         <input
//           type="text"
//           placeholder="Search products, orders..."
//         />
//       </div>

//       <div className="navbar-actions">
//         <button
//           className="theme-button"
//           onClick={toggleTheme}
//           title="Toggle theme"
//         >
//           {darkMode ? "☀️" : "🌙"}
//         </button>

//         <button className="notification-button">
//           🔔
//         </button>

//         <div className="user-menu">
//           <span>Guest</span>
//           <span>▼</span>
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Navbar;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setDarkMode((previous) => !previous);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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

        {user && (
          <div className="user-menu">
            <span>{user.name}</span>
            <span>▼</span>
          </div>
        )}

        {user && (
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}

      </div>
    </header>
  );
}

export default Navbar;