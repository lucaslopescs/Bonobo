//verify does not work

//variables to test verify
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
          await axios.post("http://localhost:8000/",{
          email,password
          })

      }

      catch{
          console.log(e)

      }
  }



  return (
      <div className = "Login">
          <h1>Login</h1>

          <form action="POST">
              <input type = "email" onChange={(e)=>{setEmail(e.target.value)}} placeholder="Email" name="" id= "" />
              <input type = "password" onChange={(e)=>{setPassword(e.target.value)}} placeholder="Password" name="" id= "" />
              <input type="submit" onClick={submit} />

          </form>
      </div>
  )
}


function App() {
  return (
    <div>
        <h1>Welcome! Please enter your account information</h1>
        <UsernameBox />
        <div></div>
        <PasswordBox />
        <div></div>
        <SignInButton />
    </div>
  );
}

export default App;
