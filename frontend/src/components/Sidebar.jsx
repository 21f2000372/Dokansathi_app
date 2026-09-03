
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

            <NavLink to="/payments">
              Payments
            </NavLink>

            <NavLink to="/users">
              Users
            </NavLink>

            <NavLink to="/performance">
              Performance
            </NavLink>
          </>
        )}


        {/* =================================
            ASSISTANT
        ================================= */}

        {isAssistant && (
          <>
            <NavLink to="/assistant/inventory">
              Inventory
            </NavLink>

            <NavLink to="/notifications">
              Notifications
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

            <NavLink to="/customer/orders">
              My Orders
            </NavLink>

            <NavLink to="/notifications">
              Notifications
            </NavLink>
          </>
        )}


      </nav>
    </aside>
  );
}

export default Sidebar;

