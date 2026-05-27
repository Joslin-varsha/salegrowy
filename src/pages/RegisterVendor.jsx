import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Building, User, Mail, Smartphone, Lock, CheckCircle, UserPlus, CreditCard } from 'lucide-react';
import { encryptData, decryptData } from "../utils/encryption";

export default function RegisterVendor() {
  const location = useLocation();
  const navigate = useNavigate();
  const shopifyTokenId = location.state?.shopifyTokenId || localStorage.getItem('shopifyTokenId');
  const localStorageShopLink = location.state?.localStorageShopLink || localStorage.getItem('localStorageShopLink') || "";

  const [formData, setFormData] = useState({
    company: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.company.trim()) {
      newErrors.company = "Company name required";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile required";
    } else if (!/^[1-9][0-9]{11,12}$/.test(formData.mobile)) {
      newErrors.mobile = "Enter valid mobile with country code";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password required";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setIsLoading(true);
      setApiMessage({ type: '', text: '' });

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: encryptData({
              companyName: formData.company,
              firstName: formData.firstName,
              lastName: formData.lastName,
              username: formData.username,
              email: formData.email,
              mobileNumber: formData.mobile,
              password: formData.password,
              confirmPassword: formData.confirmPassword,
              shopifyTokenId: shopifyTokenId || "4",
              localStorageShopLink: location.state?.localStorageShopLink ? localStorageShopLink : "",
              status: location.state?.localStorageShopLink ? 1 : 0
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
            setApiMessage({ type: 'success', text: 'Registration successful! Redirecting to subscription...' });
            
            // Capture the new vendorId exactly as per your backend response
            const newVendorId = data.data?.vendorId || data.data?._id || data.data?.id;
  
            if (newVendorId) {
               localStorage.setItem('vendor_id', newVendorId);
            }
          
          const token = data.token || data.data?.token
          if (token) {
            localStorage.setItem("token", token);
          }
          // Redirect after 1.5 seconds
          setTimeout(() => {
            navigate('/shopify-subscription', { 
              state: { 
                vendorId: newVendorId || localStorage.getItem('vendor_id'),
                token: token
              } 
            });
          }, 1500);
        } else {
          setApiMessage({ type: 'error', text: data.message || 'Registration failed. Please try again.' });
        }
      } catch (error) {
        console.error("API Error:", error);
        setApiMessage({ type: 'error', text: 'Network error. Please try again later.' });
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <div className="container" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: 'calc(100vh - 75px)' }}>
      <div style={{ maxWidth: '760px', width: '100%' }}>
        <div className="card animate-fade-in">
          <div className="card-header" style={{ padding: '1rem 1.5rem 0.25rem' }}>
            <MessageCircle size={32} color="var(--wa-green)" />
            <h2 style={{ fontSize: '1.2rem' }}>Register as Vendor/Company</h2>
            {shopifyTokenId && (
              <div style={{ 
                marginLeft: 'auto', 
                backgroundColor: '#e1f5fe', 
                color: '#0288d1', 
                padding: '4px 12px', 
                borderRadius: '12px', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                border: '1px solid #b3e5fc'
              }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#0288d1', borderRadius: '50%' }}></div>
                Shopify Integration Active
              </div>
            )}
          </div>

          <div className="card-body" style={{ padding: '1rem 1.5rem 1.5rem' }}>
            <form onSubmit={handleSubmit}>

              <div className="form-group grid-full" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Company/Vendor Name</label>
                <div className="input-wrapper">
                  <Building size={16} className="input-icon" />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your company name" style={{ padding: '0.5rem 1rem 0.5rem 2.5rem' }} />


                </div>
                {errors.company && (
                  <div style={{ color: 'red', fontSize: '0.75rem' }}>
                    {errors.company}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>First Name</label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="First name" style={{ padding: '0.5rem 1rem 0.5rem 2.5rem' }} />


                  </div>
                  {errors.firstName && (
                    <div style={{ color: 'red', fontSize: '0.75rem' }}>
                      {errors.firstName}
                    </div>
                  )}
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Last Name</label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Last name" style={{ padding: '0.5rem 1rem 0.5rem 2.5rem' }} />


                  </div>
                  {errors.lastName && (
                    <div style={{ color: 'red', fontSize: '0.75rem' }}>
                      {errors.lastName}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Username</label>
                  <div className="input-wrapper">
                    <CreditCard size={16} className="input-icon" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Choose a username" style={{ padding: '0.5rem 1rem 0.5rem 2.5rem' }} />


                  </div>
                  {errors.username && (
                    <div style={{ color: 'red', fontSize: '0.75rem' }}>
                      {errors.username}
                    </div>
                  )}
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="your@email.com" style={{ padding: '0.5rem 1rem 0.5rem 2.5rem' }} />


                  </div>
                  {errors.email && (
                    <div style={{ color: 'red', fontSize: '0.75rem' }}>
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group grid-full" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Mobile Number</label>
                <div className="input-wrapper">
                  <Smartphone size={16} className="input-icon" />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Country code + number" style={{ padding: '0.5rem 1rem 0.5rem 2.5rem' }} />


                </div>
                {errors.mobile && (
                  <div style={{ color: 'red', fontSize: '0.75rem' }}>
                    {errors.mobile}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Create password"
                      style={{ padding: '0.5rem 1rem 0.5rem 2.5rem' }} />


                  </div>
                  {errors.password && (
                    <div style={{ color: 'red', fontSize: '0.75rem' }}>
                      {errors.password}
                    </div>
                  )}
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Confirm Password</label>
                  <div className="input-wrapper">
                    <CheckCircle size={16} className="input-icon" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Confirm password" style={{ padding: '0.5rem 1rem 0.5rem 2.5rem' }} />


                  </div>
                  {errors.confirmPassword && (
                    <div style={{ color: 'red', fontSize: '0.75rem' }}>
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>

              {apiMessage.text && (
                <div style={{
                  padding: '1rem',
                  marginTop: '1rem',
                  borderRadius: '4px',
                  backgroundColor: apiMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: apiMessage.type === 'success' ? '#155724' : '#721c24',
                  textAlign: 'center',
                  fontSize: '0.85rem'
                }}>
                  {apiMessage.text}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: 'auto', padding: '0.5rem 2.5rem', fontSize: '0.85rem', opacity: isLoading ? 0.7 : 1 }}>
                  <UserPlus size={16} />
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

