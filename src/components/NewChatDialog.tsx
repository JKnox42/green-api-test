import { useState } from "react";
import type { NewChatDialogProps } from "../types";

export default function NewChatDialog({
  isOpen,
  onClose,
  onCreate,
}: NewChatDialogProps) {
  const [phone, setPhone] = useState("");

  const handleCreate = () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 11) {
      alert("Введите корректный номер телефона");
      return;
    }
    onCreate(cleaned);
    setPhone("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Новый чат</h2>
        <div className="form-group">
          <label>Номер телефона</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="79XXXXXXXXXX"
          />
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Отмена</button>
          <button onClick={handleCreate}>Создать</button>
        </div>
      </div>
    </div>
  );
}
