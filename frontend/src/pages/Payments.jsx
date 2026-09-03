import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";


const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
];


function Payments() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [creatingBillId, setCreatingBillId] =
    useState(null);
  const [methodByBill, setMethodByBill] =
    useState({});

  const [updatingId, setUpdatingId] =
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

      const [billsData, paymentsData] =
        await Promise.all([
          apiRequest("/bills"),
          apiRequest("/payments"),
        ]);

      setBills(billsData.bills || []);
      setPayments(
        paymentsData.payments || []
      );

    } catch (error) {
      console.error(
        "Failed to load payment data:",
        error
      );

      setError(
        error.message ||
          "Failed to load payment data"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  // ==========================================
  // MATCH PAYMENTS TO BILLS BY AMOUNT
  //
  // Payments have no stored bill reference, so
  // a bill is paired with a payment of the same
  // amount. Each payment is consumed once, so
  // two bills with the same amount pair with
  // separate payment rows.
  // ==========================================

  const buildPaymentByBillId = () => {
    const map = new Map();

    // Group available payments by amount.
    const paymentsByAmount = new Map();

    for (const payment of payments) {
      const key = String(payment.amount);

      if (!paymentsByAmount.has(key)) {
        paymentsByAmount.set(key, []);
      }

      paymentsByAmount.get(key).push(payment);
    }

    // Pair each bill with one payment of the
    // same amount (consuming it).
    for (const bill of bills) {
      const key = String(bill.amount);

      const pool =
        paymentsByAmount.get(key) || [];

      if (pool.length > 0) {
        map.set(bill.billId, pool.shift());
      }
    }

    return map;
  };

  const paymentByBillId = buildPaymentByBillId();


  // ==========================================
  // CREATE PAYMENT
  // ==========================================

  const createPayment = async (billId) => {
    const method =
      methodByBill[billId] || "cash";

    try {
      setCreatingBillId(billId);
      setError("");
      setSuccess("");

      await apiRequest("/payments", {
        method: "POST",
        body: JSON.stringify({
          billId,
          method,
        }),
      });

      setSuccess(
        "Payment created. Mark it done once received."
      );

      await loadData();

    } catch (error) {
      console.error(
        "Failed to create payment:",
        error
      );

      setError(
        error.message ||
          "Failed to create payment"
      );
    } finally {
      setCreatingBillId(null);
    }
  };


  // ==========================================
  // MARK PAYMENT COMPLETED
  //
  // Manually confirmed by the owner (e.g.
  // cash handed over, UPI/card confirmed).
  // ==========================================

  const markPaymentDone = async (
    paymentId,
    orderId
  ) => {
    try {
      setUpdatingId(paymentId);
      setError("");
      setSuccess("");

      // 1. Mark the payment completed.
      await apiRequest(
        `/payments/${paymentId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "completed",
          }),
        }
      );

      // 2. Complete the order too. Payments
      // have no stored order link, so we use
      // the order id from the bill on this
      // page. This also fires the customer's
      // "order completed" notification.
      if (orderId) {
        try {
          await apiRequest(
            `/orders/shop/${orderId}/status`,
            {
              method: "PATCH",
              body: JSON.stringify({
                status: "completed",
              }),
            }
          );
        } catch (orderError) {
          console.error(
            "Payment done, but failed to complete order:",
            orderError
          );

          setError(
            "Payment marked done, but the order could not be completed automatically. You can complete it from the Orders page."
          );
        }
      }

      setSuccess(
        "Payment done and order completed."
      );

      await loadData();

    } catch (error) {
      console.error(
        "Failed to update payment:",
        error
      );

      setError(
        error.message ||
          "Failed to update payment"
      );
    } finally {
      setUpdatingId(null);
    }
  };


  // ==========================================
  // COUNTS
  // ==========================================

  const doneCount = payments.filter(
    (payment) =>
      payment.status === "completed"
  ).length;

  const pendingCount = payments.filter(
    (payment) =>
      payment.status === "pending"
  ).length;


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
            Payments
          </h1>

          <p>
            Record a payment for each bill and
            mark it done once the customer has
            paid.
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
            Payment Done
          </h3>

          <p className="dashboard-card-number">
            {loading ? "..." : doneCount}
          </p>

        </div>


        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            ⏳
          </div>

          <h3>
            Payment Pending
          </h3>

          <p className="dashboard-card-number">
            {loading
              ? "..."
              : pendingCount}
          </p>

        </div>

      </div>


      {/* =====================================
          BILLS + PAYMENTS
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Bills
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
            Loading bills...
          </p>

        ) : bills.length === 0 ? (

          <p>
            No bills yet. Generate a bill from
            the Billing page first.
          </p>

        ) : (

          <div className="recent-users">

            {bills.map((bill) => {

              const payment =
                paymentByBillId.get(
                  bill.billId
                );

              return (

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
                      Bill amount: ₹
                      {bill.amount}
                    </p>

                  </div>


                  {payment ? (

                    <>

                      <div>

                        <span
                          className={
                            payment.status ===
                            "completed"
                              ? "status-completed"
                              : "status-pending"
                          }
                        >
                          {payment.status ===
                          "completed"
                            ? "Payment Done"
                            : "Payment Pending"}
                        </span>

                        <p>
                          Method:{" "}
                          {payment.method}
                        </p>

                      </div>


                      {payment.status ===
                        "pending" && (

                        <button
                          onClick={() =>
                            markPaymentDone(
                              payment.paymentId,
                              bill.order
                                ?.orderId
                            )
                          }
                          className="primary-button"
                          disabled={
                            updatingId ===
                            payment.paymentId
                          }
                        >
                          {updatingId ===
                          payment.paymentId
                            ? "Updating..."
                            : "Mark as Done"}
                        </button>

                      )}

                    </>

                  ) : (

                    <>

                      <div>

                        <label>
                          Method
                        </label>

                        <select
                          value={
                            methodByBill[
                              bill.billId
                            ] || "cash"
                          }
                          onChange={(
                            event
                          ) =>
                            setMethodByBill({
                              ...methodByBill,
                              [bill.billId]:
                                event.target
                                  .value,
                            })
                          }
                        >

                          {PAYMENT_METHODS.map(
                            (option) => (

                              <option
                                key={
                                  option.value
                                }
                                value={
                                  option.value
                                }
                              >
                                {
                                  option.label
                                }
                              </option>

                            )
                          )}

                        </select>

                      </div>


                      <button
                        onClick={() =>
                          createPayment(
                            bill.billId
                          )
                        }
                        className="secondary-button"
                        disabled={
                          creatingBillId ===
                          bill.billId
                        }
                      >
                        {creatingBillId ===
                        bill.billId
                          ? "Creating..."
                          : "Record Payment"}
                      </button>

                    </>

                  )}

                </div>

              );

            })}

          </div>

        )}

      </div>

    </div>
  );
}

export default Payments;
