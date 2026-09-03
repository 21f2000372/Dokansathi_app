import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";

function Performance() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // AI insights
  const [insights, setInsights] =
    useState("");
  const [aiLoading, setAiLoading] =
    useState(false);
  const [aiError, setAiError] =
    useState("");


  // ==========================================
  // LOAD ANALYTICS
  // ==========================================

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        "/orders/analytics"
      );

      setAnalytics(data);

    } catch (error) {
      console.error(
        "Failed to load analytics:",
        error
      );

      setError(
        error.message ||
          "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadAnalytics();
  }, []);


  // ==========================================
  // GENERATE AI INSIGHTS
  // ==========================================

  const generateInsights = async () => {
    try {
      setAiLoading(true);
      setAiError("");
      setInsights("");

      const data = await apiRequest(
        "/ai/insights",
        {
          method: "POST",
        }
      );

      setInsights(data.insights || "");

    } catch (error) {
      console.error(
        "Failed to generate insights:",
        error
      );

      setAiError(
        error.message ||
          "Failed to generate insights"
      );
    } finally {
      setAiLoading(false);
    }
  };


  // ==========================================
  // DERIVED LISTS
  // ==========================================

  const products =
    analytics?.products || [];

  // Products are already sorted by revenue
  // (highest first) from the backend.
  const bestSellers = products.slice(0, 5);

  const slowestSellers =
    products.length > 5
      ? products.slice(-5).reverse()
      : [];


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
            Shop Performance
          </h1>

          <p>
            See which products sell best and
            get AI-powered suggestions.
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
          SUMMARY CARDS
      ===================================== */}

      <div className="dashboard-cards">

        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            💰
          </div>

          <h3>
            Total Revenue
          </h3>

          <p className="dashboard-card-number">
            {loading
              ? "..."
              : `₹${analytics?.totalRevenue ?? 0}`}
          </p>

        </div>


        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            🛒
          </div>

          <h3>
            Total Orders
          </h3>

          <p className="dashboard-card-number">
            {loading
              ? "..."
              : analytics?.totalOrders ?? 0}
          </p>

        </div>


        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            📦
          </div>

          <h3>
            Products Sold
          </h3>

          <p className="dashboard-card-number">
            {loading
              ? "..."
              : analytics?.productCount ?? 0}
          </p>

        </div>

      </div>


      {/* =====================================
          AI INSIGHTS
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            AI Insights
          </h2>

          <button
            onClick={generateInsights}
            className="primary-button"
            disabled={aiLoading || loading}
          >
            {aiLoading
              ? "Generating..."
              : "Generate Insights"}
          </button>

        </div>


        {aiError && (
          <div className="error-message">
            {aiError}
          </div>
        )}


        {insights ? (

          <p
            style={{
              whiteSpace: "pre-line",
              lineHeight: 1.6,
            }}
          >
            {insights}
          </p>

        ) : (

          !aiError && (

            <p>
              Click "Generate Insights" for an
              AI summary of how your shop is
              performing.
            </p>

          )

        )}

      </div>


      {/* =====================================
          BEST SELLERS
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Best Sellers
          </h2>

          <button
            onClick={loadAnalytics}
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
            Loading analytics...
          </p>

        ) : bestSellers.length === 0 ? (

          <p>
            No sales yet.
          </p>

        ) : (

          <div className="recent-users">

            {bestSellers.map(
              (product, index) => (

                <div
                  key={product.productId}
                  className="recent-user"
                >

                  <div>

                    <strong>
                      #{index + 1}{" "}
                      {product.name}
                    </strong>

                    <p>
                      {product.unitsSold}{" "}
                      units sold
                    </p>

                    <p>
                      {product.orderCount}{" "}
                      order
                      {product.orderCount !==
                      1
                        ? "s"
                        : ""}
                    </p>

                  </div>


                  <div>

                    <strong>
                      ₹{product.revenue}
                    </strong>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* =====================================
          SLOWEST SELLERS
      ===================================== */}

      {slowestSellers.length > 0 && (

        <div className="dashboard-section">

          <div className="section-header">

            <h2>
              Slowest Sellers
            </h2>

          </div>


          <div className="recent-users">

            {slowestSellers.map(
              (product) => (

                <div
                  key={product.productId}
                  className="recent-user"
                >

                  <div>

                    <strong>
                      {product.name}
                    </strong>

                    <p>
                      {product.unitsSold}{" "}
                      units sold
                    </p>

                    <p>
                      {product.orderCount}{" "}
                      order
                      {product.orderCount !==
                      1
                        ? "s"
                        : ""}
                    </p>

                  </div>


                  <div>

                    <strong>
                      ₹{product.revenue}
                    </strong>

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

export default Performance;
