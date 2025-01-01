export default function SubscriptionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Subscriptions</h1>
      <div className="grid gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Active Subscriptions</h2>
            <button className="text-sm text-primary">Add New</button>
          </div>
          {/* Add subscriptions list here */}
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-semibold mb-4">Upcoming Payments</h2>
          {/* Add upcoming payments list here */}
        </div>
      </div>
    </div>
  )
} 