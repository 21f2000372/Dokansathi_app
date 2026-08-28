
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assistants, setAssistants] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [assistantData, customerData] =
          await Promise.all([
            apiRequest("/users/assistants"),
            apiRequest("/users/customers"),
          ]);

        setAssistants(
          assistantData.assistants || []
        );

        setCustomers(
          customerData.customers || []
        );
      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error
        );

        setError(
          error.message ||
            "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="dashboard-header">
        <div>
          <h1>Shop Owner Dashboard</h1>

          <p>
            Welcome back,{" "}
            <strong>{user?.name}</strong>!
          </p>

          <p>
            Manage your shop and monitor your
            business from here.
          </p>
        </div>
      </div>


      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="dashboard-cards">

        {/* Assistants */}

        <div
          className="dashboard-card"
          onClick={() => navigate("/users")}
          style={{ cursor: "pointer" }}
        >
          <div className="dashboard-card-icon">
            👨‍💼
          </div>

          <h3>Assistants</h3>

          <p className="dashboard-card-number">
            {loading ? "..." : assistants.length}
          </p>

          <p>
            Manage your shop assistants
          </p>
        </div>


        {/* Customers */}

        <div
          className="dashboard-card"
          onClick={() => navigate("/users")}
          style={{ cursor: "pointer" }}
        >
          <div className="dashboard-card-icon">
            👥
          </div>

          <h3>Customers</h3>

          <p className="dashboard-card-number">
            {loading ? "..." : customers.length}
          </p>

          <p>
            Manage your customers
          </p>
        </div>


        {/* Products */}

        <div
          className="dashboard-card"
          onClick={() => navigate("/products")}
          style={{ cursor: "pointer" }}
        >
          <div className="dashboard-card-icon">
            📦
          </div>

          <h3>Products</h3>

          <p>
            Manage your shop products
          </p>
        </div>


        {/* Orders */}

        <div
          className="dashboard-card"
          onClick={() => navigate("/orders")}
          style={{ cursor: "pointer" }}
        >
          <div className="dashboard-card-icon">
            🛒
          </div>

          <h3>Orders</h3>

          <p>
            View and manage orders
          </p>
        </div>

      </div>


      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <div className="dashboard-section">

        <h2>Quick Actions</h2>

        <div className="quick-actions">

          <button
            onClick={() => navigate("/users")}
            className="primary-button"
          >
            Manage Users
          </button>

          <button
            onClick={() => navigate("/products")}
            className="secondary-button"
          >
            Manage Products
          </button>

          <button
            onClick={() => navigate("/inventory")}
            className="secondary-button"
          >
            View Inventory
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="secondary-button"
          >
            View Orders
          </button>

        </div>

      </div>


      {/* =========================
          RECENT USERS
      ========================= */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>Recently Added Users</h2>

          <button
            onClick={() => navigate("/users")}
            className="text-button"
          >
            View All
          </button>

        </div>


        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="recent-users">

            {[
              ...assistants.map((assistant) => ({
                ...assistant,
                userType: "Assistant",
              })),

              ...customers.map((customer) => ({
                ...customer,
                userType: "Customer",
              })),
            ]
              .slice(-5)
              .reverse()
              .map((person) => (
                <div
                  key={person.userId}
                  className="recent-user"
                >
                  <div>
                    <strong>
                      {person.name}
                    </strong>

                    <p>
                      {person.userType}
                    </p>
                  </div>

                  <span>
                    {person.availabilityStatus ||
                      "active"}
                  </span>
                </div>
              ))}

            {assistants.length === 0 &&
              customers.length === 0 && (
                <p>
                  No assistants or customers
                  found.
                </p>
              )}

          </div>
        )}

      </div>

    </div>
  );
}

export default OwnerDashboard;

