import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Layout from "./components/Layout";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import OwnerDashboard from "./pages/OwnerDashboard";
import AssistantDashboard from "./pages/AssistantDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import CustomerProducts from "./pages/CustomerProducts";
import CustomerOrders from "./pages/CustomerOrders";
import Tasks from "./pages/Tasks";
import Notifications from "./pages/Notifications";
import AssistantInventory from "./pages/AssistantInventory";
import Queue from "./pages/Queue";
import Billing from "./pages/Billing";
import Payments from "./pages/Payments";
import Performance from "./pages/Performance";
import Reviews from "./pages/Reviews";




function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  return children;
}


/*
 * PublicOnlyRoute
 *
 * For pages that should only be seen by
 * logged-out visitors (Login, Register).
 * A user who is already logged in is sent
 * to their role's dashboard, so an assistant
 * or customer can never reach the "Create
 * Shop" (register) page.
 */
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    const dashboardPath =
      user.role === "shop_owner"
        ? "/owner-dashboard"
        : user.role === "assistant"
        ? "/assistant-dashboard"
        : user.role === "customer"
        ? "/customer-dashboard"
        : "/dashboard";

    return (
      <Navigate
        to={dashboardPath}
        replace
      />
    );
  }

  return children;
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* REGISTER */}

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />


        {/* LOGIN */}

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />


        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["shop_owner"]}
            >
              <Layout>
                <OwnerDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assistant-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["assistant"]}
            >
              <Layout>
                <AssistantDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["customer"]}
            >
              <Layout>
                <CustomerDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />




        {/* USERS */}

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["shop_owner"]}>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* HOME */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute
              allowedRoles={["shop_owner"]}
            >
              <Layout>
                <Orders />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute
              allowedRoles={["shop_owner"]}
            >
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute
              allowedRoles={["shop_owner"]}
            >
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute
              allowedRoles={["shop_owner"]}
            >
              <Layout>
                <Tasks />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/queue"
          element={
            <ProtectedRoute
              allowedRoles={["shop_owner"]}
            >
              <Layout>
                <Queue />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute
              allowedRoles={["shop_owner"]}
            >
              <Layout>
                <Billing />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute
              allowedRoles={["shop_owner"]}
            >
              <Layout>
                <Payments />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/performance"
          element={
            <ProtectedRoute
              allowedRoles={["shop_owner"]}
            >
              <Layout>
                <Performance />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reviews"
          element={
            <ProtectedRoute
              allowedRoles={["shop_owner"]}
            >
              <Layout>
                <Reviews />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assistant/inventory"
          element={
            <ProtectedRoute
              allowedRoles={["assistant"]}
            >
              <Layout>
                <AssistantInventory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/products"
          element={
            <ProtectedRoute
              allowedRoles={["customer"]}
            >
              <Layout>
                <CustomerProducts />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute
              allowedRoles={["customer"]}
            >
              <Layout>
                <CustomerOrders />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>

      

    </BrowserRouter>
  );
}

export default App;