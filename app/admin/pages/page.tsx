export const dynamic = "force-dynamic";

export default function AdminStaticPagesPage() {
  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1>Static Pages</h1>
        <p>Manage custom static pages (About, Privacy, etc.)</p>
      </div>
      <div className="admin-card">
        <div className="p-8 text-center text-gray-500">
          <p className="text-lg font-medium">Coming Soon</p>
          <p className="text-sm mt-1">Static page management will be available in a future update.</p>
        </div>
      </div>
    </div>
  );
}