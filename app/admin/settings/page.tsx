import { getSettings } from "./action";
import SettingsManager from "./SettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1>Site Settings</h1>
        <p>Manage site name, description, and favicon</p>
      </div>

      <SettingsManager settings={settings} />
    </div>
  );
}
