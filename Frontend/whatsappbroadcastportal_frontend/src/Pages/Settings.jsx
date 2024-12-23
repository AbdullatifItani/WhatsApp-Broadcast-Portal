import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../Apis/settingsApi";
import { useValidateSettingsMutation } from "../Apis/broadcastApi";
import { setSettings } from "../Storage/Redux/settingsSlice";
import { MainLoader } from "../Components/Page/Common";
import { withAuth } from "../HOC";

const Settings = () => {
  const dispatch = useDispatch();
  const id = useSelector((state) => state.accountStore.id);
  const settingsStore = useSelector((state) => state.settingsStore);
  const { data: settings, isLoading } = useGetSettingsQuery(id);
  const [updateSettings] = useUpdateSettingsMutation();
  const [
    validateSettings,
    { data: validation, isLoading: isLoadingValidation },
  ] = useValidateSettingsMutation();
  const [localSettings, setLocalSettings] = useState({
    senderName: "",
    senderEmail: "",
    senderAddress: "",
    productId: "",
    token: "",
    phoneId: "",
    phoneNumber: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (!isLoading && settings && settings.result[0]) {
      dispatch(setSettings(settings.result[0]));
      setLocalSettings(settings.result[0]);
    }
  }, [settings, isLoading, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings({ ...localSettings, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedMessage("");
    //const updatedSettings = { id, ...localSettings };

    if (
      !localSettings.senderName ||
      !localSettings.senderEmail ||
      !localSettings.senderAddress ||
      !localSettings.productId ||
      !localSettings.token ||
      !localSettings.phoneId ||
      !localSettings.phoneNumber
    ) {
      setSavedMessage("All fields are required.");
      setIsSaving(false);
      return;
    }

    /*try {
      await updateSettings({ id, data: updatedSettings });
      dispatch(setSettings(updatedSettings));
      setSavedMessage("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to update settings", error);
      setSavedMessage("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }*/

    try {
      // Trigger validation
      const validationDTO = {
        productId: localSettings.productId,
        token: localSettings.token,
        phoneId: localSettings.phoneId,
        phoneNumber: localSettings.phoneNumber,
      };
      const validationResponse = await validateSettings(validationDTO);
      console.log(validationResponse);

      if (
        validationResponse?.data?.result ===
        "Your settings and phone number are validated."
      ) {
        // Proceed to update settings if validation is successful
        const updatedSettings = { id, ...localSettings };
        await updateSettings({ id, data: updatedSettings });
        dispatch(setSettings(updatedSettings));
        setSavedMessage("Settings saved successfully!");
      } else {
        setSavedMessage(
          "Validation failed: " +
            (validationResponse?.error.data.result || "Unknown error.")
        );
      }
    } catch (error) {
      console.error("Failed to update settings", error);
      setSavedMessage("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <MainLoader />;
  }

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title mb-4">Settings</h2>
          <p
            className="mb-4 p-3 bg-light border rounded shadow-sm"
            style={{ fontSize: "16px", lineHeight: "1.5" }}
          >
            All fields are required to send a broadcast.
            <br />
            Your Phone Number should be entered with the country code and
            without any special characters to validate your info.
          </p>
          {isSaving && <MainLoader />}
          {savedMessage && (
            <div
              className={`alert ${
                savedMessage.includes("successfully")
                  ? "alert-success"
                  : "alert-danger"
              }`}
            >
              {savedMessage}
            </div>
          )}
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label className="mb-2">Sender Name</label>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Enter Name"
                  name="senderName"
                  value={localSettings.senderName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label className="mb-2">Sender Email</label>
                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Enter Email"
                  name="senderEmail"
                  value={localSettings.senderEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label className="mb-2">Sender Address</label>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Enter Address"
                  name="senderAddress"
                  value={localSettings.senderAddress}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label className="mb-2">Product ID</label>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Enter Product ID"
                  name="productId"
                  value={localSettings.productId}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label className="mb-2">Token</label>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Enter Token"
                  name="token"
                  value={localSettings.token}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label className="mb-2">Phone ID</label>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Enter Phone ID"
                  name="phoneId"
                  value={localSettings.phoneId}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label className="mb-2">Phone Number</label>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Enter Phone Number"
                  name="phoneNumber"
                  value={localSettings.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="current-settings mt-4">
              <h4 className="mb-3">Current Settings:</h4>
              <p>
                <strong>Sender Name:</strong> {settingsStore.senderName}
              </p>
              <p>
                <strong>Sender Email:</strong> {settingsStore.senderEmail}
              </p>
              <p>
                <strong>Sender Address:</strong> {settingsStore.senderAddress}
              </p>
              <p>
                <strong>Sender Product ID:</strong> {settingsStore.productId}
              </p>
              <p>
                <strong>Sender Token:</strong> {settingsStore.token}
              </p>
              <p>
                <strong>Sender Phone ID:</strong> {settingsStore.phoneId}
              </p>
              <p>
                <strong>Sender Phone Number:</strong>{" "}
                {settingsStore.phoneNumber}
              </p>
            </div>
            <button
              className="btn btn-primary mt-4"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Settings);
