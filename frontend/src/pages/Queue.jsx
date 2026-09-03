import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";


function Queue() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==========================================
  // LOAD QUEUE
  // ==========================================

  const loadQueue = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/queue");

      // The queue endpoint returns { queue: [...] }
      setOrders(data.queue || []);

    } catch (error) {
      console.error(
        "Failed to load queue:",
        error
      );

      setError(
        error.message ||
          "Failed to load queue"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadQueue();
  }, []);


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
  // QUEUED ORDERS
  //
  // Only orders that currently hold a queue
  // position, sorted by that position.
  // ==========================================

  const queuedOrders = orders
    .filter(
      (order) =>
        order.queuePosition !== null &&
        order.queuePosition !== undefined
    )
    .sort(
      (a, b) =>
        a.queuePosition - b.queuePosition
    );


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
            Order Queue
          </h1>

          <p>
            Orders waiting to be prepared, in
            queue order.
          </p>

        </div>

        <button
          onClick={() =>
            navigate("/owner-dashboard")
          }
          className="secondary-button"
        >
          Back to Dashboard
        </button>

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
          SUMMARY
      ===================================== */}

      <div className="dashboard-cards">

        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            🧾
          </div>

          <h3>
            In Queue
          </h3>

          <p className="dashboard-card-number">
            {loading
              ? "..."
              : queuedOrders.length}
          </p>

        </div>

      </div>


      {/* =====================================
          QUEUE
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Current Queue
          </h2>

          <button
            onClick={loadQueue}
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
            Loading queue...
          </p>

        ) : queuedOrders.length === 0 ? (

          <p>
            The queue is empty right now.
          </p>

        ) : (

          <div className="orders-list">

            {queuedOrders.map((order) => (

              <div
                key={order.orderId}
                className="dashboard-section"
                style={{
                  marginBottom: "15px",
                }}
              >

                {/* Header row */}

                <div className="section-header">

                  <div>

                    <h3>
                      #{order.queuePosition}{" "}
                      — Order{" "}
                      {order.orderId.slice(
                        0,
                        8
                      )}
                    </h3>

                    <p>
                      Customer:{" "}
                      <strong>
                        {order.customer
                          ?.name ||
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


                {/* Info */}

                <div>

                  <p>
                    <strong>
                      Total:
                    </strong>{" "}
                    ₹{order.totalAmount}
                  </p>

                  <p>
                    <strong>
                      Placed:
                    </strong>{" "}
                    {new Date(
                      order.createdAt
                    ).toLocaleString()}
                  </p>

                </div>


                {/* Items */}

                <div>

                  <h4>
                    Items
                  </h4>

                  {order.items &&
                  order.items.length > 0 ? (

                    <div className="recent-users">

                      {order.items.map(
                        (item) => (

                          <div
                            key={
                              item.itemId
                            }
                            className="recent-user"
                          >

                            <div>

                              <strong>
                                {item.product
                                  ?.name ||
                                  "Product"}
                              </strong>

                              <p>
                                {item.product
                                  ?.category ||
                                  ""}
                              </p>

                            </div>


                            <div>

                              <strong>
                                ×{" "}
                                {
                                  item.quantity
                                }{" "}
                                {item.product
                                  ?.unit ||
                                  ""}
                              </strong>

                              <p>
                                ₹
                                {
                                  item.unitPrice
                                }{" "}
                                each
                              </p>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <p>
                      No item details
                      available.
                    </p>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Queue;
