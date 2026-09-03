import { useEffect, useState } from "react";

import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";


function AssistantDashboard() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ==========================================
  // LOAD MY TASKS
  // ==========================================

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        "/tasks/my"
      );

      setTasks(data.tasks || []);

    } catch (error) {
      console.error(
        "Failed to load tasks:",
        error
      );

      setError(
        error.message ||
          "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadTasks();
  }, []);


  // ==========================================
  // UPDATE TASK STATUS
  // ==========================================

  const updateStatus = async (
    taskId,
    status
  ) => {
    try {
      setUpdatingId(taskId);
      setError("");
      setSuccess("");

      await apiRequest(
        `/tasks/${taskId}/my-status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
          }),
        }
      );

      setSuccess(
        status === "in-progress"
          ? "Task started."
          : "Task marked completed."
      );

      await loadTasks();

    } catch (error) {
      console.error(
        "Failed to update task:",
        error
      );

      setError(
        error.message ||
          "Failed to update task"
      );
    } finally {
      setUpdatingId(null);
    }
  };


  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "assigned":
        return "status-pending";

      case "in-progress":
        return "status-progress";

      case "completed":
        return "status-completed";

      default:
        return "";
    }
  };


  // ==========================================
  // COUNTS
  // ==========================================

  const assignedCount = tasks.filter(
    (task) => task.status === "assigned"
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "completed"
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
            Assistant Dashboard
          </h1>

          <p>
            Welcome back,{" "}
            <strong>
              {user?.name}
            </strong>
            !
          </p>

          <p>
            Prepare the orders assigned to
            you.
          </p>

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
            📋
          </div>

          <h3>
            Assigned
          </h3>

          <p className="dashboard-card-number">
            {loading ? "..." : assignedCount}
          </p>

        </div>


        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            👨‍🍳
          </div>

          <h3>
            In Progress
          </h3>

          <p className="dashboard-card-number">
            {loading
              ? "..."
              : inProgressCount}
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
              : completedCount}
          </p>

        </div>

      </div>


      {/* =====================================
          TASKS
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            My Tasks
          </h2>

          <button
            onClick={loadTasks}
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
            Loading your tasks...
          </p>

        ) : tasks.length === 0 ? (

          <p>
            You have no tasks assigned yet.
          </p>

        ) : (

          <div className="orders-list">

            {tasks.map((task) => (

              <div
                key={task.taskId}
                className="dashboard-section"
                style={{
                  marginBottom: "15px",
                }}
              >

                {/* Task header */}

                <div className="section-header">

                  <div>

                    <h3>
                      Order #
                      {task.order?.orderId?.slice(
                        0,
                        8
                      ) || "N/A"}
                    </h3>

                    <p>
                      Assigned:{" "}
                      {task.assignedAt
                        ? new Date(
                            task.assignedAt
                          ).toLocaleString()
                        : "—"}
                    </p>

                  </div>


                  <span
                    className={getStatusClass(
                      task.status
                    )}
                  >
                    {task.status}
                  </span>

                </div>


                {/* Task / order info */}

                <div>

                  <p>
                    <strong>
                      Order Total:
                    </strong>{" "}
                    ₹
                    {task.order?.totalAmount ??
                      "—"}
                  </p>

                  <p>
                    <strong>
                      Order Status:
                    </strong>{" "}
                    {task.order?.status ||
                      "—"}
                  </p>

                  <p>
                    <strong>
                      Queue Position:
                    </strong>{" "}
                    {task.order
                      ?.queuePosition ??
                      "Not in queue"}
                  </p>

                </div>


                {/* Items to prepare */}

                <div>

                  <h4>
                    Items to Prepare
                  </h4>

                  {task.order?.items &&
                  task.order.items.length >
                    0 ? (

                    <div className="recent-users">

                      {task.order.items.map(
                        (item) => (

                          <div
                            key={
                              item.itemId
                            }
                            className="recent-user"
                          >

                            <div>

                              <strong>
                                {item.product
                                  ?.name ||
                                  "Product"}
                              </strong>

                              <p>
                                {item.product
                                  ?.category ||
                                  ""}
                              </p>

                            </div>


                            <div>

                              <strong>
                                ×{" "}
                                {
                                  item.quantity
                                }{" "}
                                {item.product
                                  ?.unit ||
                                  ""}
                              </strong>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <p>
                      No item details
                      available.
                    </p>

                  )}

                </div>


                {/* Actions */}

                <div className="quick-actions">

                  {task.status ===
                    "assigned" && (

                    <button
                      onClick={() =>
                        updateStatus(
                          task.taskId,
                          "in-progress"
                        )
                      }
                      className="primary-button"
                      disabled={
                        updatingId ===
                        task.taskId
                      }
                    >
                      {updatingId ===
                      task.taskId
                        ? "Starting..."
                        : "Start Task"}
                    </button>

                  )}


                  {task.status ===
                    "in-progress" && (

                    <button
                      onClick={() =>
                        updateStatus(
                          task.taskId,
                          "completed"
                        )
                      }
                      className="primary-button"
                      disabled={
                        updatingId ===
                        task.taskId
                      }
                    >
                      {updatingId ===
                      task.taskId
                        ? "Completing..."
                        : "Mark Completed"}
                    </button>

                  )}


                  {task.status ===
                    "completed" && (

                    <span>
                      Task done. Waiting for
                      the owner to mark the
                      order ready.
                    </span>

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

export default AssistantDashboard;
