import { useEffect, useState } from "react";

import { apiRequest } from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [stockProduct, setStockProduct] =
    useState(null);

  const [stockValue, setStockValue] =
    useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stockQuantity: "",
    unit: "",
  });

  const [saving, setSaving] = useState(false);


  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/products");

      setProducts(data.products || []);

    } catch (error) {
      console.error(
        "Failed to load products:",
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
  // FORM CHANGE
  // ==========================================

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]:
        event.target.value,
    });
  };


  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      stockQuantity: "",
      unit: "",
    });

    setEditingProduct(null);
    setShowForm(false);
  };


  // ==========================================
  // ADD PRODUCT
  // ==========================================

  const addProduct = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      /*
       * STEP 1
       * Create the product.
       */

      const productData = await apiRequest(
        "/products",
        {
          method: "POST",

          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            price: Number(formData.price),
            stockQuantity: Number(
              formData.stockQuantity
            ),
            unit: formData.unit,
          }),
        }
      );

      console.log(
        "Product created:",
        productData
      );


      /*
       * Get the newly created product.
       *
       * Depending on your controller response,
       * the product may be inside:
       *
       * productData.product
       */

      const newProduct =
        productData.product;


      if (!newProduct?.productId) {
        throw new Error(
          "Product created, but product ID was not returned by the server"
        );
      }


      /*
       * STEP 2
       *
       * Add the newly created product
       * to the existing inventory.
       */

      await apiRequest(
        `/inventory/products/${newProduct.productId}`,
        {
          method: "POST",
        }
      );


      /*
       * STEP 3
       *
       * Reload products.
       */

      await loadProducts();


      /*
       * Reset form.
       */

      resetForm();

    } catch (error) {
      console.error(
        "Failed to add product:",
        error
      );

      setError(
        error.message ||
          "Failed to add product"
      );

    } finally {
      setSaving(false);
    }
  };


  // ==========================================
  // START EDIT
  // ==========================================

  const startEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      category: product.category || "",
      price: product.price || "",
      stockQuantity:
        product.stockQuantity || "",
      unit: product.unit || "",
    });

    setShowForm(true);
  };


  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  const updateProduct = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await apiRequest(
        `/products/${editingProduct.productId}`,
        {
          method: "PUT",

          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            price: Number(formData.price),
            unit: formData.unit,
          }),
        }
      );


      resetForm();

      await loadProducts();

    } catch (error) {
      console.error(
        "Failed to update product:",
        error
      );

      setError(
        error.message ||
          "Failed to update product"
      );

    } finally {
      setSaving(false);
    }
  };


  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const deleteProduct = async (
    productId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiRequest(
        `/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      await loadProducts();

    } catch (error) {
      console.error(
        "Failed to delete product:",
        error
      );

      setError(
        error.message ||
          "Failed to delete product"
      );
    }
  };


  // ==========================================
  // UPDATE STOCK
  // ==========================================

  const updateStock = async () => {
    if (stockValue === "") {
      setError(
        "Please enter a stock quantity"
      );
      return;
    }

    const quantity = Number(stockValue);

    if (
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError(
        "Stock quantity must be a valid non-negative number"
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiRequest(
        `/inventory/products/${stockProduct.productId}/stock`,
        {
          method: "PATCH",

          body: JSON.stringify({
            stockQuantity: quantity,
          }),
        }
      );


      setStockProduct(null);
      setStockValue("");

      await loadProducts();

    } catch (error) {
      console.error(
        "Failed to update stock:",
        error
      );

      setError(
        error.message ||
          "Failed to update stock"
      );

    } finally {
      setSaving(false);
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
            Products
          </h1>

          <p>
            Manage your shop products and
            inventory stock.
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
          SUMMARY
      ===================================== */}

      {!loading && (

        <div className="dashboard-cards">

          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              📦
            </div>

            <h3>
              Total Products
            </h3>

            <p className="dashboard-card-number">
              {products.length}
            </p>

          </div>

        </div>

      )}


      {/* =====================================
          PRODUCT MANAGEMENT
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Product Management
          </h2>

          <div className="quick-actions">

            <button
              onClick={() => {
                setEditingProduct(null);

                setFormData({
                  name: "",
                  category: "",
                  price: "",
                  stockQuantity: "",
                  unit: "",
                });

                setShowForm(true);
              }}
              className="primary-button"
            >
              Add Product
            </button>


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


        {/* =================================
            PRODUCT FORM
        ================================= */}

        {showForm && (

          <div className="dashboard-section">

            <h3>
              {editingProduct
                ? "Edit Product"
                : "Add New Product"}
            </h3>


            <form
              onSubmit={
                editingProduct
                  ? updateProduct
                  : addProduct
              }
            >

              <div>

                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>


              <div>

                <label>
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={handleChange}
                  required
                />

              </div>


              <div>

                <label>
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />

              </div>


              {!editingProduct && (

                <div>

                  <label>
                    Initial Stock
                  </label>

                  <input
                    type="number"
                    name="stockQuantity"
                    value={
                      formData.stockQuantity
                    }
                    onChange={handleChange}
                    min="0"
                    required
                  />

                </div>

              )}


              <div>

                <label>
                  Unit
                </label>

                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="kg, piece, litre..."
                  required
                />

              </div>


              <div className="quick-actions">

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>


                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        )}

      </div>


      {/* =====================================
          PRODUCT LIST
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            All Products
          </h2>

        </div>


        {loading ? (

          <p>
            Loading products...
          </p>

        ) : products.length === 0 ? (

          <p>
            No products found.
          </p>

        ) : (

          <div className="recent-users">

            {products.map(
              (product) => (

                <div
                  key={
                    product.productId
                  }
                  className="recent-user"
                >

                  <div>

                    <strong>
                      {product.name}
                    </strong>

                    <p>
                      Category:{" "}
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

                  </div>


                  <div className="quick-actions">

                    <button
                      onClick={() =>
                        startEdit(product)
                      }
                      className="secondary-button"
                    >
                      Edit
                    </button>


                    <button
                      onClick={() => {
                        setStockProduct(
                          product
                        );

                        setStockValue(
                          product.stockQuantity
                        );
                      }}
                      className="secondary-button"
                    >
                      Update Stock
                    </button>


                    <button
                      onClick={() =>
                        deleteProduct(
                          product.productId
                        )
                      }
                      className="secondary-button"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* =====================================
          STOCK UPDATE
      ===================================== */}

      {stockProduct && (

        <div className="dashboard-section">

          <div className="section-header">

            <h2>
              Update Stock
            </h2>

            <button
              onClick={() => {
                setStockProduct(null);
                setStockValue("");
              }}
              className="text-button"
            >
              Close
            </button>

          </div>


          <p>
            Product:{" "}
            <strong>
              {stockProduct.name}
            </strong>
          </p>


          <label>
            New Stock Quantity
          </label>

          <input
            type="number"
            value={stockValue}
            onChange={(event) =>
              setStockValue(
                event.target.value
              )
            }
            min="0"
          />


          <div className="quick-actions">

            <button
              onClick={updateStock}
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Updating..."
                : "Update Stock"}
            </button>


            <button
              onClick={() => {
                setStockProduct(null);
                setStockValue("");
              }}
              className="secondary-button"
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Products;