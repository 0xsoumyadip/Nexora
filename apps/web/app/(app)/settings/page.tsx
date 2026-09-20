import { ThemeToggle } from "@/components/theme-toggle";
export default function Page() {
  return (
    <div className="app-content settings">
      <div className="page-title">
        <div>
          <h1>Settings</h1>
          <p>Manage your personal preferences.</p>
        </div>
      </div>
      <div className="tabs">
        <button className="active" type="button">
          Profile
        </button>
        <button type="button">Appearance</button>
        <button type="button">Notifications</button>
      </div>
      <div>
        <h2>Profile</h2>
        <p className="muted">
          This is a UI-only settings placeholder, ready for your account data.
        </p>
        <ThemeToggle />
      </div>
    </div>
  );
}
