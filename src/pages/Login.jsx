import { API_BASE_URL } from '../config';
import { useState } from 'react';
import { MessageCircle, User, Lock, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { encryptData, decryptData } from "../utils/encryption";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.login.trim()) {
      newErrors.login = "Field is required";
    } else {
      const value = formData.login.trim();

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isMobile = /^[0-9]+$/.test(value); // check if only numbers
      const isValidMobile = /^[1-9][0-9]{11,12}$/.test(value);
      const isUsername = /^[a-zA-Z0-9_]{3,}$/.test(value);

      if (isMobile && !isValidMobile) {
        newErrors.login = "Enter valid mobile with country code (e.g., 919876543210)";
      } else if (!isEmail && !isValidMobile && !isUsername) {
        newErrors.login = "Enter valid Email or Username";
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setIsLoading(true);
      // Removed setApiMessage({ type: '', text: '' }); to prevent form "blinking" / layout shifting

      try {
        const response = await fetch( `${import.meta.env.VITE_API_URL}/api/vendor/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: encryptData({
              loginField: formData.login,
              password: formData.password
            })
          })
        });

        const encryptedResponse = await response.json();
        if (!encryptedResponse.payload) {
          throw new Error("Encrypted response missing");
        }
        const data = decryptData(encryptedResponse.payload);
        if (!data || typeof data !== "object") {
          throw new Error("Invalid decrypted response");
        }
        // const data = await response.json();

        if (response.ok && data.success) {
          setApiMessage({ type: 'success', text: 'Login successful!' });

          if (data?.data?.token) {

            localStorage.setItem("token", data.data.token);

            navigate('/dashboard');

          } else {

            setApiMessage({
              type: 'error',
              text: 'Token missing from server response'
            });

          }
        } else {
          setApiMessage({
            type: 'error',
            text: data.message || 'Login failed. Please try again.'
          });
        }

      } catch (error) {
        console.error("Login API Error:", error);
        setApiMessage({
          type: 'error',
          text: 'Network error. Please try again later.'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card animate-fade-in">
          <div className="card-header" style={{ padding: '1rem 1.5rem 0.5rem' }}>
            <MessageCircle size={36} color="var(--wa-green)" />
            <h2>Login</h2>
          </div>

          <div className="card-body" style={{ padding: '1.25rem 1.5rem 1.75rem' }}>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Email, Username or Mobile</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    name="login"
                    value={formData.login}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Email/Username/Mobile"
                    style={{ padding: '0.6rem 1rem 0.6rem 2.5rem' }}
                  />
                </div>

                {errors.login && (
                  <div style={{ color: 'red', fontSize: '0.75rem' }}>
                    {errors.login}
                  </div>
                )}
                <div className="form-helper" style={{ fontSize: '0.7rem' }}>
                  Mobile number should be with country code without 0 or +
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Password"
                    style={{ padding: '0.6rem 1rem 0.6rem 2.5rem' }}
                  />
                </div>

                {errors.password && (
                  <div style={{ color: 'red', fontSize: '0.75rem' }}>
                    {errors.password}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <label className="checkbox-wrapper" style={{ marginBottom: 0 }}>
                  <input type="checkbox" />
                  <span className="checkbox-label" style={{ fontSize: '0.8rem' }}>Remember me</span>
                </label>

                <Link to="/forgot-password" style={{ fontSize: '0.8rem' }}>
                  Forgot password?
                </Link>
              </div>

              {apiMessage.text && (
                <div style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  borderRadius: '4px',
                  backgroundColor: apiMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: apiMessage.type === 'success' ? '#155724' : '#721c24',
                  textAlign: 'center',
                  fontSize: '0.85rem'
                }}>
                  {apiMessage.text}
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ minWidth: '140px', padding: '0.5rem 2rem', fontSize: '0.85rem', opacity: isLoading ? 0.7 : 1 }}>
                  <LogIn size={16} />
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
          </div>

          <div className="card-footer" style={{ padding: '1rem 1.5rem' }}>
            <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>If you don't have an Account yet? Create One! Its Free!!</p>
            <Link to="/register" style={{ display: 'inline-block' }}>
              <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem' }}>
                Create New Account
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

