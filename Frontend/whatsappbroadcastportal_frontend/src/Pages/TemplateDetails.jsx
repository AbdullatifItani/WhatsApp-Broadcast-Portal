import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetTemplateByIdQuery } from "../Apis/templatesApi";
import 'bootstrap/dist/css/bootstrap.min.css';
import { withAdminAuth } from "../HOC";

const TemplateDetails = () => {
  const { sid } = useParams();
  const navigate = useNavigate();
  const { data: template, error, isLoading } = useGetTemplateByIdQuery(sid);
  console.log(template);

  if (isLoading) return <div className="text-center my-5">Loading...</div>;
  if (error) return <div className="text-center my-5 text-danger">Error: {error.message}</div>;

  const renderContent = () => {
    if (template.types["twilio/text"]) {
      return <p><strong>Message:</strong> {template.types["twilio/text"].body}</p>;
    }

    if (template.types["twilio/media"]) {
      return (
        <>
          <p><strong>Message:</strong> {template.types["twilio/media"].body || "No message"}</p>
          {template.types["twilio/media"].media.map((mediaUrl, index) => (
            <p key={index}><strong>Media:</strong> <a href={mediaUrl}>{mediaUrl}</a></p>
          ))}
        </>
      );
    }

    return <p>No content available</p>;
  };

  return (
    <div className="container mt-5">
        <button className="btn btn-primary mb-3" onClick={() => navigate("/templates")}>Back to Templates</button>
      <div className="card">
        <div className="card-header">
          <h1>{template.friendly_name}</h1>
        </div>
        <div className="card-body">
          <p><strong>SID:</strong> {template.sid}</p>
          <p><strong>Language:</strong> {template.language}</p>
          <p><strong>Date Created:</strong> {new Date(template.date_created).toLocaleString()}</p>
          <p><strong>Date Updated:</strong> {new Date(template.date_updated).toLocaleString()}</p>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(TemplateDetails);
