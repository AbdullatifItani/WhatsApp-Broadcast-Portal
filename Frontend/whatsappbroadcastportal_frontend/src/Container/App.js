import React, { useState } from 'react'
import { Footer, Header } from "../Components/Layout";
import { AccessDenied, Broadcast, Contacts, ContactUpsert, Home, Login, NotFound, Register, Settings, Success, TemplateDetails, Templates, BroadcastTemplate } from "../Pages";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetSettingsQuery } from '../Apis/settingsApi';
import { useGetContactsQuery } from '../Apis/contactsApi';
import { setLoggedInUser } from "../Storage/Redux/accountSlice";
import { setSettings } from '../Storage/Redux/settingsSlice';
import { setContacts } from '../Storage/Redux/contactsSlice';
import { jwtDecode } from "jwt-decode";
import background from "../Static/whatsapp-background.png"

function App() {
  const dispatch = useDispatch();
  const [skip, setSkip] = useState(true);
  const userData = useSelector((state) => state.accountStore);
  const userId = useSelector((state) => state.accountStore.id);
  const { data: settings, isLoadingSettings } = useGetSettingsQuery(userId, {skip: skip,});
  const { data: contacts, isLoadingContacts } = useGetContactsQuery({ userId });

  //Test Stores
  const settingsData = useSelector((state) => state.settingsStore);
  const contactsData = useSelector((state) => state.contactsStore);
  //console.log("User Store:", userData)
  //console.log("Settings Store:", settingsData)
  //console.log("Contacts Store:", contactsData)
  //Test End

  useEffect(() => {
    const localToken = localStorage.getItem("token");
    if (localToken) {
      const { name, id, userName, role } = jwtDecode(localToken);
      dispatch(setLoggedInUser({ name, id, userName, role, isLoggedIn: true }));
    }
  }, []);

  useEffect(() => {
    if (!isLoadingSettings) {
      if (settings && settings.result[0]) {
        dispatch(setSettings(settings.result[0]));
      }
    }
  }, [settings, isLoadingSettings]);

  /*useEffect(() => {
    if (!isLoadingContacts) {
      if (contacts && contacts.apiResponse.result) {
        dispatch(setContacts(contacts.apiResponse.result));
      }
    }
  }, [contacts, isLoadingContacts]);*/

  useEffect(() => {
    if (userData.id) setSkip(false);
  }, [userData]);

  return (
    <div style={{ 
      backgroundImage: `url(${background})`, 
      minHeight: "100vh",
      //marginTop: "-70px",
      //backgroundSize: "cover",
      backgroundRepeat: "repeat", 
      }}>
      <Header />
      <div className="pb-5">
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/settings" element={<Settings />}></Route>
          <Route path="/contacts" element={<Contacts />}></Route>
          <Route
            path="/contacts/contactUpsert/:id"
            element={<ContactUpsert />}
          />
          <Route path="/contacts/contactUpsert" element={<ContactUpsert />} />
          <Route path="/broadcast" element={<Broadcast />}></Route>
          <Route path="/broadcast/success" element={<Success />}></Route>
          <Route path="/templates" element={<Templates />}></Route>
          <Route path="/templates/:sid" element={<TemplateDetails />} />
          <Route path="/broadcasttemplate" element={<BroadcastTemplate />} />
          <Route path="/accessDenied" element={<AccessDenied />} />
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
