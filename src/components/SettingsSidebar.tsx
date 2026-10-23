import type { SettingsSidebarProps } from "../types";

export default function SettingsSidebar({
  activeSetting,
  onSelect,
}: SettingsSidebarProps) {
  const settings = [{ id: "api", label: "Настройки API" }];

  return (
    <div className="settings-sidebar">
      <div className="settings-sidebar-header">
        <h2>Настройки</h2>
      </div>
      {settings.map((s) => (
        <button
          key={s.id}
          className={`settings-sidebar-item ${activeSetting === s.id ? "active" : ""}`}
          onClick={() => onSelect(s.id)}
        >
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  );
}
