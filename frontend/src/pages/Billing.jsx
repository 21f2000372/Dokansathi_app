import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";


function Billing() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ==========================================
  // LOAD DATA
  // ==========================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersData, billsData] =
        await Promise.all([
          apiRequest("/orders/shop"),
          apiRequest("/bills"),
        ]);

      setOrders(ordersData.orders || []);
      setBills(billsData.bills || []);

    } catch (error) {
      console.error(
        "Failed to load billing data:",
        error
      );

      setError(
        error.message ||
          "Failed to load billing data"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  // ==========================================
  // ORDERS READY TO BILL
  //
  // "Ready" orders that don't already have
  // a bill.
  // ==========================================

  const billedOrderIds = new Set(
    bills.map(
      (bill) => bill.order?.orderId
    )
  );

  const readyOrders = orders.filter(
    (order) =>
      order.status === "ready" &&
      !billedOrderIds.has(order.orderId)
  );


  // ==========================================
  // GENERATE BILL
  // ==========================================

  const generateBill = async (orderId) => {
    try {
      setGeneratingId(orderId);
      setError("");
      setSuccess("");

      await apiRequest("/bills", {
        method: "POST",
        body: JSON.stringify({
          orderId,
        }),
      });

      setSuccess(
        "Bill generated successfully."
      );

      await loadData();

    } catch (error) {
      console.error(
        "Failed to generate bill:",
        error
      );

      setError(
        error.message ||
          "Failed to generate bill"
      );
    } finally {
      setGeneratingId(null);
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
            Billing
          </h1>

          <p>
            Generate bills for orders that are
            ready, and view bills you've
            already created.
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
          SUMMARY
      ===================================== */}

      <div className="dashboard-cards">

        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            ✅
          </div>

          <h3>
            Ready to Bill
          </h3>

          <p className="dashboard-card-number">
            {loading
              ? "..."
              : readyOrders.length}
          </p>

        </div>


        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            🧾
          </div>

          <h3>
            Total Bills
          </h3>

          <p className="dashboard-card-number">
            {loading
              ? "..."
              : bills.length}
          </p>

        </div>

      </div>


      {/* =====================================
          READY ORDERS
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Ready Orders
          </h2>

          <button
            onClick={loadData}
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

        ) : readyOrders.length === 0 ? (

          <p>
            No orders are ready to bill right
            now. Mark an order as "Ready" from
            the Orders page first.
          </p>

        ) : (

          <div className="recent-users">

            {readyOrders.map((order) => (

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
                    Customer:{" "}
                    {order.customer?.name ||
                      "Unknown"}
                  </p>

                  <p>
                    Total: ₹
                    {order.totalAmount}
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

                </div>


                <button
                  onClick={() =>
                    generateBill(
                      order.orderId
                    )
                  }
                  className="primary-button"
                  disabled={
                    generatingId ===
                    order.orderId
                  }
                >
                  {generatingId ===
                  order.orderId
                    ? "Generating..."
                    : "Generate Bill"}
                </button>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* =====================================
          BILLS
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            All Bills
          </h2>

          <span>
            {bills.length} bill
            {bills.length !== 1 ? "s" : ""}
          </span>

        </div>


        {loading ? (

          <p>
            Loading bills...
          </p>

        ) : bills.length === 0 ? (

          <p>
            No bills generated yet.
          </p>

        ) : (

          <div className="recent-users">

            {bills.map((bill) => (

              <div
                key={bill.billId}
                className="recent-user"
              >

                <div>

                  <strong>
                    Order #
                    {bill.order?.orderId?.slice(
                      0,
                      8
                    ) || "N/A"}
                  </strong>

                  <p>
                    Generated:{" "}
                    {bill.generatedAt
                      ? new Date(
                          bill.generatedAt
                        ).toLocaleString()
                      : "—"}
                  </p>

                </div>


                <div>

                  <strong>
                    ₹{bill.amount}
                  </strong>

                  <p>
                    <span
                      className={getStatusClass(
                        bill.order?.status
                      )}
                    >
                      {bill.order?.status ||
                        "—"}
                    </span>
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Billing;
