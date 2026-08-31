
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const isOwner = user.role === "shop_owner";
  const isAssistant = user.role === "assistant";
  const isCustomer = user.role === "customer";

  // Decide which dashboard the current user should see
  const dashboardPath =
    isOwner
      ? "/owner-dashboard"
      : isAssistant
      ? "/assistant-dashboard"
      : "/customer-dashboard";

  return (
    <aside className="sidebar">
      <nav>

        {/* Dashboard */}
        <NavLink to={dashboardPath}>
          Dashboard
        </NavLink>


        {/* =================================
            SHOP OWNER
        ================================= */}

        {isOwner && (
          <>
            <NavLink to="/products">
              Products
            </NavLink>

            <NavLink to="/inventory">
              Inventory
            </NavLink>

            <NavLink to="/orders">
              Orders
            </NavLink>

            <NavLink to="/queue">
              Queue
            </NavLink>

            <NavLink to="/tasks">
              Tasks
            </NavLink>

            <NavLink to="/billing">
              Billing
            </NavLink>

            <NavLink to="/users">
              Users
            </NavLink>
          </>
        )}


        {/* =================================
            ASSISTANT
        ================================= */}

        {isAssistant && (
          <>
            <NavLink to="/orders">
              Orders
            </NavLink>

            <NavLink to="/inventory">
              Inventory
            </NavLink>

            <NavLink to="/queue">
              Queue
            </NavLink>

            <NavLink to="/tasks">
              Tasks
            </NavLink>
          </>
        )}


        {/* =================================
            CUSTOMER
        ================================= */}

        {isCustomer && (
          <>
            <NavLink to="/customer/products">
              Products
            </NavLink>

            <NavLink to="orders">
              My Orders
            </NavLink>

            <NavLink to="tasks">
              My Tasks
            </NavLink>

            <NavLink to="/notifications">
              Notifications
            </NavLink>
          </>
        )}


        {/* Divider */}

        <div className="sidebar-divider" />


        {/* Settings */}

        <NavLink to="/settings">
          Settings
        </NavLink>

      </nav>
    </aside>
  );
}

export default Sidebar;

