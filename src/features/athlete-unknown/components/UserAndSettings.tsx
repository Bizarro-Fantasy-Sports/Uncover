import TestUnknownPerson from "@/features/athlete-unknown/assets/test-unknown-person.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";

interface UserAndSettingsProps {
  onStatsClick: () => void;
}

export function UserAndSettings({
  onStatsClick,
}: UserAndSettingsProps): React.ReactElement {
  return (
    <div className="au-user-settings-container flex-row">
      <div className="au-user-identity-container">
        <button className="au-user-identity-button" onClick={onStatsClick}>
          <img src={TestUnknownPerson} alt="profile-image" />
        </button>
      </div>
      <div className="au-settings-container">
        <button
          className="au-settings-button"
          onClick={() => console.log("OPEN SETTINGS!!!!!!")}
        >
          <FontAwesomeIcon icon={faGear} className="au-settings-icon" />
        </button>
      </div>
    </div>
  );
}
