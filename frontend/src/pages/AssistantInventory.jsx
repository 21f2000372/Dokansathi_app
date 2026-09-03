import { useEffect, useState } from "react";

import { apiRequest } from "../services/api";


function AssistantInventory() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // productId currently being sent as a reminder
  const [remindingId, setRemindingId] =
    useState(null);


  // ==========================================
  // LOAD PRODUCTS (READ-ONLY)
  // ==========================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        "/products/assistant"
      );

      setProducts(data.products || []);

    } catch (error) {
      console.error(
        "Failed to load inventory:",
        error
      );

      setError(
        error.message ||
          "Failed to load inventory"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadProducts();
  }, []);


  // ==========================================
  // LOW STOCK HELPER
  // ==========================================

  const lowStockCount = products.filter(
    (product) =>
      Number(product.stockQuantity) <= 5
  ).length;


  // ==========================================
  // SEND LOW-STOCK REMINDER TO OWNER
  // ==========================================

  const sendReminder = async (product) => {
    try {
      setRemindingId(product.productId);
      setError("");
      setSuccess("");

      await apiRequest(
        `/notifications/reminder/${product.productId}`,
        {
          method: "POST",
        }
      );

      setSuccess(
        `Reminder sent to owner for "${product.name}".`
      );

    } catch (error) {
      console.error(
        "Failed to send reminder:",
        error
      );

      setError(
        error.message ||
          "Failed to send reminder"
      );
    } finally {
      setRemindingId(null);
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
            Inventory
          </h1>

          <p>
            View the shop's products and
            current stock. Read-only.
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
            📦
          </div>

          <h3>
            Total Products
          </h3>

          <p className="dashboard-card-number">
            {loading
              ? "..."
              : products.length}
          </p>

        </div>


        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            ⚠️
          </div>

          <h3>
            Low Stock (≤ 5)
          </h3>

          <p className="dashboard-card-number">
            {loading
              ? "..."
              : lowStockCount}
          </p>

        </div>

      </div>


      {/* =====================================
          PRODUCTS
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Shop Products
          </h2>

          <button
            onClick={loadProducts}
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
            Loading inventory...
          </p>

        ) : products.length === 0 ? (

          <p>
            No products found.
          </p>

        ) : (

          <div className="recent-users">

            {products.map((product) => (

              <div
                key={product.productId}
                className="recent-user"
              >

                <div>

                  <strong>
                    {product.name}
                  </strong>

                  <p>
                    {product.category}
                  </p>

                  <p>
                    Price: ₹
                    {product.price}
                  </p>

                </div>


                <div>

                  <strong>
                    Stock:{" "}
                    {product.stockQuantity}{" "}
                    {product.unit}
                  </strong>

                  {Number(
                    product.stockQuantity
                  ) <= 5 && (

                    <>

                      <p>
                        <span className="status-cancelled">
                          Low stock
                        </span>
                      </p>

                      <button
                        onClick={() =>
                          sendReminder(
                            product
                          )
                        }
                        className="secondary-button"
                        disabled={
                          remindingId ===
                          product.productId
                        }
                      >
                        {remindingId ===
                        product.productId
                          ? "Sending..."
                          : "Send Reminder to Owner"}
                      </button>

                    </>

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

export default AssistantInventory;
