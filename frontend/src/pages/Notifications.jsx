import { useEffect, useState } from "react";

import { apiRequest } from "../services/api";


function Notifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==========================================
  // LOAD NOTIFICATIONS
  // ==========================================

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        "/notifications"
      );

      setNotifications(
        data.notifications || []
      );

    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      setError(
        error.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadNotifications();
  }, []);


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
            Notifications
          </h1>

          <p>
            Updates about your orders and
            tasks.
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
          LIST
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Recent
          </h2>

          <button
            onClick={loadNotifications}
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
            Loading notifications...
          </p>

        ) : notifications.length === 0 ? (

          <p>
            You have no notifications yet.
          </p>

        ) : (

          <div className="recent-users">

            {notifications.map(
              (notification) => (

                <div
                  key={
                    notification.notificationId
                  }
                  className="recent-user"
                >

                  <div>

                    <strong>
                      🔔{" "}
                      {notification.message}
                    </strong>

                    <p>
                      {notification.order
                        ?.orderId
                        ? `Order #${notification.order.orderId.slice(
                            0,
                            8
                          )}`
                        : ""}

                      {notification.order
                        ?.status
                        ? ` · ${notification.order.status}`
                        : ""}
                    </p>

                  </div>


                  <span>
                    {notification.sentAt
                      ? new Date(
                          notification.sentAt
                        ).toLocaleString()
                      : ""}
                  </span>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Notifications;
