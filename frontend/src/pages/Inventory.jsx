import { useEffect, useState } from "react";

import { apiRequest } from "../services/api";

function Inventory() {
  const [inventory, setInventory] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);
  const [addingProductId, setAddingProductId] = useState(null);


  // ==========================================
  // LOAD INVENTORY + PRODUCTS
  // ==========================================

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        inventoryData,
        productsData,
      ] = await Promise.all([
        apiRequest("/inventory"),
        apiRequest("/products"),
      ]);

      setInventory(
        inventoryData.inventory || null
      );

      setAllProducts(
        productsData.products || []
      );

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
    loadInventory();
  }, []);


  // ==========================================
  // CREATE INVENTORY
  // ==========================================

  const createInventory = async () => {
    try {
      setCreating(true);
      setError("");

      await apiRequest("/inventory", {
        method: "POST",
      });

      await loadInventory();

    } catch (error) {
      console.error(
        "Failed to create inventory:",
        error
      );

      setError(
        error.message ||
          "Failed to create inventory"
      );
    } finally {
      setCreating(false);
    }
  };


  // ==========================================
  // GET INVENTORY PRODUCTS
  // ==========================================

  const inventoryProducts =
    inventory?.products || [];


  // ==========================================
  // FIND PRODUCTS NOT IN INVENTORY
  // ==========================================

  const inventoryProductIds =
    new Set(
      inventoryProducts.map(
        (product) =>
          product.productId
      )
    );


  const productsNotInInventory =
    allProducts.filter(
      (product) =>
        !inventoryProductIds.has(
          product.productId
        )
    );


  // ==========================================
  // ADD PRODUCT TO INVENTORY
  // ==========================================

  const addProductToInventory =
    async (productId) => {

      try {
        setAddingProductId(productId);
        setError("");

        await apiRequest(
          `/inventory/products/${productId}`,
          {
            method: "POST",
          }
        );

        await loadInventory();

      } catch (error) {
        console.error(
          "Failed to add product to inventory:",
          error
        );

        setError(
          error.message ||
            "Failed to add product to inventory"
        );

      } finally {
        setAddingProductId(null);
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
            View and manage your shop inventory.
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
          INVENTORY
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Shop Inventory
          </h2>

          <button
            onClick={loadInventory}
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

        ) : inventory ? (

          <>

            {/* =================================
                SUMMARY
            ================================= */}

            <div className="dashboard-cards">

              <div className="dashboard-card">

                <div className="dashboard-card-icon">
                  📦
                </div>

                <h3>
                  Total Products
                </h3>

                <p className="dashboard-card-number">
                  {inventoryProducts.length}
                </p>

              </div>

            </div>


            {/* =================================
                INVENTORY PRODUCTS
            ================================= */}

            {inventoryProducts.length >
            0 ? (

              <div className="recent-users">

                {inventoryProducts.map(
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
                          {product.stockQuantity}
                        </strong>

                        <p>
                          {product.unit}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p>
                No products are currently
                associated with your inventory.
              </p>

            )}

          </>

        ) : (

          /* =================================
             NO INVENTORY
          ================================= */

          <div>

            <p>
              Your shop does not have an
              inventory yet.
            </p>

            <button
              onClick={createInventory}
              className="primary-button"
              disabled={creating}
            >
              {creating
                ? "Creating..."
                : "Create Inventory"}
            </button>

          </div>

        )}

      </div>


      {/* =====================================
          PRODUCTS NOT IN INVENTORY
      ===================================== */}

      {inventory &&
        productsNotInInventory.length > 0 && (

        <div className="dashboard-section">

          <div className="section-header">

            <h2>
              Products Not In Inventory
            </h2>

          </div>


          <p>
            These products exist in your shop
            but are not currently associated
            with your inventory.
          </p>


          <div className="recent-users">

            {productsNotInInventory.map(
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


                  <div>

                    <button
                      onClick={() =>
                        addProductToInventory(
                          product.productId
                        )
                      }
                      className="primary-button"
                      disabled={
                        addingProductId ===
                        product.productId
                      }
                    >
                      {addingProductId ===
                      product.productId
                        ? "Adding..."
                        : "Add to Inventory"}
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default Inventory;