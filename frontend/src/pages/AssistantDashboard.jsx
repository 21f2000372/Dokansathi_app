import { useAuth } from "../context/AuthContext";

function AssistantDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <h1>Assistant Dashboard</h1>

      <p>Welcome, {user?.name}</p>
      <p>Role: {user?.role}</p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Orders</h3>
          <p>View and manage customer orders.</p>
        </div>

        <div className="dashboard-card">
          <h3>Customers</h3>
          <p>View customer information.</p>
        </div>

        <div className="dashboard-card">
          <h3>Inventory</h3>
          <p>Manage shop inventory.</p>
        </div>
      </div>
    </div>
  );
}

export default AssistantDashboard;