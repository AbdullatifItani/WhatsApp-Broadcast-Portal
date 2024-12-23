import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Modal, Form } from "react-bootstrap";
import {
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useApproveTemplateMutation,
  useFetchContentAndApprovalsQuery,
} from "../Apis/templatesApi";
import { MainLoader } from "../Components/Page/Common";
import { withAdminAuth } from "../HOC";

const Templates = () => {
  const navigate = useNavigate();
  const { data, error, isLoading } = useFetchContentAndApprovalsQuery();
  console.log(data);
  const [createTemplate] = useCreateTemplateMutation();
  const [approveTemplate] = useApproveTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();

  const [showModal, setShowModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    language: "",
    contentType: "",
    message: "",
    media: "",
  });

  const handleCreate = () => {
    setShowModal(true);
  };

  const handleApprove = (contentSid) => {
    approveTemplate(contentSid);
  };

  const handleView = (contentSid) => {
    navigate(`/templates/${contentSid}`);
  };

  const handleDelete = (contentSid) => {
    deleteTemplate(contentSid);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTemplate({ ...newTemplate, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTemplate(newTemplate);
    setShowModal(false);
    setNewTemplate({
      name: "",
      language: "",
      contentType: "",
      message: "",
      media: "",
    });
  };

  if (error) return <div>Error: {error.message}</div>;

  //if (isLoading) return <Spinner animation="border" size="sm" />;
  //if (error) return <span className="badge bg-danger">Error</span>;

  return (
    <div className="container mt-5">
      {isLoading && <MainLoader />}
      {!isLoading && (
        <>
          <Button variant="primary" onClick={() => handleCreate()}>
            Create Template
          </Button>
          <h1 className="my-4">Templates List</h1>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>SID</th>
                <th>Language</th>
                <th>Date Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((template) => (
                <tr key={template.sid}>
                  <td>{template.friendly_name}</td>
                  <td>{template.sid}</td>
                  <td>{template.language}</td>
                  <td>{new Date(template.date_created).toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        template.approval_requests.status === "approved"
                          ? "bg-success"
                          : template.approval_requests.status === "pending"
                          ? "bg-warning"
                          : template.approval_requests.status === "rejected"
                          ? "bg-danger"
                          : template.approval_requests.status === "paused"
                          ? "bg-warning"
                          : template.approval_requests.status === "disabled"
                          ? "bg-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {template.approval_requests.status}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      className="me-2"
                      onClick={() => handleApprove(template.sid)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="success"
                      className="me-2"
                      onClick={() => handleView(template.sid)}
                    >
                      View
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(template.sid)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newTemplate.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="language" className="mt-3">
              <Form.Label>Language</Form.Label>
              <Form.Control
                type="text"
                name="language"
                value={newTemplate.language}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="contentType" className="mt-3">
              <Form.Label>Content Type</Form.Label>
              <Form.Select
                name="contentType"
                value={newTemplate.contentType}
                onChange={handleChange}
                required
              >
                <option value="">Select content type</option>
                <option value="text">Text</option>
                <option value="media">Media</option>
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="message" className="mt-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                type="text"
                name="message"
                value={newTemplate.message}
                onChange={handleChange}
                required={newTemplate.contentType === "text"}
              />
            </Form.Group>
            {newTemplate.contentType === "media" && (
              <Form.Group controlId="media" className="mt-3">
                <Form.Label>Media</Form.Label>
                <Form.Control
                  type="text"
                  name="media"
                  value={newTemplate.media}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            )}
            <Button variant="primary" type="submit" className="mt-4">
              Create Template
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default withAdminAuth(Templates);
