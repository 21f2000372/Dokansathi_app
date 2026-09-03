import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";
import { useCart } from "../context/CartContext";

function CustomerProducts() {
  const navigate = useNavigate();

  const {
    cart,
    addToCart: addItemToCart,
    updateQuantity: updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartItemCount,
  } = useCart();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        "/products/shop"
      );

      setProducts(data.products || []);

    } catch (error) {
      console.error(
        "Failed to load customer products:",
        error
      );

      setError(
        error.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadProducts();
  }, []);


  // ==========================================
  // ADD TO CART
  // ==========================================

  const addToCart = (product) => {
    setError("");
    setSuccess("");

    const result = addItemToCart(product);

    if (result !== true) {
      setError(result);
    }
  };


  // ==========================================
  // CHANGE CART QUANTITY
  // ==========================================

  const updateQuantity = (
    productId,
    quantity
  ) => {
    const result = updateCartQuantity(
      productId,
      quantity
    );

    if (result !== true) {
      setError(result);
    }
  };


  // ==========================================
  // PLACE ORDER
  // ==========================================

  const placeOrder = async () => {

    if (cart.length === 0) {
      setError(
        "Your cart is empty."
      );
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");
      setSuccess("");

      const items = cart.map(
        (item) => ({
          productId:
            item.productId,
          quantity:
            item.quantity,
        })
      );


      const data = await apiRequest(
        "/orders",
        {
          method: "POST",

          body: JSON.stringify({
            items,
          }),
        }
      );


      console.log(
        "Order created:",
        data
      );


      clearCart();

      setSuccess(
        "Order placed successfully!"
      );


      // Refresh products so stock
      // displayed on the page is current.
      await loadProducts();

    } catch (error) {

      console.error(
        "Failed to place order:",
        error
      );

      setError(
        error.message ||
          "Failed to place order"
      );

    } finally {
      setPlacingOrder(false);
    }
  };


  // ==========================================
  // FILTERED PRODUCTS (SEARCH)
  // ==========================================

  const filteredProducts = products.filter(
    (product) => {
      const term = searchTerm
        .trim()
        .toLowerCase();

      if (term === "") {
        return true;
      }

      return (
        product.name
          ?.toLowerCase()
          .includes(term) ||
        product.category
          ?.toLowerCase()
          .includes(term)
      );
    }
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
            Shop Products
          </h1>

          <p>
            Browse products and place your
            order.
          </p>

        </div>

        <button
          onClick={() =>
            navigate("/customer-dashboard")
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
        <div>
          {success}
        </div>
      )}


      {/* =====================================
          PRODUCTS
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Available Products
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
              placeholder="Search by name or category..."
            />

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

        </div>


        {loading ? (

          <p>
            Loading products...
          </p>

        ) : products.length === 0 ? (

          <p>
            No products available.
          </p>

        ) : filteredProducts.length === 0 ? (

          <p>
            No products match your search.
          </p>

        ) : (

          <div className="dashboard-cards">

            {filteredProducts.map(
              (product) => (

                <div
                  key={
                    product.productId
                  }
                  className="dashboard-card"
                >

                  <div className="dashboard-card-icon">
                    📦
                  </div>


                  <h3>
                    {product.name}
                  </h3>


                  <p>
                    {product.category}
                  </p>


                  <p>
                    Price: ₹
                    {product.price}
                  </p>


                  <p>
                    Stock:{" "}
                    {product.stockQuantity}{" "}
                    {product.unit}
                  </p>


                  <button
                    onClick={() =>
                      addToCart(product)
                    }
                    className="primary-button"
                    disabled={
                      product.stockQuantity <=
                      0
                    }
                  >
                    {product.stockQuantity <=
                    0
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </button>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* =====================================
          CART
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Cart
          </h2>

          <span>
            {cartItemCount} item
            {cartItemCount !== 1
              ? "s"
              : ""}
          </span>

        </div>


        {cart.length === 0 ? (

          <p>
            Your cart is empty.
          </p>

        ) : (

          <>

            <div className="recent-users">

              {cart.map(
                (item) => (

                  <div
                    key={
                      item.productId
                    }
                    className="recent-user"
                  >

                    <div>

                      <strong>
                        {item.name}
                      </strong>

                      <p>
                        ₹
                        {item.price}{" "}
                        each
                      </p>

                    </div>


                    <div>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity - 1
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
                        {item.quantity}
                      </strong>


                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1
                          )
                        }
                        className="secondary-button"
                      >
                        +
                      </button>

                    </div>


                    <div>

                      <strong>
                        ₹
                        {(
                          item.price *
                          item.quantity
                        ).toFixed(2)}
                      </strong>

                    </div>


                    <button
                      onClick={() =>
                        removeFromCart(
                          item.productId
                        )
                      }
                      className="secondary-button"
                    >
                      Remove
                    </button>

                  </div>

                )
              )}

            </div>


            {/* =================================
                CART TOTAL
            ================================= */}

            <div
              style={{
                marginTop:
                  "20px",
              }}
            >

              <h3>
                Total: ₹
                {cartTotal.toFixed(2)}
              </h3>


              <button
                onClick={placeOrder}
                className="primary-button"
                disabled={placingOrder}
              >
                {placingOrder
                  ? "Placing Order..."
                  : "Place Order"}
              </button>

            </div>

          </>

        )}

      </div>

    </div>
  );
}

export default CustomerProducts;