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


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
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

      </Routes>

    </BrowserRouter>
  );
}

export default App;