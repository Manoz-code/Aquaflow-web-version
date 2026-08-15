import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  updateProfile,
  changePassword,
  uploadProfileImage,
} from "../services/api";
import "./Profile.css";

const Profile = () => {
  const { user, token, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [profileMessage, setProfileMessage] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [profileError, setProfileError] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

    const [uploadingImage, setUploadingImage] =
  useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (!name.trim()) {
      setProfileError("Name cannot be empty");
      return;
    }

    try {
      setSavingProfile(true);

      const data = await updateProfile(
        token,
        name
      );

      updateUser(data.user);

      setProfileMessage(
        "Profile updated successfully"
      );
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields"
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match"
      );
      return;
    }

    try {
      setChangingPassword(true);

      const data = await changePassword(
        token,
        currentPassword,
        newPassword
      );

      setPasswordMessage(data.message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleImageUpload = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setUploadingImage(true);
  setProfileError("");
  setProfileMessage("");

  try {
    const data = await uploadProfileImage(
      token,
      file
    );

    updateUser(data.user);

    setProfileMessage(
      "Profile image updated successfully"
    );
  } catch (error) {
    setProfileError(error.message);
  } finally {
    setUploadingImage(false);
  }
};

  return (
    <DashboardLayout>
      <div className="profile-page">

        <div className="profile-heading">
          <div>
            <h2>My Profile</h2>
            <p>
              Manage your account information and
              password.
            </p>
          </div>
        </div>

        <div className="profile-grid">

          {/* PROFILE INFORMATION */}

          <div className="profile-card">

            <div className="profile-card-header">
              <h3>Profile Information</h3>
              <span>
                {user?.role === "admin"
                  ? "Administrator"
                  : "Staff"}
              </span>
            </div>

         <div className="profile-avatar-section">

  <div className="profile-avatar">

    {user?.profile_image ? (
      <img
        src={`http://localhost:3000${user.profile_image}`}
        alt={user.name}
      />
    ) : (
      <div className="avatar-placeholder">
        {user?.name
          ?.charAt(0)
          .toUpperCase()}
      </div>
    )}

  </div>

  <label className="upload-button">
    {uploadingImage
      ? "Uploading..."
      : "Upload Profile Photo"}

    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={handleImageUpload}
      disabled={uploadingImage}
      hidden
    />
  </label>

  <p className="image-hint">
    JPG, PNG or WEBP · Maximum 5 MB
  </p>

</div>

            <form
              onSubmit={handleProfileSubmit}
              className="profile-form"
            >

              <label>
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
              />

              <label>
                Phone Number
              </label>

              <input
                type="text"
                value={user?.phone || ""}
                disabled
              />

              <label>
                Role
              </label>

              <input
                type="text"
                value={
                  user?.role === "admin"
                    ? "Administrator"
                    : "Staff"
                }
                disabled
              />

              {profileError && (
                <p className="profile-error">
                  {profileError}
                </p>
              )}

              {profileMessage && (
                <p className="profile-success">
                  {profileMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={savingProfile}
              >
                {savingProfile
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </form>

          </div>


          {/* CHANGE PASSWORD */}

          <div className="profile-card">

            <div className="profile-card-header">
              <h3>Change Password</h3>
            </div>

            <form
              onSubmit={handlePasswordSubmit}
              className="profile-form"
            >

              <label>
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                placeholder="Enter current password"
              />

              <label>
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Enter new password"
              />

              <label>
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm new password"
              />

              {passwordError && (
                <p className="profile-error">
                  {passwordError}
                </p>
              )}

              {passwordMessage && (
                <p className="profile-success">
                  {passwordMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={changingPassword}
              >
                {changingPassword
                  ? "Changing..."
                  : "Change Password"}
              </button>

            </form>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Profile;