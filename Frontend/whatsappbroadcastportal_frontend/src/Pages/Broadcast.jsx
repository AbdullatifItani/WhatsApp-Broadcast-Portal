import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSendMessageMutation } from "../Apis/broadcastApi";
import { useGetAllContactsQuery } from "../Apis/contactsApi";
import { MainLoader } from "../Components/Page/Common";
import { withAuth, withSettingsCheck } from "../HOC";
import { Modal, Button } from "react-bootstrap";

const Broadcast = () => {
  //const navigate = useNavigate();
  const userId = useSelector((state) => state.accountStore.id);
  const settingsId = useSelector((state) => state.settingsStore.id);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sendBroadcast, { isLoading: isSending }] = useSendMessageMutation();
  const { data: contacts, isLoading } = useGetAllContactsQuery(userId);
  const [showModal, setShowModal] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sentMessage, setSentMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [fileType, setFileType] = useState("text");
  const fileInputRef = useRef(null);

  const handleContactSelection = (contactId) => {
    setSelectedContacts((prevSelected) =>
      prevSelected.includes(contactId)
        ? prevSelected.filter((id) => id !== contactId)
        : [...prevSelected, contactId]
    );
  };

  const handleAddAllContacts = () => {
    const allContactIds = contacts.result
      .filter((contact) => contact.phone !== "undefined")
      .map((contact) => contact.id);
    setSelectedContacts(allContactIds);
  };

  const handleRemoveAllContacts = () => {
    setSelectedContacts([]);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirmSend = async () => {
    handleCloseModal();
    setIsSent(true);
    if (selectedContacts.length > 0 && (message.trim() !== "" || selectedFile)) {
      let base64File = "";
      if (selectedFile) {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onloadend = () => {
          base64File = reader.result.split(',')[1];
          sendBroadcastMessage(base64File);
        };
      } else {
        sendBroadcastMessage(base64File);
      }
    } else {
      setIsSent(false);
    }
  };

  const sendBroadcastMessage = async (base64File) => {
    // Determine the MIME type prefix
    const mimeType = selectedFile ? selectedFile.type : "text/plain";
    const prefix = `data:${mimeType};base64,`;
    console.log(prefix);
    
    const payload = {
      Type: fileType,
      Id: settingsId,
      //MessageContent: "data:image/png;base64," + base64File || message,
      //MessageContent: prefix + base64File || message,
      MessageContent: base64File ? prefix + base64File : message,
      //MessageContent: "data:image/png;base64," + base64File.split(',')[1] || message,
      //MessageContent: base64File ? prefix + base64File.split(',')[1] : message,
      Text: fileType === "media" ? message : "",
      ContactList: selectedContacts.map((id) => ({
        Phone: contacts.result.find((contact) => contact.id === id).phone,
      })),
      FileName: selectedFile ? selectedFile.name : "",
    };
    console.log(payload);

    try {
      const response = await sendBroadcast(payload).unwrap();
      console.log(response);
      setMessage("");
      setSelectedContacts([]);
      setSelectedFile(null);
      setFilePreview("");
      setFileType("text");
      //setSentMessage("Broadcast sent successfully!");
      setSentMessage(response.result);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Failed to send broadcast:", err);
      setSentMessage("Failed to send broadcast.");
    } finally {
      setIsSent(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setFileType(file ? "media" : "text");
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview("");
    }
  };

  const filteredContacts = contacts?.result.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
  );

  return (
    <div className="container mt-5">
      <div className="card">
        <h2 className="card-header">Broadcast Message</h2>
        <div className="card-body">
          {isSent && <MainLoader />}
          {sentMessage && (
            <div
              className={`alert ${
                sentMessage.includes("successfully")
                  ? "alert-success"
                  : "alert-danger"
              }`}
            >
              {sentMessage}
            </div>
          )}
          <div className="row">
            <div className="col-md-8">
              <textarea
                className="form-control mb-3"
                rows="4"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
              <input
                type="file"
                className="form-control mb-3"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              {filePreview && (
                <div className="mb-3">
                  <h5>File Preview:</h5>
                  {selectedFile.type.startsWith("image/") && (
                    <img src={filePreview} alt="File Preview" className="img-thumbnail" />
                  )}
                  {selectedFile.type.startsWith("audio/") && (
                    <audio controls>
                      <source src={filePreview} type={selectedFile.type} />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                  {selectedFile.type.startsWith("video/") && (
                    <video controls width="100%">
                      <source src={filePreview} type={selectedFile.type} />
                      Your browser does not support the video element.
                    </video>
                  )}
                  {!selectedFile.type.startsWith("image/") &&
                    !selectedFile.type.startsWith("audio/") &&
                    !selectedFile.type.startsWith("video/") && (
                      <p>{selectedFile.name}</p>
                    )}
                </div>
              )}
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isLoading && <MainLoader />}
              {!isLoading && (
                <>
                  <h5>Select Contacts:</h5>
                  <div className="contacts-list">
                    {filteredContacts.map((contact) => (
                      <div key={contact.id} className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`contact-${contact.id}`}
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => handleContactSelection(contact.id)}
                          disabled={contact.phone === "undefined"}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`contact-${contact.id}`}
                        >
                          {contact.name} - {contact.phone}
                        </label>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="col-md-4">
              <div className="d-flex flex-column">
                <button
                  className="btn btn-success mb-3"
                  onClick={handleShowModal}
                  disabled={
                    isSending ||
                    selectedContacts.length === 0 ||
                    (message.trim() === "" && !selectedFile)
                  }
                >
                  {isSending ? "Sending... " : "Send Broadcast "}
                  <i className="bi bi-whatsapp"></i>
                </button>
                <button
                  className="btn btn-primary mb-3"
                  onClick={handleAddAllContacts}
                  disabled={isLoading || filteredContacts.length === 0}
                >
                  Add All
                </button>
                <button
                  className="btn btn-danger mb-3"
                  onClick={handleRemoveAllContacts}
                  disabled={selectedContacts.length === 0}
                >
                  Remove All
                </button>
                <div className="selected-contacts">
                  <h5 className="mb-3">
                    Selected Contacts: {selectedContacts.length}
                  </h5>
                  <ul className="list-group">
                    {selectedContacts.map((contactId) => {
                      const contact = contacts.result.find(
                        (contact) => contact.id === contactId
                      );
                      return (
                        <li key={contactId} className="list-group-item">
                          {contact.name} - {contact.phone}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Broadcast</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to send this broadcast message to the selected contacts?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleConfirmSend}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default withAuth(withSettingsCheck(Broadcast));
