import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assistants, setAssistants] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Dashboard data
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [queue, setQueue] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Use Promise.allSettled() instead of Promise.all()
         * so one failed API does not stop all other APIs.
         */

        const results = await Promise.allSettled([
          apiRequest("/users/assistants"),
          apiRequest("/users/customers"),
          apiRequest("/products"),
          apiRequest("/orders/shop"),
          apiRequest("/queue"),
          apiRequest("/tasks"),
          apiRequest("/bills"),
          apiRequest("/payments"),
        ]);

        console.log(
          "Dashboard API results:",
          results
        );


        const [
          assistantResult,
          customerResult,
          productResult,
          orderResult,
          queueResult,
          taskResult,
          billResult,
          paymentResult,
        ] = results;


        // ==========================================
        // ASSISTANTS
        // ==========================================

        if (
          assistantResult.status === "fulfilled"
        ) {
          setAssistants(
            assistantResult.value.assistants || []
          );
        } else {
          console.error(
            "Assistants API failed:",
            assistantResult.reason
          );
        }


        // ==========================================
        // CUSTOMERS
        // ==========================================

        if (
          customerResult.status === "fulfilled"
        ) {
          setCustomers(
            customerResult.value.customers || []
          );
        } else {
          console.error(
            "Customers API failed:",
            customerResult.reason
          );
        }


        // ==========================================
        // PRODUCTS
        // ==========================================

        if (
          productResult.status === "fulfilled"
        ) {
          setProducts(
            productResult.value.products || []
          );
        } else {
          console.error(
            "Products API failed:",
            productResult.reason
          );
        }


        // ==========================================
        // ORDERS
        // ==========================================

        if (
          orderResult.status === "fulfilled"
        ) {
          setOrders(
            orderResult.value.orders || []
          );
        } else {
          console.error(
            "Orders API failed:",
            orderResult.reason
          );
        }


        // ==========================================
        // QUEUE
        // ==========================================

        if (
          queueResult.status === "fulfilled"
        ) {
          setQueue(
            queueResult.value.queue || []
          );
        } else {
          console.error(
            "Queue API failed:",
            queueResult.reason
          );
        }


        // ==========================================
        // TASKS
        // ==========================================

        if (
          taskResult.status === "fulfilled"
        ) {
          setTasks(
            taskResult.value.tasks || []
          );
        } else {
          console.error(
            "Tasks API failed:",
            taskResult.reason
          );
        }


        // ==========================================
        // BILLS
        // ==========================================

        if (
          billResult.status === "fulfilled"
        ) {
          setBills(
            billResult.value.bills || []
          );
        } else {
          console.error(
            "Bills API failed:",
            billResult.reason
          );
        }


        // ==========================================
        // PAYMENTS
        // ==========================================

        if (
          paymentResult.status === "fulfilled"
        ) {
          setPayments(
            paymentResult.value.payments || []
          );
        } else {
          console.error(
            "Payments API failed:",
            paymentResult.reason
          );
        }


        /*
         * We intentionally do not set the main error
         * here. Individual API failures are printed
         * in the console so we can identify the
         * problematic endpoint.
         */

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


  // ==========================================
  // COUNTS
  // ==========================================

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "pending"
  ).length;


  const pendingTasks = tasks.filter(
    (task) =>
      task.status === "assigned" ||
      task.status === "pending"
  ).length;


  const pendingPayments = payments.filter(
    (payment) =>
      payment.status === "pending"
  ).length;


  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="dashboard-header">

        <div>

          <h1>
            Shop Owner Dashboard
          </h1>

          <p>
            Welcome back,{" "}
            <strong>
              {user?.name}
            </strong>
            !
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
          onClick={() =>
            navigate("/users")
          }
          style={{ cursor: "pointer" }}
        >

          <div className="dashboard-card-icon">
            👨‍💼
          </div>

          <h3>
            Assistants
          </h3>

          <p className="dashboard-card-number">

            {loading
              ? "..."
              : assistants.length}

          </p>

          <p>
            Manage your shop assistants
          </p>

        </div>


        {/* Customers */}

        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/users")
          }
          style={{ cursor: "pointer" }}
        >

          <div className="dashboard-card-icon">
            👥
          </div>

          <h3>
            Customers
          </h3>

          <p className="dashboard-card-number">

            {loading
              ? "..."
              : customers.length}

          </p>

          <p>
            Manage your customers
          </p>

        </div>


        {/* Products */}

        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/products")
          }
          style={{ cursor: "pointer" }}
        >

          <div className="dashboard-card-icon">
            📦
          </div>

          <h3>
            Products
          </h3>

          <p className="dashboard-card-number">

            {loading
              ? "..."
              : products.length}

          </p>

          <p>
            Manage your shop products
          </p>

        </div>


        {/* Pending Orders */}

        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/orders")
          }
          style={{ cursor: "pointer" }}
        >

          <div className="dashboard-card-icon">
            🛒
          </div>

          <h3>
            Pending Orders
          </h3>

          <p className="dashboard-card-number">

            {loading
              ? "..."
              : pendingOrders}

          </p>

          <p>
            Orders awaiting action
          </p>

        </div>


        {/* Queue */}

        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/queue")
          }
          style={{ cursor: "pointer" }}
        >

          <div className="dashboard-card-icon">
            🔢
          </div>

          <h3>
            Queue
          </h3>

          <p className="dashboard-card-number">

            {loading
              ? "..."
              : queue.length}

          </p>

          <p>
            Orders in queue
          </p>

        </div>


        {/* Tasks */}

        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/tasks")
          }
          style={{ cursor: "pointer" }}
        >

          <div className="dashboard-card-icon">
            📋
          </div>

          <h3>
            Pending Tasks
          </h3>

          <p className="dashboard-card-number">

            {loading
              ? "..."
              : pendingTasks}

          </p>

          <p>
            Assistant tasks
          </p>

        </div>


        {/* Bills */}

        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/bills")
          }
          style={{ cursor: "pointer" }}
        >

          <div className="dashboard-card-icon">
            🧾
          </div>

          <h3>
            Bills
          </h3>

          <p className="dashboard-card-number">

            {loading
              ? "..."
              : bills.length}

          </p>

          <p>
            Generated bills
          </p>

        </div>


        {/* Payments */}

        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/payments")
          }
          style={{ cursor: "pointer" }}
        >

          <div className="dashboard-card-icon">
            💰
          </div>

          <h3>
            Payments
          </h3>

          <p className="dashboard-card-number">

            {loading
              ? "..."
              : payments.length}

          </p>

          <p>
            Total payments
          </p>

        </div>

      </div>


      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <div className="dashboard-section">

        <h2>
          Quick Actions
        </h2>

        <div className="quick-actions">

          <button
            onClick={() =>
              navigate("/users")
            }
            className="primary-button"
          >
            Manage Users
          </button>


          <button
            onClick={() =>
              navigate("/products")
            }
            className="secondary-button"
          >
            Manage Products
          </button>


          <button
            onClick={() =>
              navigate("/inventory")
            }
            className="secondary-button"
          >
            View Inventory
          </button>


          <button
            onClick={() =>
              navigate("/orders")
            }
            className="secondary-button"
          >
            View Orders
          </button>


          <button
            onClick={() =>
              navigate("/queue")
            }
            className="secondary-button"
          >
            View Queue
          </button>


          <button
            onClick={() =>
              navigate("/payments")
            }
            className="secondary-button"
          >
            View Payments
          </button>

        </div>

      </div>


      {/* =========================
          CURRENT QUEUE
      ========================= */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Current Queue
          </h2>

          <button
            onClick={() =>
              navigate("/queue")
            }
            className="text-button"
          >
            View All
          </button>

        </div>


        {loading ? (

          <p>
            Loading queue...
          </p>

        ) : queue.length === 0 ? (

          <p>
            No orders currently in queue.
          </p>

        ) : (

          <div className="recent-users">

            {queue
              .slice(0, 5)
              .map((order) => (

                <div
                  key={order.orderId}
                  className="recent-user"
                >

                  <div>

                    <strong>
                      Queue #
                      {order.queuePosition}
                    </strong>

                    <p>
                      {order.customer?.name ||
                        "Customer"}
                    </p>

                  </div>

                  <span>
                    ₹{order.totalAmount}
                  </span>

                </div>

              ))}

          </div>

        )}

      </div>


      {/* =========================
          RECENT ORDERS
      ========================= */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Recent Orders
          </h2>

          <button
            onClick={() =>
              navigate("/orders")
            }
            className="text-button"
          >
            View All
          </button>

        </div>


        {loading ? (

          <p>
            Loading orders...
          </p>

        ) : orders.length === 0 ? (

          <p>
            No orders found.
          </p>

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
                      {order.orderId.slice(0, 8)}
                    </strong>

                    <p>
                      {order.customer?.name ||
                        "Customer"}
                    </p>

                  </div>

                  <span>
                    {order.status}
                  </span>

                </div>

              ))}

          </div>

        )}

      </div>


      {/* =========================
          RECENT PAYMENTS
      ========================= */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Recent Payments
          </h2>

          <button
            onClick={() =>
              navigate("/payments")
            }
            className="text-button"
          >
            View All
          </button>

        </div>


        {loading ? (

          <p>
            Loading payments...
          </p>

        ) : payments.length === 0 ? (

          <p>
            No payments found.
          </p>

        ) : (

          <div className="recent-users">

            {payments
              .slice(0, 5)
              .map((payment) => (

                <div
                  key={payment.paymentId}
                  className="recent-user"
                >

                  <div>

                    <strong>
                      ₹{payment.amount}
                    </strong>

                    <p>
                      {payment.method}
                    </p>

                  </div>

                  <span>
                    {payment.status}
                  </span>

                </div>

              ))}

          </div>

        )}

      </div>


      {/* =========================
          RECENT USERS
      ========================= */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Recently Added Users
          </h2>

          <button
            onClick={() =>
              navigate("/users")
            }
            className="text-button"
          >
            View All
          </button>

        </div>


        {loading ? (

          <p>
            Loading users...
          </p>

        ) : (

          <div className="recent-users">

            {[
              ...assistants.map(
                (assistant) => ({
                  ...assistant,
                  userType: "Assistant",
                })
              ),

              ...customers.map(
                (customer) => ({
                  ...customer,
                  userType: "Customer",
                })
              ),
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