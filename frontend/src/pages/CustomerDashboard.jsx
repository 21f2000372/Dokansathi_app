import { useAuth } from "../context/AuthContext";

function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <h1>Customer Dashboard</h1>

      <p>Welcome, {user?.name}</p>
      <p>Role: {user?.role}</p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Products</h3>
          <p>Browse available products.</p>
        </div>

        <div className="dashboard-card">
          <h3>My Orders</h3>
          <p>View your orders.</p>
        </div>

        <div className="dashboard-card">
          <h3>Profile</h3>
          <p>Manage your profile.</p>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;