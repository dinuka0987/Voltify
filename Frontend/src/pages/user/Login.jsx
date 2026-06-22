import React, { useState } from "react";
import API from "../../services/api";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {

    const res = await API.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem(
      "token",
      res.data.token
    );
  };

  return (
    <div>

      <h1>Login</h1>

      <input
        placeholder="Email"
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button onClick={loginUser}>
        Login
      </button>

    </div>
  );
}

export default Login;