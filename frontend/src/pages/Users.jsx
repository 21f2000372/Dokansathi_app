import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function Users() {
  // =========================
  // USERS
  // =========================

  const [assistants, setAssistants] = useState([]);
  const [customers, setCustomers] = useState([]);

  // =========================
  // PAGE STATE
  // =========================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // MODAL STATE
  // =========================

  // null
  // "assistant"
  // "customer"
  const [modalType, setModalType] = useState(null);

  // null when adding
  // user object when editing
  const [editingUser, setEditingUser] = useState(null);

  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null); // { user, role }
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // =========================
  // FORM
  // =========================

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  // =========================
  // LOAD USERS
  // =========================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const [assistantData, customerData] =
        await Promise.all([
          apiRequest("/users/assistants"),
          apiRequest("/users/customers"),
        ]);

      setAssistants(
        assistantData.assistants || []
      );

      setCustomers(
        customerData.customers || []
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================
  // ADD USER
  // =========================

  const handleAdd = (role) => {
    setEditingUser(null);

    setFormData({
      name: "",
      phone: "",
      email: "",
      password: "",
    });

    setError("");

    setModalType(role);
  };

  // =========================
  // EDIT USER
  // =========================

  const handleEdit = (user, role) => {
    setEditingUser({
      ...user,
      role,
    });

    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      password: "",
    });

    setError("");

    setModalType(role);
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const closeModal = () => {
    setModalType(null);
    setEditingUser(null);

    setFormData({
      name: "",
      phone: "",
      email: "",
      password: "",
    });
  };

  // =========================
  // CREATE / UPDATE USER
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const isEditing =
        editingUser !== null;

      let endpoint;
      let method;
      let body;

      // =========================
      // ASSISTANT
      // =========================

      if (modalType === "assistant") {
        endpoint = isEditing
          ? `/users/assistants/${editingUser.userId}`
          : "/users/assistants";
      }

      // =========================
      // CUSTOMER
      // =========================

      if (modalType === "customer") {
        endpoint = isEditing
          ? `/users/customers/${editingUser.userId}`
          : "/users/customers";
      }

      method = isEditing ? "PUT" : "POST";

      // Password is required only when creating
      if (isEditing) {
        body = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
        };
      } else {
        body = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
        };
      }

      await apiRequest(endpoint, {
        method,
        body: JSON.stringify(body),
      });

      closeModal();

      await loadUsers();
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Failed to save user"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DEACTIVATE USER
  // =========================

    // =========================
  // TOGGLE STATUS (DEACTIVATE / REACTIVATE)
  // =========================

  const handleToggleStatus = async (user, role) => {
    const isActive = user.availabilityStatus === "active";

    const confirmed = window.confirm(
      isActive
        ? `Are you sure you want to deactivate ${user.name}?`
        : `Reactivate ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const basePath =
        role === "assistant"
          ? "/users/assistants"
          : "/users/customers";

      const endpoint = isActive
        ? `${basePath}/${user.userId}`
        : `${basePath}/${user.userId}/reactivate`;

      await apiRequest(endpoint, {
        method: isActive ? "DELETE" : "PATCH",
      });

      await loadUsers();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          `Failed to ${isActive ? "deactivate" : "reactivate"} user`
      );
    }
  };

    // =========================
  // OPEN / CLOSE PERMANENT DELETE MODAL
  // =========================

  const openDeleteModal = (user, role) => {
    setDeleteTarget({ user, role });
    setDeleteConfirmText("");
    setError("");
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteConfirmText("");
  };

  // =========================
  // PERMANENT DELETE
  // =========================

  const handlePermanentDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const { user, role } = deleteTarget;

    if (deleteConfirmText.trim() !== user.name) {
      setError("Name does not match. Deletion cancelled.");
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const basePath =
        role === "assistant"
          ? "/users/assistants"
          : "/users/customers";

      await apiRequest(`${basePath}/${user.userId}/permanent`, {
        method: "DELETE",
      });

      closeDeleteModal();

      await loadUsers();
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Failed to permanently delete user"
      );
    } finally {
      setDeleting(false);
    }
  };
  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="page-header">
        <h1>Users</h1>
        <p>Loading users...</p>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="users-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-header">
        <div>
          <h1>Users</h1>

          <p>
            Manage assistants and customers
          </p>
        </div>
      </div>

      {/* =========================
          ERROR MESSAGE
      ========================= */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* =========================
          ASSISTANTS
      ========================= */}

      <section className="users-section">

        <div className="section-header">

          <div>
            <h2>Assistants</h2>

            <p>
              {assistants.length} assistant
              {assistants.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              handleAdd("assistant")
            }
          >
            + Add Assistant
          </button>

        </div>

        {assistants.length === 0 ? (
          <div className="empty-state">
            No assistants found.
          </div>
        ) : (
          <div className="user-list">

            {assistants.map((assistant) => (

              <div
                className="user-card"
                key={assistant.userId}
              >

                {/* USER INFORMATION */}

                <div className="user-info">

                  <h3>
                    {assistant.name}
                  </h3>

                  <p>
                    {assistant.email}
                  </p>

                  <p>
                    {assistant.phone}
                  </p>

                </div>

                {/* USER ACTIONS */}

                <div className="user-actions">

                  <span className="user-role">
                    Assistant
                  </span>

                  <span
                    className={
                      assistant.availabilityStatus ===
                      "active"
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {assistant.availabilityStatus ===
                    "active"
                      ? "Active"
                      : "Inactive"}
                  </span>

                  <button
                    type="button"
                    className="edit-button"
                    onClick={() =>
                      handleEdit(
                        assistant,
                        "assistant"
                      )
                    }
                  >
                    Edit
                  </button>

                 {/* <button
                    type="button"
                    className={
                      assistant.availabilityStatus === "active"
                        ? "danger-button"
                        : "success-button"
                    }
                    onClick={() =>
                      handleToggleStatus(assistant, "assistant")
                    }
                  >
                    {assistant.availabilityStatus === "active"
                      ? "Deactivate"
                      : "Reactivate"}
                  </button> */}
                  <button
                    type="button"
                    className={
                      assistant.availabilityStatus === "active"
                        ? "danger-button"
                        : "success-button"
                    }
                    onClick={() =>
                      handleToggleStatus(assistant, "assistant")
                    }
                  >
                    {assistant.availabilityStatus === "active"
                      ? "Deactivate"
                      : "Reactivate"}
                  </button>

                  {assistant.availabilityStatus === "inactive" && (
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() =>
                        openDeleteModal(assistant, "assistant")
                      }
                    >
                      Delete Permanently
                    </button>
                  )}

                

                </div>

              </div>

            ))}

          </div>
        )}

      </section>

      {/* =========================
          CUSTOMERS
      ========================= */}

      <section className="users-section">

        <div className="section-header">

          <div>
            <h2>Customers</h2>

            <p>
              {customers.length} customer
              {customers.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              handleAdd("customer")
            }
          >
            + Add Customer
          </button>

        </div>

        {customers.length === 0 ? (
          <div className="empty-state">
            No customers found.
          </div>
        ) : (
          <div className="user-list">

            {customers.map((customer) => (

              <div
                className="user-card"
                key={customer.userId}
              >

                {/* USER INFORMATION */}

                <div className="user-info">

                  <h3>
                    {customer.name}
                  </h3>

                  <p>
                    {customer.email}
                  </p>

                  <p>
                    {customer.phone}
                  </p>

                </div>

                {/* USER ACTIONS */}

                <div className="user-actions">

                  <span className="user-role">
                    Customer
                  </span>

                  <span
                    className={
                      customer.availabilityStatus ===
                      "active"
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {customer.availabilityStatus ===
                    "active"
                      ? "Active"
                      : "Inactive"}
                  </span>

                  <button
                    type="button"
                    className="edit-button"
                    onClick={() =>
                      handleEdit(
                        customer,
                        "customer"
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className={
                      customer.availabilityStatus === "active"
                        ? "danger-button"
                        : "success-button"
                    }
                    onClick={() =>
                      handleToggleStatus(customer, "customer")
                    }
                  >
                    {customer.availabilityStatus === "active"
                      ? "Deactivate"
                      : "Reactivate"}
                  </button>

                  {/* <button
                    type="button"
                    className={
                      customer.availabilityStatus === "active"
                        ? "danger-button"
                        : "success-button"
                    }
                    onClick={() =>
                      handleToggleStatus(customer, "customer")
                    }
                  >
                    {customer.availabilityStatus === "active"
                      ? "Deactivate"
                      : "Reactivate"}
                  </button> */}

                  {customer.availabilityStatus === "inactive" && (
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() =>
                        openDeleteModal(customer, "customer")
                      }
                    >
                      Delete Permanently
                    </button>
                  )}

                

                </div>

              </div>

            ))}

          </div>
        )}

      </section>

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {modalType && (

        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <h2>
                  {editingUser
                    ? "Edit"
                    : "Add"}{" "}

                  {modalType === "assistant"
                    ? "Assistant"
                    : "Customer"}
                </h2>

                <p>
                  {editingUser
                    ? "Update user information"
                    : "Create a new user account"}
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
            >

              {/* NAME */}

              <div className="form-group">

                <label>
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />

              </div>

              {/* PHONE */}

              <div className="form-group">

                <label>
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />

              </div>

              {/* EMAIL */}

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />

              </div>

              {/* PASSWORD */}

              {!editingUser && (

                <div className="form-group">

                  <label>
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    required
                  />

                </div>

              )}

              {/* MODAL ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Save Changes"
                    : `Create ${
                        modalType ===
                        "assistant"
                          ? "Assistant"
                          : "Customer"
                      }`}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================
          PERMANENT DELETE MODAL
      ========================= */}

      {deleteTarget && (

        <div
          className="modal-overlay"
          onClick={closeDeleteModal}
        >

          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>Delete Permanently</h2>

                <p>
                  This cannot be undone. All data for{" "}
                  <strong>{deleteTarget.user.name}</strong> will be
                  permanently removed.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeDeleteModal}
              >
                ×
              </button>

            </div>

            <div className="form-group">

              <label>
                Type <strong>{deleteTarget.user.name}</strong> to confirm
              </label>

              <input
                type="text"
                value={deleteConfirmText}
                onChange={(event) =>
                  setDeleteConfirmText(event.target.value)
                }
                placeholder="Enter name to confirm"
              />

            </div>

            <div className="modal-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handlePermanentDelete}
                disabled={
                  deleting ||
                  deleteConfirmText.trim() !== deleteTarget.user.name
                }
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Users;