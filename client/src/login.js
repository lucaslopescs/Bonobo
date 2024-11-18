import React, {useState} from "react";
import {Link} from "react-router-dom";
import axios from 'axios';


function LoginPage() {
  const [inputValueUser, setInputValueUser] = useState("");
  const [inputValuePass, setInputValuePass] = useState("");
  const [userExists, setUserExists] = useState(false);


  const handleChangeUser = (event) => {
    setInputValueUser(event.target.value); 
  };

  const handleChangePass = (event) => {
    setInputValuePass(event.target.value);
  };

  const handleSubmit = () => {
    console.log("Stored User Input:", inputValueUser);
    console.log("Stored Pass Input:", inputValuePass);
  };

  return (
    <div>
      <h1>Welcome! Please enter your account information</h1>
      <label for="uname">Username: </label>
         <input type="text" id="uname" name="uname" placeholder="Enter username"
          value={inputValueUser}
          onChange={handleChangeUser}> 
      </input>
      <div></div>

      <label for="pword">Password: </label>
         <input type="text" id="pword" name="pword" placeholder="Enter password"
          value={inputValuePass}
          onChange={handleChangePass}> 
      </input>
      <div></div>
      <button onClick={handleSubmit}>Login</button>
      <Link to="/app">
      <button>To Calendar</button>
      </Link>
    </div>
  );
}

export default LoginPage;
