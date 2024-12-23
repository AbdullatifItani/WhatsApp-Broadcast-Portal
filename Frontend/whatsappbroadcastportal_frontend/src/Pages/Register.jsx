import React from "react";
import { useState } from "react";
import { useRegisterMutation } from "../Apis/accountApi";
import { useNavigate } from "react-router-dom";
import { MainLoader } from "../Components/Page/Common";

function Register() {
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [registerUser] = useRegisterMutation();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await registerUser({
      userName: userName,
      name: name,
      password: password,
      role: "Customer",
    });

    if (response.data) {
      navigate("/login");
    } else if (response.error) {
      setError(response.error.data.errorMessages[0]);
    }

    setLoading(false);
  };

  return (
    <div className="container text-center">
      {loading && <MainLoader />}
      <form method="post" onSubmit={handleSubmit}>
        <h1 className="mt-5">Register</h1>
        <div className="mt-5">
          <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Username"
              required
              name="userName"
              value={userName}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Name"
              required
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
            <input
              type="password"
              className="form-control"
              placeholder="Enter Password"
              required
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-5">
          {error && <p className="text-danger">{error}</p>}
          <button type="submit" className="btn btn-success" style={{ backgroundColor: "#128C7E" }}disabled={loading}>
            Register
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
