export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Monthly Expenses</h2>
          <p className="text-2xl font-bold">$0.00</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Active Subscriptions</h2>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Missing Receipts</h2>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Total Savings</h2>
          <p className="text-2xl font-bold">$0.00</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-semibold mb-4">Expense Trends</h2>
          {/* Add expense chart here */}
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          {/* Add activity feed here */}
        </div>
      </div>
    </div>
  )
} 