function Home() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to DokanSathi</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <span>Total Orders</span>
          <strong>0</strong>
        </div>

        <div className="dashboard-card">
          <span>Products</span>
          <strong>0</strong>
        </div>

        <div className="dashboard-card">
          <span>Pending Tasks</span>
          <strong>0</strong>
        </div>

        <div className="dashboard-card">
          <span>Revenue</span>
          <strong>₹0</strong>
        </div>
      </div>
    </div>
  );
}

export default Home;