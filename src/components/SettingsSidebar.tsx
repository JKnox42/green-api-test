export default function SettingsSidebar({
  activeSetting,
  onSelect,
}: {
  activeSetting: string;
  onSelect: (setting: string) => void;
}) {
  return (
    <div className="settings-sidebar">
      <div className="settings-sidebar-header">
        <h2>Настройки</h2>
      </div>
      <button
        className={`settings-sidebar-item ${activeSetting === "api" ? "active" : ""}`}
        onClick={() => onSelect("api")}
      >
        <span>Настройки API</span>
      </button>
    </div>
  );
}
