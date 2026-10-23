import { useState, useEffect } from "react";
import type { ApiSettingsProps } from "../types";

const STORAGE_KEY = "greenapi_settings";

export default function ApiSettings({ activeSetting }: ApiSettingsProps) {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { idInstance: id, apiTokenInstance: token } = JSON.parse(saved);
      setIdInstance(id);
      setApiTokenInstance(token);
    }
  }, []);

  const handleSave = () => {
    const id = Number(idInstance);
    if (!id || !apiTokenInstance) {
      alert("Заполните оба поля");
      return;
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ idInstance: id, apiTokenInstance }),
    );
    setHasChanges(false);
  };

  if (activeSetting !== "api") return null;

  return (
    <div className="api-settings">
      <div className="api-settings-header">
        <h2>Настройки API</h2>
      </div>
      <div className="api-settings-body">
        <div className="form-group">
          <label>idInstance</label>
          <input
            type="number"
            value={idInstance}
            onChange={(e) => {
              setIdInstance(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Например: 1100123456"
          />
        </div>
        <div className="form-group">
          <label>apiTokenInstance</label>
          <input
            type="text"
            value={apiTokenInstance}
            onChange={(e) => {
              setApiTokenInstance(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Ваш токен"
          />
        </div>
        {hasChanges && (
          <button className="btn-save" onClick={handleSave}>
            Сохранить
          </button>
        )}
      </div>
    </div>
  );
}
