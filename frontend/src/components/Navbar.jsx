import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";


function Navbar() {
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Owner: orders whose prep is done and
  // await being marked ready/completed.
  const [ownerAlerts, setOwnerAlerts] =
    useState([]);

  // Assistant / customer: their own
  // notifications from the notifications table.
  const [userNotifications, setUserNotifications] =
    useState([]);

  const [dropdownOpen, setDropdownOpen] =
    useState(false);

  const dropdownRef = useRef(null);

  // IDs of notifications the user has already
  // seen. Tracked per user in localStorage so
  // the unread badge clears once the dropdown
  // is opened. Frontend-only (per browser).
  const [seenIds, setSeenIds] = useState([]);

  const seenStorageKey = user
    ? `seenNotifications:${user.userId}`
    : null;


  const isOwner =
    user?.role === "shop_owner";


  // ==========================================
  // TOGGLE THEME
  // ==========================================

  const toggleTheme = () => {
    setDarkMode((previous) => !previous);
    document.documentElement.classList.toggle("dark");
  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };


  // ==========================================
  // LOAD OWNER ALERTS
  //
  // "Ready to deliver" = the assistant's task
  // is completed but the order is not yet
  // completed or cancelled.
  // ==========================================

  const loadOwnerAlerts = async () => {

    try {

      const [tasksData, ordersData] =
        await Promise.all([
          apiRequest("/tasks"),
          apiRequest("/orders/shop"),
        ]);

      const tasks =
        tasksData.tasks || [];
      const orders =
        ordersData.orders || [];

      const completedTaskOrderIds =
        new Set(
          tasks
            .filter(
              (task) =>
                task.status === "completed"
            )
            .map(
              (task) =>
                task.order?.orderId
            )
        );

      const readyOrders = orders.filter(
        (order) =>
          completedTaskOrderIds.has(
            order.orderId
          ) &&
          order.status !== "completed" &&
          order.status !== "cancelled"
      );

      setOwnerAlerts(readyOrders);

    } catch (error) {
      console.error(
        "Failed to load owner alerts:",
        error
      );
    }
  };


  // ==========================================
  // LOAD USER NOTIFICATIONS
  //
  // For assistant and customer, read their
  // own notifications feed.
  // ==========================================

  const loadUserNotifications = async () => {

    try {

      const data = await apiRequest(
        "/notifications"
      );

      setUserNotifications(
        data.notifications || []
      );

    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
    }
  };


  // ==========================================
  // LOAD (ROLE AWARE)
  // ==========================================

  const loadNotifications = () => {

    if (!user) {
      return;
    }

    if (isOwner) {
      loadOwnerAlerts();
    } else {
      loadUserNotifications();
    }
  };


  useEffect(() => {
    loadNotifications();

    // Poll every 30 seconds so
    // the badge stays current.
    const interval = setInterval(
      loadNotifications,
      30000
    );

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  // ==========================================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);


  // ==========================================
  // LOAD SEEN IDS (PER USER)
  // ==========================================

  useEffect(() => {
    if (!seenStorageKey) {
      setSeenIds([]);
      return;
    }

    try {
      const stored = localStorage.getItem(
        seenStorageKey
      );

      setSeenIds(
        stored ? JSON.parse(stored) : []
      );
    } catch {
      setSeenIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seenStorageKey]);


  // ==========================================
  // MARK ALL LOADED NOTIFICATIONS AS SEEN
  // ==========================================

  const markAllSeen = () => {
    if (!seenStorageKey) {
      return;
    }

    const allIds = userNotifications.map(
      (notification) =>
        notification.notificationId
    );

    setSeenIds(allIds);

    try {
      localStorage.setItem(
        seenStorageKey,
        JSON.stringify(allIds)
      );
    } catch {
      // Ignore storage errors.
    }
  };


  // While the dropdown is open, keep marking
  // loaded notifications as seen (covers any
  // that arrive from the async refresh).
  useEffect(() => {
    if (dropdownOpen && !isOwner) {
      markAllSeen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownOpen, userNotifications]);


  // ==========================================
  // HANDLE BELL CLICK
  // ==========================================

  const toggleDropdown = () => {
    if (!dropdownOpen) {
      loadNotifications();
    }

    setDropdownOpen(
      (previous) => !previous
    );
  };


  // ==========================================
  // NAVIGATION HELPERS
  // ==========================================

  const goToOrders = () => {
    setDropdownOpen(false);
    navigate("/orders");
  };

  const goToNotifications = () => {
    setDropdownOpen(false);
    navigate("/notifications");
  };


  // ==========================================
  // COUNT (ROLE AWARE)
  // ==========================================

  const unreadCount =
    userNotifications.filter(
      (notification) =>
        !seenIds.includes(
          notification.notificationId
        )
    ).length;

  const notifCount = isOwner
    ? ownerAlerts.length
    : unreadCount;


  // ==========================================
  // RENDER
  // ==========================================

  return (
    <header className="navbar">

      <div className="navbar-brand">
        <span className="brand-icon">🏪</span>
        <span>DokanSathi</span>
      </div>

      <div className="navbar-actions">

        <button
          className="theme-button"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>


        {/* ===================================
            NOTIFICATION BELL
        =================================== */}

        <div
          className="notification-wrapper"
          ref={dropdownRef}
        >

          <button
            className="notification-button"
            onClick={toggleDropdown}
            title={
              notifCount > 0
                ? `You have ${notifCount} notification${
                    notifCount !== 1
                      ? "s"
                      : ""
                  }`
                : "Notifications"
            }
          >
            🔔

            {user && notifCount > 0 && (
              <span className="notification-badge">
                {notifCount}
              </span>
            )}

          </button>


          {dropdownOpen && user && (

            <div className="notification-dropdown">

              <div className="notification-dropdown-header">
                <strong>
                  Notifications
                </strong>
              </div>


              {/* ---------------------------
                  OWNER: prep-done alerts
              --------------------------- */}

              {isOwner ? (

                ownerAlerts.length === 0 ? (

                  <div className="notification-dropdown-empty">
                    No orders ready right now.
                  </div>

                ) : (

                  ownerAlerts.map((order) => (

                    <div
                      key={order.orderId}
                      className="notification-dropdown-item"
                      onClick={goToOrders}
                    >

                      <span>
                        ✅
                      </span>

                      <div>

                        <p className="notification-dropdown-title">
                          Order #
                          {order.orderId.slice(
                            0,
                            8
                          )}{" "}
                          — Prep done
                        </p>

                        <p className="notification-dropdown-subtitle">
                          ₹
                          {order.totalAmount}
                          {" · "}
                          {order.customer
                            ?.name ||
                            "Customer"}
                          {" · Mark ready →"}
                        </p>

                      </div>

                    </div>

                  ))

                )

              ) : (

                /* ---------------------------
                   ASSISTANT / CUSTOMER:
                   notification feed
                --------------------------- */

                userNotifications.length ===
                0 ? (

                  <div className="notification-dropdown-empty">
                    No notifications yet.
                  </div>

                ) : (

                  <>

                    {userNotifications
                      .slice(0, 8)
                      .map((notification) => (

                        <div
                          key={
                            notification.notificationId
                          }
                          className="notification-dropdown-item"
                          onClick={
                            goToNotifications
                          }
                        >

                          <span>
                            🔔
                          </span>

                          <div>

                            <p className="notification-dropdown-title">
                              {
                                notification.message
                              }
                            </p>

                            <p className="notification-dropdown-subtitle">
                              {notification.sentAt
                                ? new Date(
                                    notification.sentAt
                                  ).toLocaleString()
                                : ""}
                            </p>

                          </div>

                        </div>

                      ))}

                  </>

                )

              )}

            </div>

          )}

        </div>


        {user && (
          <div className="user-menu">
            <span>{user.name}</span>
            <span>▼</span>
          </div>
        )}

        {user && (
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}

      </div>
    </header>
  );
}

export default Navbar;
