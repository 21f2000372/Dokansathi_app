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

  // Reviews keyed by orderId.
  // existingReviews[orderId] = review or null
  // reviewDrafts[orderId] = { rating, comment }
  const [existingReviews, setExistingReviews] =
    useState({});
  const [reviewDrafts, setReviewDrafts] =
    useState({});
  const [submittingReviewId, setSubmittingReviewId] =
    useState(null);

  // Edit mode for pending orders.
  // editingOrderId = orderId currently being edited
  // editDraft = { [itemId]: quantity }
  const [editingOrderId, setEditingOrderId] =
    useState(null);
  const [editDraft, setEditDraft] =
    useState({});
  const [savingEdit, setSavingEdit] =
    useState(false);


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
  // OPEN / CLOSE ORDER DETAILS
  //
  // When a completed order is opened, load the
  // customer's existing review (if any) so the
  // form can be pre-filled.
  // ==========================================

  const toggleOrderDetails = async (order) => {
    // Collapse if already open.
    if (
      selectedOrder?.orderId === order.orderId
    ) {
      setSelectedOrder(null);
      return;
    }

    setSelectedOrder(order);

    if (order.status !== "completed") {
      return;
    }

    // Avoid refetching if we already have it.
    if (
      existingReviews[order.orderId] !==
      undefined
    ) {
      return;
    }

    try {
      const data = await apiRequest(
        `/reviews/${order.orderId}`
      );

      const review = data.review || null;

      setExistingReviews((previous) => ({
        ...previous,
        [order.orderId]: review,
      }));

      setReviewDrafts((previous) => ({
        ...previous,
        [order.orderId]: {
          rating: review?.rating || 0,
          comment: review?.comment || "",
        },
      }));

    } catch (error) {
      console.error(
        "Failed to load review:",
        error
      );
    }
  };


  // ==========================================
  // REVIEW DRAFT HELPERS
  // ==========================================

  const getDraft = (orderId) =>
    reviewDrafts[orderId] || {
      rating: 0,
      comment: "",
    };

  const setDraftRating = (orderId, rating) => {
    setReviewDrafts((previous) => ({
      ...previous,
      [orderId]: {
        ...getDraft(orderId),
        rating,
      },
    }));
  };

  const setDraftComment = (
    orderId,
    comment
  ) => {
    setReviewDrafts((previous) => ({
      ...previous,
      [orderId]: {
        ...getDraft(orderId),
        comment,
      },
    }));
  };


  // ==========================================
  // SUBMIT REVIEW
  // ==========================================

  const submitReview = async (orderId) => {
    const draft = getDraft(orderId);

    if (
      !draft.rating ||
      draft.rating < 1
    ) {
      setError(
        "Please select a star rating."
      );
      return;
    }

    try {
      setSubmittingReviewId(orderId);
      setError("");
      setSuccess("");

      const data = await apiRequest(
        `/reviews/${orderId}`,
        {
          method: "POST",
          body: JSON.stringify({
            rating: draft.rating,
            comment: draft.comment,
          }),
        }
      );

      setExistingReviews((previous) => ({
        ...previous,
        [orderId]: data.review,
      }));

      setSuccess(
        "Thank you! Your review was saved."
      );

    } catch (error) {
      console.error(
        "Failed to submit review:",
        error
      );

      setError(
        error.message ||
          "Failed to submit review"
      );
    } finally {
      setSubmittingReviewId(null);
    }
  };


  // ==========================================
  // EDIT ORDER (pending only)
  // ==========================================

  const startEdit = (order) => {
    setError("");
    setSuccess("");

    // Seed the draft with current quantities.
    const draft = {};

    for (const item of order.items || []) {
      draft[item.itemId] = item.quantity;
    }

    setEditDraft(draft);
    setEditingOrderId(order.orderId);
  };


  const cancelEdit = () => {
    setEditingOrderId(null);
    setEditDraft({});
  };


  const changeEditQty = (itemId, delta) => {
    setEditDraft((previous) => {
      const current = previous[itemId] || 1;
      const next = current + delta;

      // Minimum quantity is 1 (removing an item
      // is done via Cancel Order).
      if (next < 1) {
        return previous;
      }

      return {
        ...previous,
        [itemId]: next,
      };
    });
  };


  const saveEdit = async (orderId) => {
    try {
      setSavingEdit(true);
      setError("");
      setSuccess("");

      const items = Object.entries(
        editDraft
      ).map(([itemId, quantity]) => ({
        itemId,
        quantity,
      }));

      await apiRequest(
        `/orders/my/${orderId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            items,
          }),
        }
      );

      setSuccess(
        "Order updated successfully."
      );

      setEditingOrderId(null);
      setEditDraft({});
      setSelectedOrder(null);

      await loadOrders();

    } catch (error) {
      console.error(
        "Failed to update order:",
        error
      );

      setError(
        error.message ||
          "Failed to update order"
      );
    } finally {
      setSavingEdit(false);
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
                      toggleOrderDetails(
                        order
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


                    {/* Edit order (pending only) */}

                    {order.status ===
                      "pending" && (

                      <div
                        style={{
                          marginTop: "20px",
                          paddingTop: "15px",
                          borderTop:
                            "1px solid var(--border)",
                        }}
                      >

                        {editingOrderId ===
                        order.orderId ? (

                          <>

                            <h4>
                              Edit Quantities
                            </h4>

                            {order.items?.map(
                              (item) => (

                                <div
                                  key={
                                    item.itemId
                                  }
                                  className="recent-user"
                                >

                                  <div>

                                    <strong>
                                      {item
                                        .product
                                        ?.name ||
                                        "Product"}
                                    </strong>

                                    <p>
                                      ₹
                                      {
                                        item.unitPrice
                                      }{" "}
                                      each
                                    </p>

                                  </div>


                                  <div>

                                    <button
                                      onClick={() =>
                                        changeEditQty(
                                          item.itemId,
                                          -1
                                        )
                                      }
                                      className="secondary-button"
                                    >
                                      −
                                    </button>

                                    <strong
                                      style={{
                                        margin:
                                          "0 10px",
                                      }}
                                    >
                                      {editDraft[
                                        item
                                          .itemId
                                      ] ??
                                        item.quantity}
                                    </strong>

                                    <button
                                      onClick={() =>
                                        changeEditQty(
                                          item.itemId,
                                          1
                                        )
                                      }
                                      className="secondary-button"
                                    >
                                      +
                                    </button>

                                  </div>

                                </div>

                              )
                            )}


                            <div
                              className="quick-actions"
                              style={{
                                marginTop:
                                  "12px",
                              }}
                            >

                              <button
                                onClick={() =>
                                  saveEdit(
                                    order.orderId
                                  )
                                }
                                className="primary-button"
                                disabled={
                                  savingEdit
                                }
                              >
                                {savingEdit
                                  ? "Saving..."
                                  : "Save Changes"}
                              </button>

                              <button
                                onClick={
                                  cancelEdit
                                }
                                className="secondary-button"
                                disabled={
                                  savingEdit
                                }
                              >
                                Cancel Edit
                              </button>

                            </div>

                          </>

                        ) : (

                          <button
                            onClick={() =>
                              startEdit(order)
                            }
                            className="primary-button"
                          >
                            Edit Order
                          </button>

                        )}

                      </div>

                    )}


                    {/* Review (completed orders) */}

                    {order.status ===
                      "completed" && (

                      <div
                        style={{
                          marginTop: "20px",
                          paddingTop: "15px",
                          borderTop:
                            "1px solid var(--border)",
                        }}
                      >

                        <h4>
                          {existingReviews[
                            order.orderId
                          ]
                            ? "Your Review"
                            : "Rate this order"}
                        </h4>


                        {/* Star rating */}

                        <div
                          style={{
                            fontSize: "24px",
                            cursor: "pointer",
                          }}
                        >

                          {[1, 2, 3, 4, 5].map(
                            (star) => (

                              <span
                                key={star}
                                onClick={() =>
                                  setDraftRating(
                                    order.orderId,
                                    star
                                  )
                                }
                                title={`${star} star${
                                  star !== 1
                                    ? "s"
                                    : ""
                                }`}
                                style={{
                                  marginRight:
                                    "4px",
                                }}
                              >
                                {getDraft(
                                  order.orderId
                                ).rating >=
                                star
                                  ? "★"
                                  : "☆"}
                              </span>

                            )
                          )}

                        </div>


                        <textarea
                          value={
                            getDraft(
                              order.orderId
                            ).comment
                          }
                          onChange={(event) =>
                            setDraftComment(
                              order.orderId,
                              event.target
                                .value
                            )
                          }
                          placeholder="Write a comment (optional)..."
                          rows={3}
                          maxLength={500}
                          style={{
                            width: "100%",
                            marginTop: "10px",
                          }}
                        />


                        <div
                          className="quick-actions"
                          style={{
                            marginTop: "10px",
                          }}
                        >

                          <button
                            onClick={() =>
                              submitReview(
                                order.orderId
                              )
                            }
                            className="primary-button"
                            disabled={
                              submittingReviewId ===
                              order.orderId
                            }
                          >
                            {submittingReviewId ===
                            order.orderId
                              ? "Saving..."
                              : existingReviews[
                                  order.orderId
                                ]
                              ? "Update Review"
                              : "Submit Review"}
                          </button>

                        </div>

                      </div>

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
