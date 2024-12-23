import React from "react";
import "./Home.css";

function Home() {
  return (
    <main className="body">
      <section className="welcome">
        <div className="container">
          <h1>Welcome To Your WhatsApp Broadcast Portal</h1>
          <p>Manage your business communications effectively.</p>
        </div>
      </section>
      <section className="features">
        <div className="container">
          <h2>Key Features</h2>
          <ul>
            <li>Send bulk messages to your contacts with ease.</li>
            <li>Manage and organize your contact lists efficiently.</li>
            <li>Customize settings for personalized broadcasts.</li>
            <li>View message delivery status and analytics.</li>
          </ul>
        </div>
      </section>
      <section className="get-started">
        <div className="container">
          <h2>Get Started</h2>
          <p>Follow these steps to begin using the portal:</p>
          <ol>
            <li>Create MAYTAPI account and add phone number.</li>
            <li>Register for an account.</li>
            <li>Login using your credentials.</li>
            <li>Set up your sender details and preferences in the Settings page.</li>
            <li>Add Product ID and Token and PhoneID to settings.</li>
            <li>Add contacts or import existing lists in the Contacts page.</li>
            <li>Compose your message and schedule broadcasts in the Broadcast page.</li>
          </ol>
        </div>
      </section>
      <section className="support">
        <div className="container">
          <h2>Need Help?</h2>
          <p>For assistance or inquiries, contact our support team:</p>
          <p>Email: <a href="mailto:support@yourportal.com">abed1_itani@hotmail.com</a></p>
          <p>Phone: <a href="tel:+1234567890">+961 70 737 897</a></p>
        </div>
      </section>
    </main>
  );
}

export default Home;
