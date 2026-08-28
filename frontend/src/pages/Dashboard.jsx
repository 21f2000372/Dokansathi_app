import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const isOwner = user.role === "shop_owner";
  const isAssistant = user.role === "assistant";
  const isCustomer = user.role === "customer";

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>

        <p>
          Welcome back, {user.name}
        </p>
      </div>

      <div className="dashboard-grid">

        {/* Orders */}
        <div className="dashboard-card">
          <span>
            {isCustomer ? "My Orders" : "Orders"}
          </span>

          <strong>0</strong>
        </div>

        {/* Products */}
        <div className="dashboard-card">
          <span>Products</span>
          <strong>0</strong>
        </div>

        {/* Tasks */}
        <div className="dashboard-card">
          <span>Tasks</span>
          <strong>0</strong>
        </div>

        {/* Role-specific card */}
        <div className="dashboard-card">
          <span>
            {isOwner
              ? "Users"
              : isAssistant
              ? "Assigned Tasks"
              : "Loyalty Points"}
          </span>

          <strong>0</strong>
        </div>

      </div>

      <div className="dashboard-section">
        <h2>Recent Activity</h2>

        <div className="empty-state">
          No recent activity
        </div>
      </div>
    </div>
  );
}

export default Dashboard;