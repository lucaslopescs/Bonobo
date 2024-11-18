import axios from 'axios';
import React, {useEffect, useState} from "react"

let userInput = "";
let passInput = "";
let correctUser = "test";
let correctPass = "password";

function Login(){


  const [email, setEmail]=useState('')
  const [password, setPassword]=useState('')

  async function submit(e){
      e.preventDefault();

      try{
          await axios.post("http://localhost:3001/login",{
          email,password
          })

      }

      catch (error) {
          console.log('Error:', error);
      }
  }



  return (
      <div className = "Login">
          <h1>Login</h1>

          <form onSubmit={submit}>
              <input type = "email" onChange={(e)=>{setEmail(e.target.value)}} placeholder="Email" name="" id= "" />
              <input type = "password" onChange={(e)=>{setPassword(e.target.value)}} placeholder="Password" name="" id= "" />
              <button type="submit">Login</button>

          </form>
      </div>
  )
}

export default Login;
