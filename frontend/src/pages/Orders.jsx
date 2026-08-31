import { useEffect, useState } from "react";

import { apiRequest } from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);


  // ==========================================
  // LOAD ORDERS
  // ==========================================

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        "/orders/shop"
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
  // UPDATE ORDER STATUS
  // ==========================================

  const updateStatus = async (
    orderId,
    status
  ) => {
    try {
      setUpdating(true);
      setError("");

      await apiRequest(
        `/orders/shop/${orderId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
          }),
        }
      );

      // Reload orders after update
      await loadOrders();

      // Update selected order if open
      if (
        selectedOrder &&
        selectedOrder.orderId === orderId
      ) {
        setSelectedOrder(null);
      }

    } catch (error) {
      console.error(
        "Failed to update order status:",
        error
      );

      setError(
        error.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdating(false);
    }
  };


  // ==========================================
  // CANCEL ORDER
  // ==========================================

  const cancelOrder = async (
    orderId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdating(true);
      setError("");

      await apiRequest(
        `/orders/shop/${orderId}/cancel`,
        {
          method: "PATCH",
        }
      );

      await loadOrders();

      setSelectedOrder(null);

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
      setUpdating(false);
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
            Orders
          </h1>

          <p>
            View and manage orders from your
            customers.
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
          ORDER SUMMARY
      ===================================== */}

      {!loading && (
        <div className="dashboard-cards">

          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              🛒
            </div>

            <h3>
              Total Orders
            </h3>

            <p className="dashboard-card-number">
              {orders.length}
            </p>

          </div>


          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              ⏳
            </div>

            <h3>
              Pending
            </h3>

            <p className="dashboard-card-number">
              {
                orders.filter(
                  (order) =>
                    order.status ===
                    "pending"
                ).length
              }
            </p>

          </div>


          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              📋
            </div>

            <h3>
              In Progress
            </h3>

            <p className="dashboard-card-number">
              {
                orders.filter(
                  (order) =>
                    order.status ===
                    "in-progress"
                ).length
              }
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
              {
                orders.filter(
                  (order) =>
                    order.status ===
                    "completed"
                ).length
              }
            </p>

          </div>

        </div>
      )}


      {/* =====================================
          ORDERS
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            All Orders
          </h2>

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


        {loading ? (

          <p>
            Loading orders...
          </p>

        ) : orders.length === 0 ? (

          <p>
            No orders found.
          </p>

        ) : (

          <div className="orders-list">

            {orders.map((order) => (

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
                      {order.orderId.slice(0, 8)}
                    </h3>

                    <p>
                      Customer:{" "}
                      <strong>
                        {order.customer?.name ||
                          "Unknown"}
                      </strong>
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
                      Queue Position:
                    </strong>{" "}
                    {order.queuePosition ??
                      "Not in queue"}
                  </p>

                  <p>
                    <strong>
                      Created:
                    </strong>{" "}
                    {new Date(
                      order.createdAt
                    ).toLocaleString()}
                  </p>

                </div>


                {/* Order items */}

                {order.items &&
                  order.items.length > 0 && (

                    <div>

                      <h4>
                        Items
                      </h4>

                      {order.items.map(
                        (item) => (

                          <p
                            key={
                              item.itemId
                            }
                          >
                            {item.product?.name ||
                              "Product"}{" "}
                            ×{" "}
                            {item.quantity}{" "}
                            — ₹
                            {item.unitPrice}
                          </p>

                        )
                      )}

                    </div>

                  )}


                {/* Actions */}

                <div className="quick-actions">

                  <button
                    onClick={() =>
                      setSelectedOrder(
                        order
                      )
                    }
                    className="primary-button"
                  >
                    View Details
                  </button>


                  {order.status ===
                    "pending" && (

                    <button
                      onClick={() =>
                        updateStatus(
                          order.orderId,
                          "in-progress"
                        )
                      }
                      className="secondary-button"
                      disabled={updating}
                    >
                      Start Processing
                    </button>

                  )}


                  {order.status ===
                    "in-progress" && (

                    <button
                      onClick={() =>
                        updateStatus(
                          order.orderId,
                          "ready"
                        )
                      }
                      className="secondary-button"
                      disabled={updating}
                    >
                      Mark Ready
                    </button>

                  )}


                  {order.status ===
                    "ready" && (

                    <button
                      onClick={() =>
                        updateStatus(
                          order.orderId,
                          "completed"
                        )
                      }
                      className="secondary-button"
                      disabled={updating}
                    >
                      Complete Order
                    </button>

                  )}


                  {order.status !==
                    "completed" &&
                    order.status !==
                      "cancelled" &&
                    order.status !==
                      "billed" && (

                    <button
                      onClick={() =>
                        cancelOrder(
                          order.orderId
                        )
                      }
                      className="secondary-button"
                      disabled={updating}
                    >
                      Cancel
                    </button>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* =====================================
          SELECTED ORDER DETAILS
      ===================================== */}

      {selectedOrder && (

        <div className="dashboard-section">

          <div className="section-header">

            <h2>
              Order Details
            </h2>

            <button
              onClick={() =>
                setSelectedOrder(null)
              }
              className="text-button"
            >
              Close
            </button>

          </div>


          <p>
            <strong>
              Order ID:
            </strong>{" "}
            {selectedOrder.orderId}
          </p>


          <p>
            <strong>
              Customer:
            </strong>{" "}
            {selectedOrder.customer?.name ||
              "Unknown"}
          </p>


          <p>
            <strong>
              Phone:
            </strong>{" "}
            {selectedOrder.customer?.phone ||
              "Not available"}
          </p>


          <p>
            <strong>
              Email:
            </strong>{" "}
            {selectedOrder.customer?.email ||
              "Not available"}
          </p>


          <p>
            <strong>
              Status:
            </strong>{" "}
            {selectedOrder.status}
          </p>


          <p>
            <strong>
              Queue Position:
            </strong>{" "}
            {selectedOrder.queuePosition ??
              "Not in queue"}
          </p>


          <p>
            <strong>
              Total Amount:
            </strong>{" "}
            ₹{selectedOrder.totalAmount}
          </p>


          <h3>
            Items
          </h3>

          {selectedOrder.items?.map(
            (item) => (

              <div
                key={item.itemId}
              >

                <p>
                  <strong>
                    {item.product?.name ||
                      "Product"}
                  </strong>

                  {" × "}

                  {item.quantity}

                  {" — ₹"}

                  {item.unitPrice}
                </p>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}

export default Orders;