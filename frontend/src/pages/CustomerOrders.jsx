import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";


function CustomerOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedOrder, setSelectedOrder] =
    useState(null);


  // ==========================================
  // LOAD ORDERS
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
        "Failed to load orders:",
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
  // CANCEL ORDER
  // ==========================================

  const cancelOrder = async (orderId) => {

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(orderId);
      setError("");
      setSuccess("");

      await apiRequest(
        `/orders/my/${orderId}/cancel`,
        {
          method: "PATCH",
        }
      );

      setSuccess(
        "Order cancelled successfully."
      );

      // Close details panel if the
      // cancelled order was open.
      if (
        selectedOrder &&
        selectedOrder.orderId === orderId
      ) {
        setSelectedOrder(null);
      }

      await loadOrders();

    } catch (error) {
      console.error(
        "Failed to cancel order:",
        error
      );

      setError(
        error.message ||
          "Failed to cancel order"
      );
    } finally {
      setCancellingId(null);
    }
  };


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
  // COUNTS + FILTER
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

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter(
          (order) =>
            order.status === statusFilter
        );


  // Search is applied on top of the status
  // filter. Matches order ID, status, or any
  // product name within the order's items.
  const searchedOrders =
    filteredOrders.filter((order) => {
      const term = searchTerm
        .trim()
        .toLowerCase();

      if (term === "") {
        return true;
      }

      const matchesId = order.orderId
        ?.toLowerCase()
        .includes(term);

      const matchesStatus = order.status
        ?.toLowerCase()
        .includes(term);

      const matchesItem = order.items?.some(
        (item) =>
          item.product?.name
            ?.toLowerCase()
            .includes(term)
      );

      return (
        matchesId ||
        matchesStatus ||
        matchesItem
      );
    });


  const filters = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    {
      key: "in-progress",
      label: "In Progress",
    },
    { key: "ready", label: "Ready" },
    { key: "billed", label: "Billed" },
    {
      key: "completed",
      label: "Completed",
    },
    {
      key: "cancelled",
      label: "Cancelled",
    },
  ];


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
            My Orders
          </h1>

          <p>
            View your orders and cancel any
            that are still pending.
          </p>

        </div>

        <div className="quick-actions">

          <button
            onClick={() =>
              navigate("/customer-dashboard")
            }
            className="secondary-button"
          >
            Back to Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/customer/products")
            }
            className="primary-button"
          >
            Browse Products
          </button>

        </div>

      </div>


      {/* =====================================
          MESSAGES
      ===================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
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
            Active
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
          ORDERS
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Order History
          </h2>

          <div className="quick-actions">

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search by order ID, status, or product..."
            />

            <button
              onClick={loadOrders}
              className="secondary-button"
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>

          </div>

        </div>


        {/* FILTER BUTTONS */}

        <div className="quick-actions">

          {filters.map((filter) => (

            <button
              key={filter.key}
              onClick={() =>
                setStatusFilter(filter.key)
              }
              className={
                statusFilter === filter.key
                  ? "primary-button"
                  : "secondary-button"
              }
            >
              {filter.label}
            </button>

          ))}

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

        ) : filteredOrders.length === 0 ? (

          <p>
            No orders with this status.
          </p>

        ) : searchedOrders.length === 0 ? (

          <p>
            No orders match your search.
          </p>

        ) : (

          <div className="orders-list">

            {searchedOrders.map((order) => (

              <div
                key={order.orderId}
                className="dashboard-section"
                style={{
                  marginBottom: "15px",
                }}
              >

                {/* Order header */}

                <div className="section-header">

                  <div>

                    <h3>
                      Order #
                      {order.orderId.slice(
                        0,
                        8
                      )}
                    </h3>

                    <p>
                      {new Date(
                        order.createdAt
                      ).toLocaleString()}
                    </p>

                  </div>


                  <span
                    className={getStatusClass(
                      order.status
                    )}
                  >
                    {order.status}
                  </span>

                </div>


                {/* Order information */}

                <div>

                  <p>
                    <strong>
                      Total:
                    </strong>{" "}
                    ₹{order.totalAmount}
                  </p>

                  <p>
                    <strong>
                      Items:
                    </strong>{" "}
                    {order.items?.length || 0}
                  </p>

                  <p>
                    <strong>
                      Queue Position:
                    </strong>{" "}
                    {order.queuePosition ??
                      "Not in queue"}
                  </p>

                </div>


                {/* Actions */}

                <div className="quick-actions">

                  <button
                    onClick={() =>
                      setSelectedOrder(
                        selectedOrder?.orderId ===
                          order.orderId
                          ? null
                          : order
                      )
                    }
                    className="primary-button"
                  >
                    {selectedOrder?.orderId ===
                    order.orderId
                      ? "Hide Details"
                      : "View Details"}
                  </button>


                  {order.status ===
                    "pending" && (

                    <button
                      onClick={() =>
                        cancelOrder(
                          order.orderId
                        )
                      }
                      className="secondary-button"
                      disabled={
                        cancellingId ===
                        order.orderId
                      }
                    >
                      {cancellingId ===
                      order.orderId
                        ? "Cancelling..."
                        : "Cancel Order"}
                    </button>

                  )}

                </div>


                {/* Inline order details */}

                {selectedOrder?.orderId ===
                  order.orderId && (

                  <div
                    className="dashboard-section"
                    style={{
                      marginTop: "15px",
                    }}
                  >

                    <h3>
                      Order Details
                    </h3>


                    <p>
                      <strong>
                        Order ID:
                      </strong>{" "}
                      {order.orderId}
                    </p>


                    <p>
                      <strong>
                        Status:
                      </strong>{" "}
                      <span
                        className={getStatusClass(
                          order.status
                        )}
                      >
                        {order.status}
                      </span>
                    </p>


                    <p>
                      <strong>
                        Placed On:
                      </strong>{" "}
                      {new Date(
                        order.createdAt
                      ).toLocaleString()}
                    </p>


                    <p>
                      <strong>
                        Queue Position:
                      </strong>{" "}
                      {order.queuePosition ??
                        "Not in queue"}
                    </p>


                    <p>
                      <strong>
                        Total Amount:
                      </strong>{" "}
                      ₹{order.totalAmount}
                    </p>


                    <h4>
                      Items
                    </h4>

                    {order.items?.map(
                      (item) => (

                        <div
                          key={item.itemId}
                        >

                          <p>
                            <strong>
                              {item.product
                                ?.name ||
                                "Product"}
                            </strong>

                            {" × "}

                            {item.quantity}

                            {" — ₹"}

                            {item.unitPrice}

                            {" each"}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            ))}

          </div>

        )}

      </div>


    </div>
  );
}

export default CustomerOrders;
