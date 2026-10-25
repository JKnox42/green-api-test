import { useState, useEffect } from "react";

const STORAGE_KEY_API = "greenapi_settings";

export default function ApiSettings({ activeSetting }: { activeSetting: string }) {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_API);
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
      STORAGE_KEY_API,
      JSON.stringify({ idInstance: id, apiTokenInstance }),
    );
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
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="Например: 1100123456"
          />
        </div>
        <div className="form-group">
          <label>apiTokenInstance</label>
          <input
            type="text"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="Ваш токен"
          />
        </div>
        <button className="btn-save" onClick={handleSave}>
          Сохранить
        </button>
      </div>
    </div>
  );
}
