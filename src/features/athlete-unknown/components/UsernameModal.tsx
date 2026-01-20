import React, { useState, useEffect } from "react";
import "./UsernameModal.css";
import { validateUsername } from "@/features/athlete-unknown/utils";
import { athleteUnknownApiService } from "@/features/athlete-unknown/services/api";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  onUsernameUpdated: (newUsername: string) => void;
}

function UsernameModal({
  isOpen,
  onClose,
  currentUsername,
  onUsernameUpdated,
}: UsernameModalProps): React.ReactElement | null {
  const [username, setUsername] = useState(currentUsername);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername);
      setValidationError(null);
      setApiError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, currentUsername]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    setValidationError(null);
    setApiError(null);
    setSuccessMessage(null);

    // Real-time validation
    const error = validateUsername(newUsername);
    if (error) {
      setValidationError(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before submitting
    const error = validateUsername(username);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const response = await athleteUnknownApiService.updateUsername(
        username.trim()
      );
      setSuccessMessage("Username updated successfully!");
      onUsernameUpdated(response.userName);

      // Close modal after short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Failed to update username:", error);
      setApiError(
        error?.message || "Failed to update username. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setUsername(currentUsername);
    setValidationError(null);
    setApiError(null);
    setSuccessMessage(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const isValid = !validationError && username.trim() !== currentUsername;

  return (
    <div className="username-modal-overlay" onClick={handleCancel}>
      <div
        className="username-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-username-button" onClick={handleCancel}>
          ×
        </button>

        <h2 className="username-modal-title">Update Username</h2>

        <form onSubmit={handleSubmit} className="username-form">
          <div className="form-group">
            <label htmlFor="username" className="username-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className={`username-input ${validationError ? "error" : ""}`}
              placeholder="Enter your username"
              maxLength={20}
              disabled={isSubmitting}
            />
            <div className="username-requirements">
              <p>Requirements:</p>
              <ul>
                <li>3-20 characters</li>
                <li>Letters, numbers, and spaces only</li>
                <li>No consecutive spaces</li>
                <li>No inappropriate content</li>
              </ul>
            </div>
          </div>

          {validationError && (
            <div className="validation-error">{validationError}</div>
          )}

          {apiError && <div className="api-error">{apiError}</div>}

          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <div className="button-group">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { UsernameModal };
