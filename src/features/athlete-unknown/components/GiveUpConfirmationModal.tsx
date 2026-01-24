import { useCallback } from "react";

interface GiveUpConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function GiveUpConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
}: GiveUpConfirmationModalProps): React.ReactElement | null {
  const onConfirmClick = useCallback(() => {
    onConfirm();
    onCancel(); // make sure to close modal too
  }, [onConfirm, onCancel]);

  if (!isOpen) {
    return null;
  }
  return (
    <div className="au-giveup-modal-overlay" onClick={onCancel}>
      <div className="au-giveup-note" onClick={(e) => e.stopPropagation()}>
        <div className="au-giveup-note-content">
          <p className="au-giveup-note-text">
            This case has proven challenging.
            <br />
            Maybe it's best to move on...
          </p>
          <div className="au-giveup-note-buttons">
            <button
              className="au-giveup-btn au-giveup-btn-quit"
              onClick={onConfirmClick}
            >
              Drop the case
            </button>
            <button
              className="au-giveup-btn au-giveup-btn-retry"
              onClick={onCancel}
            >
              Let's try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
