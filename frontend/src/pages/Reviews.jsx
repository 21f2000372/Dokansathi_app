import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";

function Reviews() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    averageRating: 0,
    totalReviews: 0,
    reviews: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==========================================
  // LOAD REVIEWS
  // ==========================================

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiRequest(
        "/reviews/shop"
      );

      setData({
        averageRating:
          result.averageRating || 0,
        totalReviews:
          result.totalReviews || 0,
        reviews: result.reviews || [],
      });

    } catch (error) {
      console.error(
        "Failed to load reviews:",
        error
      );

      setError(
        error.message ||
          "Failed to load reviews"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadReviews();
  }, []);


  // ==========================================
  // STARS HELPER
  // ==========================================

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5]
      .map((star) =>
        star <= rating ? "★" : "☆"
      )
      .join("");
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
            Customer Reviews
          </h1>

          <p>
            See what customers say about their
            completed orders.
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
            ⭐
          </div>

          <h3>
            Average Rating
          </h3>

          <p className="dashboard-card-number">
            {loading
              ? "..."
              : `${data.averageRating} / 5`}
          </p>

        </div>


        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            📝
          </div>

          <h3>
            Total Reviews
          </h3>

          <p className="dashboard-card-number">
            {loading
              ? "..."
              : data.totalReviews}
          </p>

        </div>

      </div>


      {/* =====================================
          REVIEWS LIST
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            All Reviews
          </h2>

          <button
            onClick={loadReviews}
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
            Loading reviews...
          </p>

        ) : data.reviews.length === 0 ? (

          <p>
            No reviews yet.
          </p>

        ) : (

          <div className="recent-users">

            {data.reviews.map((review) => (

              <div
                key={review.reviewId}
                className="recent-user"
              >

                <div>

                  <strong>
                    {review.customerName}
                  </strong>

                  <p
                    style={{
                      fontSize: "20px",
                      color: "#f5a623",
                    }}
                  >
                    {renderStars(
                      review.rating
                    )}{" "}
                    <span
                      style={{
                        fontSize: "14px",
                      }}
                    >
                      ({review.rating}/5)
                    </span>
                  </p>

                  {review.comment && (

                    <p>
                      "{review.comment}"
                    </p>

                  )}

                  <p>
                    Order #
                    {review.orderId.slice(
                      0,
                      8
                    )}
                  </p>

                </div>


                <div>

                  <span>
                    {review.createdAt
                      ? new Date(
                          review.createdAt
                        ).toLocaleString()
                      : ""}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Reviews;
