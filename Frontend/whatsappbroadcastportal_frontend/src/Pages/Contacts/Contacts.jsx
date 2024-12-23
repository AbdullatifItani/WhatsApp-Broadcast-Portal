import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setContacts, deleteContact } from "../../Storage/Redux/contactsSlice";
import {
  useGetContactsQuery,
  useDeleteContactMutation,
  useImportContactsMutation,
} from "../../Apis/contactsApi";
import { ContactsTable } from "../../Components/Page/Contacts";
import { MainLoader } from "../../Components/Page/Common";
import * as XLSX from "xlsx";
import { withAuth } from "../../HOC";

const filterOptions = ["None", "Kraytem", "Verdun", "Hamra", "Raouche"];

const Contacts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.accountStore.id);
  const [deleteContactApi] = useDeleteContactMutation();
  const [importContacts] = useImportContactsMutation();
  const [filters, setFilters] = useState({ searchString: "", address: "" });
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageOptions, setPageOptions] = useState({
    pageNumber: 1,
    pageSize: 5,
  });
  const [currentPageSize, setCurrentPageSize] = useState(pageOptions.pageSize);
  const [apiFilters, setApiFilters] = useState({
    searchString: "",
    address: "",
    pageNumber: 1,
    pageSize: 5,
    sortBy: "name",
    sortOrder: "asc",
  });
  const [importData, setImportData] = useState(null);
  const { data: contacts, isLoading } = useGetContactsQuery({
    userId,
    ...(apiFilters && {
      searchString: apiFilters.searchString,
      address: apiFilters.address,
      pageNumber: pageOptions.pageNumber,
      pageSize: pageOptions.pageSize,
      sortBy: apiFilters.sortBy,
      sortOrder: apiFilters.sortOrder,
    }),
  });

  const [showModal, setShowModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  const handleShowModal = (contactId) => {
    setContactToDelete(contactId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setContactToDelete(null);
  };

  const handleConfirmDelete = () => {
    deleteContactApi(contactToDelete);
    dispatch(deleteContact(contactToDelete));
    handleCloseModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setApiFilters({
      ...apiFilters,
      [name]: value,
      pageNumber: 1, // Reset to the first page when applying new filters
      pageSize: pageOptions.pageSize,
    });
  };

  useEffect(() => {
    if (!isLoading && contacts && contacts.apiResponse.result) {
      dispatch(setContacts(contacts.apiResponse.result));
      const { TotalRecords } = JSON.parse(contacts.totalRecords);
      setTotalRecords(TotalRecords);
    }
  }, [contacts, isLoading, dispatch]);

  const getPageDetails = () => {
    const dataStartNumber =
      (pageOptions.pageNumber - 1) * pageOptions.pageSize + 1;
    const dataEndNumber = pageOptions.pageNumber * pageOptions.pageSize;

    return `${dataStartNumber} - ${
      dataEndNumber < totalRecords ? dataEndNumber : totalRecords
    } of ${totalRecords}`;
  };

  const handlePageOptionChange = (direction, pageSize) => {
    const totalPages = Math.ceil(totalRecords / currentPageSize);
    if (direction === "prev") {
      setPageOptions({
        pageSize: currentPageSize,
        pageNumber: pageOptions.pageNumber - 1,
      });
    } else if (direction === "next") {
      setPageOptions({
        pageSize: currentPageSize,
        pageNumber: pageOptions.pageNumber + 1,
      });
    } else if (direction === "change") {
      setPageOptions({
        pageSize: pageSize || currentPageSize,
        pageNumber: 1,
      });
      setCurrentPageSize(pageSize || currentPageSize);
    } else if (direction === "first") {
      setPageOptions({
        pageSize: currentPageSize,
        pageNumber: 1,
      });
    } else if (direction === "last") {
      setPageOptions({
        pageSize: currentPageSize,
        pageNumber: totalPages,
      });
    }
  };

  const handleAddContact = () => {
    navigate("/contacts/contactUpsert/");
  };

  const handleEditContact = (contact) => {
    navigate("/contacts/contactUpsert/" + contact.id);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Format the data to match the ContactBulkCreateDTO structure
      const formattedData = {
        userId: userId,
        contacts: worksheet.map((contact) => ({
          name: String(contact["Display Name"]) || "",
          phone:
            String(contact["Mobile Phone"])
              .replace(/^\+/, "")
              .replace(/\s+/g, "")
              //.replace(/[^\d]/g, "") 
              //.replace(/\D+/g, "") 
              || "",
          address: String(contact["Address"]) || "",
          //address: "NA"
        })),
      };
      // Set the parsed data in state
      setImportData(formattedData);
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (importData) {
      importContacts(importData)
        .then(() => {
          // Refresh contacts list after import
          setApiFilters({
            ...apiFilters,
            pageNumber: 1,
            pageSize: currentPageSize,
          });
          setImportData(null); // Reset import data to avoid infinite loop
        })
        .catch((error) => {
          console.error("Error importing contacts:", error);
        });
    }
  }, [importData, importContacts, apiFilters, currentPageSize]);

  const toggleSortOrder = () => {
    setApiFilters({
      ...apiFilters,
      sortOrder: apiFilters.sortOrder === "asc" ? "desc" : "asc",
      pageNumber: 1, // Reset to the first page when sorting
    });
  };

  const handleSortChange = (field) => {
    if (field === apiFilters.sortBy) {
      toggleSortOrder(); // If clicking on the same field, toggle order
    } else {
      setApiFilters({
        ...apiFilters,
        sortBy: field,
        sortOrder: "asc", // Default to ascending order when changing field
        pageNumber: 1,
      });
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Contacts</h2>
      <div className="d-flex mb-3">
        <button className="btn btn-primary me-3" onClick={handleAddContact}>
          Add Contact
        </button>
        <button
          className="btn btn-secondary me-3"
          onClick={() => document.getElementById("fileInput").click()}
        >
          Import Contacts
        </button>
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
        />
        <input
          type="text"
          className="form-control mx-3"
          placeholder="Filter contacts"
          name="searchString"
          value={filters.searchString}
          onChange={handleChange}
        />
        <select
          className="form-select mx-3"
          onChange={handleChange}
          name="address"
        >
          {filterOptions.map((item, index) => (
            <option key={index} value={item === "None" ? "" : item}>
              {item}
            </option>
          ))}
        </select>
        <div className="mx-3">
          <span className="me-2">Sort by:</span>
          <button
            className="btn btn-link"
            onClick={() => handleSortChange("name")}
          >
            Name{" "}
            {apiFilters.sortBy === "name" && (
              <i
                className={`bi bi-arrow-${
                  apiFilters.sortOrder === "asc" ? "down" : "up"
                }-circle`}
              ></i>
            )}
          </button>
        </div>
      </div>
      {isLoading && <MainLoader />}
      {!isLoading && (
        <ContactsTable
          contacts={contacts.apiResponse.result}
          onEdit={handleEditContact}
          onDelete={handleShowModal}
        />
      )}
      <div className="d-flex justify-content-between align-items-center mt-4">
        <div>
          <span>Rows per page: </span>
          <select
            className="form-select mx-2"
            onChange={(e) => {
              handlePageOptionChange("change", e.target.value);
            }}
            value={currentPageSize}
          >
            <option>5</option>
            <option>10</option>
            <option>15</option>
            <option>20</option>
          </select>
        </div>
        <div>{getPageDetails()}</div>
        <div className="d-flex">
          <button
            onClick={() => handlePageOptionChange("first")}
            disabled={pageOptions.pageNumber === 1}
            className="btn btn-outline-primary me-2"
          >
            <i className="bi bi-chevron-double-left"></i>
          </button>
          <button
            onClick={() => handlePageOptionChange("prev")}
            disabled={pageOptions.pageNumber === 1}
            className="btn btn-outline-primary me-2"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <button
            onClick={() => handlePageOptionChange("next")}
            disabled={
              pageOptions.pageNumber * pageOptions.pageSize >= totalRecords
            }
            className="btn btn-outline-primary me-2"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
          <button
            onClick={() => handlePageOptionChange("last")}
            disabled={
              pageOptions.pageNumber * pageOptions.pageSize >= totalRecords
            }
            className="btn btn-outline-primary"
          >
            <i className="bi bi-chevron-double-right"></i>
          </button>
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this contact?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default withAuth(Contacts);
