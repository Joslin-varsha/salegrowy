import { API_BASE_URL } from '../config';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { X, ChevronDown } from 'lucide-react';



export default function CreateContact() {

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    mobile: '',
    language: '',
    email: '',
    groups: '',
    tags: [],
    address: '',
    website: ''
  });

  const [errors, setErrors] = useState({});
  const [groups, setGroups] = useState([]);
  const [countries, setCountries] = useState([]);
  const [labels, setLabels] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const passedContact = location.state?.contact;

  const [tagInputs, setTagInputs] = useState(['']);

  const handleTagChange = (index, value) => {
    const updated = [...tagInputs];
    updated[index] = value;
    setTagInputs(updated);

    setFormData({
      ...formData,
      tags: updated.filter(tag => tag.trim() !== '')
    });
  };

  const addNewTagInput = () => {
    setTagInputs([...tagInputs, '']);
  };

  const removeTagInput = (index) => {
    if (tagInputs.length === 1) return;

    const updated = tagInputs.filter((_, i) => i !== index);
    setTagInputs(updated);

    setFormData({
      ...formData,
      tags: updated.filter(tag => tag.trim() !== '')
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.firstName) newErrors.firstName = "First name required";
    if (!formData.lastName) newErrors.lastName = "Last name required";

    if (!id) {
      if (!formData.mobile) {
        newErrors.mobile = "Mobile required";
      } else if (!/^[0-9]{12}$/.test(formData.mobile)) {
        newErrors.mobile = "Must be 12 digits with country code";
      }
    }

    if (!formData.email) {
      newErrors.email = "Email required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }

    if (!formData.language) {
      newErrors.language = "Language code required";
    }

    if (!formData.groups) {
      newErrors.groups = "Group required";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();

    // ✅ STEP 1: Validate first
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // ✅ STEP 2: Ensure tags is always array
      const tagsArray = Array.isArray(formData.tags)
        ? formData.tags
        : [];


      // ✅ Get unique tags from form data
      const uniqueTags = [...new Set(tagsArray)];

      // ✅ STEP 4: Create or update contact
      const url = id 
        ? `${import.meta.env.VITE_API_URL}/api/contact/update/${id}`
        : `${import.meta.env.VITE_API_URL}/api/contact/add`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          language_code: formData.language,
          phone_number: formData.mobile,
          email: formData.email,
          whatsapp_opt_out: optOut ? "1" : "0",
          disable_ai_bot: "0",
          countries__id: formData.country || "91",
          contact_tags: id ? uniqueTags : [],
          newTag: uniqueTags,
          groups: formData.groups,
          contact_groups: [formData.groups],
          custom_input_fields: {}
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`Contact ${id ? 'Updated' : 'Added'} Successfully ✅`);
        navigate('/dashboard/contacts');
      } else {
        alert(result.message);
      }

    } catch (error) {
      console.error(error);
    }
  };

  const [optOut, setOptOut] = useState(false);


  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/contact/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ page: 1, limit: 100 })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGroups(data.data);
        }
      });

    fetch(`${import.meta.env.VITE_API_URL}/api/contact/labels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ page: 1, limit: 100 })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLabels(data.data);
        }
      });

    fetch(`${import.meta.env.VITE_API_URL}/api/contact/countries`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('GET failed');
        return res.json();
      })
      .then(data => {
        if (data.success) setCountries(data.data);
        else if (Array.isArray(data)) setCountries(data);
      })
      .catch(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/contact/countries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) setCountries(data.data);
          else if (Array.isArray(data)) setCountries(data);
        }).catch(console.error);
      });

    if (id && passedContact) {
      const contact = passedContact;
      setFormData({
        firstName: contact.first_name || contact.first_Name || '',
        lastName: contact.last_name || contact.last_Name || '',
        country: contact.countries__id || '',
        mobile: contact.phone_number || '',
        language: contact.language_code || '',
        email: contact.email || '',
        groups: (contact.contact_groups && contact.contact_groups[0]) || (Array.isArray(contact.groups) ? (typeof contact.groups[0] === 'object' ? contact.groups[0]._id : contact.groups[0]) : (contact.groups || '')),
        tags: contact.contact_tags ? (typeof contact.contact_tags === 'string' ? contact.contact_tags.split(',') : contact.contact_tags) : (contact.tags ? (typeof contact.tags === 'string' ? contact.tags.split(',') : contact.tags) : []),
        address: contact.address || '',
        website: contact.website || ''
      });
      
      let parsedTags = contact.contact_tags ? (typeof contact.contact_tags === 'string' ? contact.contact_tags.split(',') : contact.contact_tags) : (contact.tags ? (typeof contact.tags === 'string' ? contact.tags.split(',') : contact.tags) : []);
      if (parsedTags.length > 0) {
        setTagInputs(parsedTags);
      }
      setOptOut(contact.whatsapp_opt_out === "1" || contact.whatsapp_opt_out === 1 || contact.marketing === 'Opted Out' || contact.whatsapp_opt_out_text === 'Opted Out');
    }
  }, [id, passedContact]);

  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '650px', width: '100%', padding: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{id ? 'Edit Contact' : 'Add New Contact'}</h2>
          <button
            onClick={() => navigate('/dashboard/contacts')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.5rem' }}>
          <form onSubmit={(e) => e.preventDefault()}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>First Name</label>
                <input type="text" className="form-input" name="firstName" value={formData.firstName} onChange={handleChange} style={{ padding: '0.5rem 0.75rem' }} />
                {errors.firstName && (
                  <div style={{ color: 'red', fontSize: '0.75rem' }}>
                    {errors.firstName}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Last Name</label>
                <input type="text" className="form-input" name="lastName" value={formData.lastName} onChange={handleChange} style={{ padding: '0.5rem 0.75rem' }} />
                {errors.lastName && (
                  <div style={{ color: 'red', fontSize: '0.75rem' }}>
                    {errors.lastName}
                  </div>
                )}
              </div>

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>


              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Country</label>
                <div style={{ position: 'relative' }}>
                  <select className="form-input" name="country" value={formData.country} onChange={handleChange} style={{ padding: '0.5rem 0.75rem', appearance: 'none', backgroundColor: '#ffffff' }}>
                    <option value="">Select</option>
                    {countries.map((c, i) => (
                      <option key={i} value={c._id || c.id || c.name || c.country_name || c}>
                        {c.name || c.country_name || c.title || c.country || c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '0.25rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Mobile Number</label>
                <input type="text" className="form-input" name="mobile"
                  value={formData.mobile}
                  onChange={handleChange} 
                  disabled={!!id}
                  style={{ padding: '0.5rem 0.75rem', backgroundColor: id ? '#f1f5f9' : '#ffffff', cursor: id ? 'not-allowed' : 'text' }} />
                {errors.mobile && (
                  <div style={{ color: 'red', fontSize: '0.75rem' }}>
                    {errors.mobile}
                  </div>
                )}
                <small style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Number should be with country code without 0 or +
                </small>
              </div>

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Language Code</label>
                <input type="text" className="form-input" name="language" value={formData.language} onChange={handleChange} style={{ padding: '0.5rem 0.75rem' }} />
                {errors.language && (
                  <div style={{ color: 'red', fontSize: '0.75rem' }}>
                    {errors.language}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Email</label>
                <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} style={{ padding: '0.5rem 0.75rem' }} />
                {errors.email && (
                  <div style={{ color: 'red', fontSize: '0.75rem' }}>
                    {errors.email}
                  </div>
                )}
              </div>

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Groups</label>
                <select
                  className="form-input"
                  name="groups"
                  value={formData.groups}
                  onChange={handleChange}
                  style={{ padding: '0.5rem 0.75rem', backgroundColor: '#ffffff' }}
                >
                  <option value="">Select Group</option>

                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.title}
                    </option>
                  ))}
                </select>
                {errors.groups && (
                  <div style={{ color: 'red', fontSize: '0.75rem' }}>
                    {errors.groups}
                  </div>
                )}
              </div>


              {/* TAG SECTION ONLY (UPDATED) */}

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  Label/Tags
                </label>

                {tagInputs.map((tag, index) => (
                  <div key={index} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>

                    <select
                      className="form-input"
                      value={tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      style={{ padding: '0.5rem 0.75rem', appearance: 'auto', backgroundColor: '#ffffff', flex: 1 }}
                    >
                      <option value="">Select Label</option>
                      {labels.map((l, i) => (
                        <option key={i} value={l._id || l.id || l.title || l}>
                          {l.title || l.name || l}
                        </option>
                      ))}
                    </select>

                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeTagInput(index)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ✕
                      </button>
                    )}

                  </div>
                ))}

                {/* Add Button */}
                <button
                  type="button"
                  onClick={addNewTagInput}
                  style={{
                    marginTop: '6px',
                    background: 'transparent',
                    color: '#41d873',
                    border: '1px dashed #cbd5f5',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  + Add another tag
                </button>
              </div>




            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div
                onClick={() => setOptOut(!optOut)}
                style={{
                  width: '36px', height: '18px', borderRadius: '9px', cursor: 'pointer', position: 'relative', transition: 'background-color 0.2s',
                  backgroundColor: optOut ? 'var(--wa-green)' : '#e2e8f0'
                }}
              >
                <div style={{
                  width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '2px', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  left: optOut ? '20px' : '2px'
                }}></div>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Opt out Marketing Messages</span>
            </div>

            {/* Sub-tab section */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem', position: 'relative', marginTop: '1rem' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '1rem', backgroundColor: 'white', padding: '0 0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--wa-blue)', fontWeight: 500 }}>
                Other Information
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                <div className="form-group" style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Address</label>
                  <input type="text" className="form-input" name="address" value={formData.address} onChange={handleChange} style={{ padding: '0.5rem 0.75rem' }} />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Website</label>
                  <input type="url" className="form-input" name="website" value={formData.website} onChange={handleChange} style={{ padding: '0.5rem 0.75rem' }} />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
          <button className="btn btn-primary" onClick={handleSubmit} style={{ width: 'auto', padding: '0.5rem 1.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
            Submit
          </button>
          <button
            onClick={() => navigate('/dashboard/contacts')}
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '0.5rem 1.5rem', fontSize: '0.8rem', fontWeight: 600, backgroundColor: '#64748b', color: 'white', border: 'none' }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

