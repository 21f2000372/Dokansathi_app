import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <Link to="/">Dashboard</Link>

        <Link to="/products">
          Products
        </Link>

        <Link to="/inventory">
          Inventory
        </Link>

        <Link to="/orders">
          Orders
        </Link>

        <Link to="/queue">
          Queue
        </Link>

        <Link to="/tasks">
          Tasks
        </Link>

        <Link to="/billing">
          Billing
        </Link>

        <div className="sidebar-divider" />

        <Link to="/settings">
          Settings
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;