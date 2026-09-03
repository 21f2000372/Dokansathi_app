import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==========================================
  // LOAD CUSTOMER ORDERS
  // ==========================================

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        "/orders/my"
      );

      setOrders(data.orders || []);

    } catch (error) {
      console.error(
        "Failed to load customer orders:",
        error
      );

      setError(
        error.message ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadOrders();
  }, []);


  // ==========================================
  // ORDER COUNTS
  // ==========================================

  const activeOrders = orders.filter(
    (order) =>
      order.status !== "completed" &&
      order.status !== "cancelled"
  );

  const completedOrders = orders.filter(
    (order) =>
      order.status === "completed"
  );


  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";

      case "in-progress":
        return "status-progress";

      case "ready":
        return "status-ready";

      case "completed":
        return "status-completed";

      case "cancelled":
        return "status-cancelled";

      case "billed":
        return "status-billed";

      default:
        return "";
    }
  };


  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="dashboard-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="dashboard-header">

        <div>

          <h1>
            Customer Dashboard
          </h1>

          <p>
            Welcome back,{" "}
            <strong>
              {user?.name}
            </strong>
            !
          </p>

          <p>
            Browse products and track your
            orders.
          </p>

        </div>

      </div>


      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* =====================================
          SUMMARY CARDS
      ===================================== */}

      <div className="dashboard-cards">

        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            🛒
          </div>

          <h3>
            Total Orders
          </h3>

          <p className="dashboard-card-number">
            {loading ? "..." : orders.length}
          </p>

        </div>


        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            📦
          </div>

          <h3>
            Active Orders
          </h3>

          <p className="dashboard-card-number">
            {loading
              ? "..."
              : activeOrders.length}
          </p>

        </div>


        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            ✅
          </div>

          <h3>
            Completed
          </h3>

          <p className="dashboard-card-number">
            {loading
              ? "..."
              : completedOrders.length}
          </p>

        </div>

      </div>


      {/* =====================================
          QUICK ACTIONS
      ===================================== */}

      <div className="dashboard-section">

        <h2>
          Quick Actions
        </h2>

        <div className="quick-actions">

          <button
            onClick={() =>
              navigate("/customer/products")
            }
            className="primary-button"
          >
            Browse Products
          </button>


          <button
            onClick={loadOrders}
            className="secondary-button"
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "Refresh Orders"}
          </button>

        </div>

      </div>


      {/* =====================================
          RECENT ORDERS
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            My Recent Orders
          </h2>

          {orders.length > 0 && (
            <span>
              {orders.length} order
              {orders.length !== 1
                ? "s"
                : ""}
            </span>
          )}

        </div>


        {loading ? (

          <p>
            Loading your orders...
          </p>

        ) : orders.length === 0 ? (

          <div>

            <p>
              You haven't placed any orders
              yet.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/customer/products"
                )
              }
              className="primary-button"
            >
              Browse Products
            </button>

          </div>

        ) : (

          <div className="recent-users">

            {orders
              .slice(0, 5)
              .map((order) => (

                <div
                  key={order.orderId}
                  className="recent-user"
                >

                  <div>

                    <strong>
                      Order #
                      {order.orderId.slice(
                        0,
                        8
                      )}
                    </strong>

                    <p>
                      Total: ₹
                      {order.totalAmount}
                    </p>

                    <p>
                      {order.items?.length ||
                        0}{" "}
                      item
                      {order.items?.length !==
                        1
                        ? "s"
                        : ""}
                    </p>

                  </div>


                  <div>

                    <span
                      className={getStatusClass(
                        order.status
                      )}
                    >
                      {order.status}
                    </span>


                    {order.queuePosition !==
                      null &&
                      order.queuePosition !==
                        undefined && (

                        <p>
                          Queue: #
                          {
                            order.queuePosition
                          }
                        </p>

                      )}

                  </div>


                  <button
                    onClick={() =>
                      navigate(
                        "/customer/orders"
                      )
                    }
                    className="text-button"
                  >
                    View
                  </button>

                </div>

              ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default CustomerDashboard;