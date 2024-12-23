import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetContactByIdQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
} from "../../Apis/contactsApi";
import { addContact, updateContact } from "../../Storage/Redux/contactsSlice";
import { useNavigate, useParams } from "react-router-dom";
import { MainLoader } from "../../Components/Page/Common";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
//import { Modal, Button, Form } from "react-bootstrap";

const ContactUpsert = () => {
  const { id } = useParams();
  const userId = useSelector((state) => state.accountStore.id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createContact] = useCreateContactMutation();
  const [editContact] = useUpdateContactMutation();
  const { data: contact, isLoading } = useGetContactByIdQuery(id);

  useEffect(() => {
    if (!isLoading && contact && contact.result) {
      setName(contact.result.name);
      setPhone(contact.result.phone);
      setAddress(contact.result.address);
    }
  }, [contact]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") setName(value);
    //if (name === "phone") setPhone(value);
    if (name === "address") setAddress(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      //alert("Phone number is required");
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    setLoading(true);
    const contactData = {
      Name: name,
      Phone: phone,
      Address: address,
    };
  
    let response;
  
    try {
      if (id) {
        // Update Contact
        contactData.Id = id;
        response = await editContact({ id, data: contactData });
        if (response.error) {
          throw new Error(response.error.data.errorMessages.join(", "));
        }
        dispatch(updateContact({ id: contact.id, name, phone, address }));
        //toastNotify("Contact updated successfully", "success");
      } else {
        // Create Contact
        contactData.UserId = userId;
        response = await createContact(contactData);
        if (response.error) {
          throw new Error(response.error.data.errorMessages.join(", "));
        }
        dispatch(addContact({ name, phone, address }));
        //toastNotify("Contact created successfully", "success");
      }
  
      setLoading(false);
      navigate("/contacts");
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };  

  return (
    <div className="container border mt-5 p-5 bg-light">
      {loading && <MainLoader />}
      <h3 className="px-2 text" style={{ color: "#128C7E"}}>
        {id ? "Edit Contact" : "Add Contact"}
      </h3>
      <form method="post" onSubmit={handleSubmit}>
        <div className="row mt-3">
          <div className="col-md-7">
          {error && <div className="alert alert-danger">{error}</div>}
            <input
              type="text"
              className="form-control"
              placeholder="Enter Name"
              name="name"
              value={name}
              onChange={handleChange}
            />
            <PhoneInput
              inputProps={{
                name: "phone",
              }}
              country={"lb"} // Default country
              placeholder="+961 70 737 897"
              value={phone}
              onChange={(phone) => setPhone(phone)}
              containerClass="mt-3"
              inputClass="form-control"
              buttonClass="btn"
              countryCodeEditable={false}
              masks={{ lb: ".. ... ..." }}
            />
            <textarea
              className="form-control mt-3"
              placeholder="Enter Address"
              name="address"
              rows={10}
              value={address}
              onChange={handleChange}
            ></textarea>
            <div className="row">
              <div className="col-6">
                <button
                  type="submit"
                  className="btn btn-success form-control mt-3"
                  style={{ backgroundColor: "#128C7E"}}
                >
                  {id ? "Update" : "Create"}
                </button>
              </div>
              <div className="col-6">
                <a
                  onClick={() => navigate("/contacts")}
                  className="btn btn-secondary form-control mt-3"
                >
                  Back to Contacts
                </a>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContactUpsert;
