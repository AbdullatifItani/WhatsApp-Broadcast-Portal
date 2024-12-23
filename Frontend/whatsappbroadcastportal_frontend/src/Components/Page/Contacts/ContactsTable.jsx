import React from "react";
import "./ContactsTable.css";

const ContactsTable = ({ contacts, onEdit, onDelete }) => {
  return (
    <table className="table whatsapp-table table-striped table-bordered table-hover">
      <thead className="green-header">
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Address</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map((contact) => (
          <tr key={contact.id}>
            <td>{contact.name}</td>
            <td>{contact.phone}</td>
            <td>{contact.address}</td>
            <td>
              <button type="button" className="btn btn-success whatsapp-btn" onClick={() => onEdit(contact)}>
                Edit
              </button>
              <button type="button" className="btn btn-danger whatsapp-btn" onClick={() => onDelete(contact.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ContactsTable;
