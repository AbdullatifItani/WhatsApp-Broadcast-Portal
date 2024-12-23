import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSendMessageTemplateMutation } from "../Apis/broadcastApi";
import { useGetAllContactsQuery } from "../Apis/contactsApi";
import { useFetchContentAndApprovalsQuery } from "../Apis/templatesApi";
import { MainLoader } from "../Components/Page/Common";
import { withAdminAuth } from "../HOC";
import { Modal, Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const BroadcastTemplate = () => {
  const navigate = useNavigate();
  const userId = useSelector((state) => state.accountStore.id);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sendBroadcastTemplate, { isLoading: isSending }] = useSendMessageTemplateMutation();
  const { data: contacts, isLoading: isLoadingContacts } = useGetAllContactsQuery(userId);
  const { data: templates, isLoading: isLoadingTemplates } = useFetchContentAndApprovalsQuery();
  console.log(templates);
  const [showModal, setShowModal] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sentMessage, setSentMessage] = useState("");

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
    if (selectedContacts.length > 0 && selectedTemplate.trim() !== "") {
      const selectedTemplateObject = templates.find(template => template.sid === selectedTemplate);
      const payload = {
        ContentSid: selectedTemplateObject.sid,
        ContactList: selectedContacts.map((id) => ({
          Phone: contacts.result.find((contact) => contact.id === id).phone,
        })),
      };
      try {
        await sendBroadcastTemplate(payload).unwrap();
        setSelectedTemplate("");
        setSelectedContacts([]);
        setSentMessage("Broadcast sent successfully!");
      } catch (err) {
        console.error("Failed to send broadcast:", err);
        setSentMessage("Failed to send broadcast.");
      } finally {
        setIsSent(false);
      }
    } else {
      setIsSent(false);
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
              <select
                className="form-select mb-3"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                disabled={isLoadingTemplates}
              >
                <option value="">Select a template...</option>
                {!isLoadingTemplates && templates.map((template) => (
                  <option key={template.sid} value={template.sid}>
                    {template.friendly_name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isLoadingContacts && <MainLoader />}
              {!isLoadingContacts && (
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
                    selectedTemplate.trim() === ""
                  }
                >
                  {isSending ? "Sending... " : "Send Broadcast "}
                  <i className="bi bi-whatsapp"></i>
                </button>
                <button
                  className="btn btn-primary mb-3"
                  onClick={handleAddAllContacts}
                  disabled={isLoadingContacts || filteredContacts.length === 0}
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

export default withAdminAuth(BroadcastTemplate);
