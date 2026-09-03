import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";


function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [assistants, setAssistants] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] =
    useState(false);
  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedOrderId, setSelectedOrderId] =
    useState("");
  const [
    selectedAssistantId,
    setSelectedAssistantId,
  ] = useState("");


  // ==========================================
  // LOAD DATA
  // ==========================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        tasksData,
        ordersData,
        assistantsData,
      ] = await Promise.all([
        apiRequest("/tasks"),
        apiRequest("/orders/shop"),
        apiRequest("/users/assistants"),
      ]);

      setTasks(tasksData.tasks || []);
      setOrders(ordersData.orders || []);
      setAssistants(
        assistantsData.assistants || []
      );

    } catch (error) {
      console.error(
        "Failed to load tasks data:",
        error
      );

      setError(
        error.message ||
          "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  // ==========================================
  // ORDERS ELIGIBLE FOR ASSIGNMENT
  //
  // Only orders the owner is actively
  // processing (in-progress) and that do
  // not already have a task should be
  // assignable.
  // ==========================================

  const assignedOrderIds = new Set(
    tasks.map(
      (task) => task.order?.orderId
    )
  );

  const assignableOrders = orders.filter(
    (order) =>
      order.status === "in-progress" &&
      !assignedOrderIds.has(order.orderId)
  );


  // ==========================================
  // ASSIGN TASK
  // ==========================================

  const assignTask = async (event) => {
    event.preventDefault();

    if (
      !selectedOrderId ||
      !selectedAssistantId
    ) {
      setError(
        "Please select both an order and an assistant."
      );
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccess("");

      await apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify({
          orderId: selectedOrderId,
          assistantId:
            selectedAssistantId,
        }),
      });

      setSuccess(
        "Task assigned successfully."
      );

      setSelectedOrderId("");
      setSelectedAssistantId("");

      await loadData();

    } catch (error) {
      console.error(
        "Failed to assign task:",
        error
      );

      setError(
        error.message ||
          "Failed to assign task"
      );
    } finally {
      setAssigning(false);
    }
  };


  // ==========================================
  // DELETE TASK
  // ==========================================

  const deleteTask = async (taskId) => {

    const confirmed = window.confirm(
      "Remove this task assignment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(taskId);
      setError("");
      setSuccess("");

      await apiRequest(
        `/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      setSuccess("Task removed.");

      await loadData();

    } catch (error) {
      console.error(
        "Failed to delete task:",
        error
      );

      setError(
        error.message ||
          "Failed to delete task"
      );
    } finally {
      setDeletingId(null);
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
            Tasks
          </h1>

          <p>
            Assign orders you're processing to
            your assistants and track their
            progress.
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
          ASSIGN TASK
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Assign a Task
          </h2>

          <button
            onClick={loadData}
            className="secondary-button"
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "Refresh"}
          </button>

        </div>


        {assistants.length === 0 ? (

          <p>
            You have no assistants yet. Add
            assistants from the Users page
            first.
          </p>

        ) : assignableOrders.length === 0 ? (

          <p>
            No orders are ready to assign.
            Start processing a pending order
            from the Orders page first
            (in-progress orders without a task
            appear here).
          </p>

        ) : (

          <form onSubmit={assignTask}>

            <div className="form-group">

              <label>
                Order
              </label>

              <select
                value={selectedOrderId}
                onChange={(event) =>
                  setSelectedOrderId(
                    event.target.value
                  )
                }
                required
              >

                <option value="">
                  Select an order
                </option>

                {assignableOrders.map(
                  (order) => (

                    <option
                      key={order.orderId}
                      value={order.orderId}
                    >
                      Order #
                      {order.orderId.slice(
                        0,
                        8
                      )}{" "}
                      — ₹
                      {order.totalAmount}{" "}
                      ({order.customer?.name ||
                        "Customer"})
                    </option>

                  )
                )}

              </select>

            </div>


            <div className="form-group">

              <label>
                Assistant
              </label>

              <select
                value={
                  selectedAssistantId
                }
                onChange={(event) =>
                  setSelectedAssistantId(
                    event.target.value
                  )
                }
                required
              >

                <option value="">
                  Select an assistant
                </option>

                {assistants.map(
                  (assistant) => (

                    <option
                      key={
                        assistant.userId
                      }
                      value={
                        assistant.userId
                      }
                    >
                      {assistant.name} (
                      {assistant.email})
                    </option>

                  )
                )}

              </select>

            </div>


            <button
              type="submit"
              className="primary-button"
              disabled={assigning}
            >
              {assigning
                ? "Assigning..."
                : "Assign Task"}
            </button>

          </form>

        )}

      </div>


      {/* =====================================
          TASK LIST
      ===================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            All Tasks
          </h2>

          <span>
            {tasks.length} task
            {tasks.length !== 1 ? "s" : ""}
          </span>

        </div>


        {loading ? (

          <p>
            Loading tasks...
          </p>

        ) : tasks.length === 0 ? (

          <p>
            No tasks assigned yet.
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
                      Assistant:{" "}
                      <strong>
                        {task.assistant
                          ?.name ||
                          "Unknown"}
                      </strong>
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
                      Assigned:
                    </strong>{" "}
                    {task.assignedAt
                      ? new Date(
                          task.assignedAt
                        ).toLocaleString()
                      : "—"}
                  </p>

                </div>


                <div className="quick-actions">

                  <button
                    onClick={() =>
                      deleteTask(
                        task.taskId
                      )
                    }
                    className="secondary-button"
                    disabled={
                      deletingId ===
                      task.taskId
                    }
                  >
                    {deletingId ===
                    task.taskId
                      ? "Removing..."
                      : "Remove Task"}
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Tasks;
