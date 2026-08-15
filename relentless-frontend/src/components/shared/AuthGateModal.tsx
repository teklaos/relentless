"use client";

import Modal from "@/components/shared/ui/Modal";

interface AuthGateModalProps {
  action: "save" | "book";
  onClose: () => void;
  onContinue: (mode: "login" | "register") => void;
}

export default function AuthGateModal({ action, onClose, onContinue }: AuthGateModalProps) {
  const title = action === "book" ? "Log in to book this space" : "Log in to save spaces";

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={() => onContinue("login")}>
            LOG IN
          </button>
          <button className="btn accent" onClick={() => onContinue("register")}>
            SIGN UP
          </button>
        </>
      }
    >
      <p>Free to join — save spaces and book by the hour.</p>
    </Modal>
  );
}
