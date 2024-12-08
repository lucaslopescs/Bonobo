import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState('student');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationCodeInput, setShowVerificationCodeInput] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showVerificationCodeInput) {
        // Verify the code
        const response = await axios.post('http://localhost:3001/verify-code', {
          email,
          verificationCode,
        });
        alert(response.data.message);
        // After successful verification, reset state and return to login
        setIsRegistering(false);
        setShowVerificationCodeInput(false);
      } else {
        // Register or login the user
        const endpoint = isRegistering ? '/register' : '/login';
        const requestData = {
          username,
          password,
          role: isRegistering ? role : undefined,
        };
        if (isRegistering) {
          requestData.email = email; // Add email when registering
        }

        console.log('Sending registration/login request:', requestData);
        const response = await axios.post(`http://localhost:3001${endpoint}`, requestData);

        if (response.data.success !== false) {
          if (isRegistering) {
            // Registration successful, instruct user to enter verification code
            alert(response.data.message);
            setShowVerificationCodeInput(true);
          } else {
            // Login successful
            onLoginSuccess(response.data);
          }
        } else {
          alert(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data.message || 'An error occurred');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>
            {showVerificationCodeInput 
              ? 'Verify Your Email' 
              : (isRegistering ? 'Create Account' : 'Welcome Back')
            }
          </h2>
          <p>
            {showVerificationCodeInput 
              ? 'Please enter the verification code sent to your email' 
              : (isRegistering ? 'Please fill in your details' : 'Please login to your account')
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!showVerificationCodeInput && (
            <>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>

              {isRegistering && (
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {isRegistering && (
                <div className="form-group">
                  <label>Role</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="role-select"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>
              )}
            </>
          )}

          {showVerificationCodeInput && (
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter your verification code"
                required
              />
            </div>
          )}

          <button type="submit" className="submit-button">
            {showVerificationCodeInput ? 'Verify Code' : (isRegistering ? 'Create Account' : 'Login')}
          </button>
        </form>

        {!showVerificationCodeInput && (
          <div className="auth-footer">
            <p>
              {isRegistering 
                ? 'Already have an account?' 
                : "Don't have an account?"}
              <button 
                className="toggle-button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setShowVerificationCodeInput(false); // Reset any verification state
                }}
              >
                {isRegistering ? 'Login' : 'Register'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;