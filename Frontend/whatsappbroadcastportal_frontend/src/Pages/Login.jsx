import React from "react";
import { useState } from "react";
import { useLoginMutation } from "../Apis/accountApi";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLoggedInUser } from "../Storage/Redux/accountSlice";
import { MainLoader } from "../Components/Page/Common";

function Login() {
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginUser] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await loginUser({
      userName: userName,
      password: password,
    });

    if (response.data) {
      const { token } = response.data.result;
      const { name, id, userName, role } = jwtDecode(token);
      localStorage.setItem("token", token);
      dispatch(setLoggedInUser({ name, id, userName, role, isLoggedIn: true }));
      navigate("/");
    } else if (response.error) {
      setError(response.error.data.errorMessages[0]);
    }
    
    setLoading(false);
  };

  return (
    <div className="container text-center">
      {loading && <MainLoader />}
      <form method="post" onSubmit={handleSubmit}>
        <h1 className="mt-5">Login</h1>
        <div className="mt-5">
          <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Username"
              required
              name="username"
              value={userName}
              onChange={(e) => setUsername(e.target.value)}
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

        <div className="mt-2">
          {error && <p className="text-danger">{error}</p>}
          <button
            type="submit"
            className="btn btn-success"
            style={{ width: "200px", backgroundColor: "#128C7E" }}
            disabled={loading}
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
