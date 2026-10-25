import { useState, useEffect } from "react";
import axios from "axios";

const STORAGE_KEY_API = "greenapi_settings";
const API_URL = "https://api.green-api.com";

export default function ApiSettings({
  activeSetting,
}: {
  activeSetting: string;
}) {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [loading, setLoading] = useState(false);

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
    alert("Настройки сохранены");
  };

  const handleEnableIncoming = async () => {
    const id = Number(idInstance);
    if (!id || !apiTokenInstance) {
      alert("Сначала настройте API в настройках");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/waInstance${id}/setSettings/${apiTokenInstance}`,
        {
          webhookUrl: "",
          incomingWebhook: "yes",
          outgoingWebhook: "yes",
          stateWebhook: "yes",
        },
      );
      alert(
        "Прием входящих сообщений включен. Рекомендуется перезапустить инстанс в личном кабинете GREEN-API",
      );
    } catch {
      alert("Ошибка при включении приема входящих");
    } finally {
      setLoading(false);
    }
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
          />
        </div>
        <div className="form-group">
          <label>apiTokenInstance</label>
          <input
            type="text"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
          />
        </div>
        <button className="btn-save" onClick={handleSave}>
          Сохранить
        </button>
        <button
          className="btn-save"
          onClick={handleEnableIncoming}
          disabled={loading}
        >
          {loading ? "Загрузка..." : "Включить прием входящих сообщений"}
        </button>
      </div>
    </div>
  );
}
