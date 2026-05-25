import { API_BASE_URL } from '../config';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, RefreshCw, List, ExternalLink, Image as ImageIcon } from 'lucide-react';



export default function CreateCampaign() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [open, setOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);

  const [varSelections, setVarSelections] = useState({});
  const [restrictLang, setRestrictLang] = useState(false);
  const [scheduleNow, setScheduleNow] = useState(true);

  const [campaignTitle, setCampaignTitle] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplateLoading, setSelectedTemplateLoading] = useState(false);

  const [templatesData, setTemplatesData] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);


  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/templates`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const result = await response.json();
          if (result?.success) {
            setTemplatesData(result.data);
          } else {
            setTemplatesData([]);
          }
        } else {
          throw new Error("Expected JSON response but got something else");
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
        setTemplatesData([]);
      } finally {
        setTemplatesLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleCreateCampaign = async () => {
    if (!selectedTemplate || !campaignTitle || !selectedGroup) {
      alert("Please enter a title, select a template, and choose a group.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/campaign/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: campaignTitle,
          whatsapp_template_id: Number(selectedTemplate?.template_id || 106), // Make sure it's a number
          scheduled_at: scheduleNow ? new Date().toISOString().replace('T', ' ').substring(0, 19) : "2026-03-30 11:00:00",
          contact_group_id: Number(selectedGroup),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          template_data: Object.keys(varSelections).length ? JSON.stringify(varSelections) : ""
        })
      });

      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error("HTTP error");
      }

      if (response.ok && result.success) {
        alert("Campaign created successfully!");
        navigate('/dashboard/campaigns');
      } else {
        alert(result.message || "Failed to create campaign. (Is the template ID valid in the DB?)");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred creating the campaign. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractVariables = (text) => {
    if (!text) return [];
    const matches = [...text.matchAll(/\{\{([^}]+)\}\}/g)];
    return Array.from(new Set(matches.map(m => m[1])));
  };

  const variableOptions = [
    "Choose or Write you own",
    "Contact full name",
    "contact first name",
    "contact last name",
    "contact phone",
    "language code",
    "contact country",
    "contact email",
    "address",
    "website",
    "custom values"
  ];

  const renderVariableInput = (vId, labelContext) => {
    const selected = varSelections[vId] || "Choose or Write you own";
    const isCustom = selected === "custom values";

    return (
      <div key={vId} className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', display: 'block', whiteSpace: 'nowrap' }}>
          Assign content for <span style={{ backgroundColor: '#f1f5f9', padding: '0.15rem 0.4rem', margin: '0 0.2rem', borderRadius: '4px', fontWeight: 600, color: '#1e293b' }}>{`{{${labelContext}}}`}</span> variable
        </label>
        <div style={{ position: 'relative', marginBottom: isCustom ? '0.5rem' : 0 }}>
          <select
            className="form-input"
            style={{ padding: '0.6rem 1rem', appearance: 'none', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', cursor: 'pointer' }}
            value={selected}
            onChange={(e) => setVarSelections({ ...varSelections, [vId]: e.target.value })}
          >
            {variableOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
        </div>
        {isCustom && (
          <input
            type="text"
            className="form-input"
            placeholder="type to use custom value"
            style={{ padding: '0.6rem 1rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            onChange={(e) => setVarSelections({ ...varSelections, [`${vId}_custom`]: e.target.value })}
          />
        )}
      </div>
    );
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const renderStep1 = () => (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: '#ef4444', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Step 1</h3>

      {selectedTemplateLoading ? (
        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
          Loading template...
        </div>
      ) : !selectedTemplate ? (
        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
          <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select Template</label>

          <div style={{ position: 'relative', maxWidth: '600px', overflow: 'visible' }}>
            <div
              className="form-input"
              onClick={() => setOpen(!open)}
              style={{ padding: '0.75rem 1rem', backgroundColor: '#fff', cursor: 'pointer', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            >
              Select a template...
            </div>

            {open && (
              <div
                style={{
                  position: 'absolute', top: '100%', left: 0, width: '100%',
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px',
                  maxHeight: '160px', overflowY: 'auto', zIndex: 1000, marginTop: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {templatesLoading ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>Loading templates...</div>
                ) : templatesData.map((tpl, idx) => (
                  <div
                    key={idx}
                    onClick={async () => {
                      setSelectedTemplateLoading(true);
                      setOpen(false);

                      const possiblyLoadedTemplate = tpl.template ? tpl.template : tpl;

                      const templateId = tpl._id || tpl.template_id || tpl.id;
                      if (!templateId) {
                        alert('Template ID not available for details fetch');
                        setSelectedTemplate(possiblyLoadedTemplate);
                        setSelectedTemplateLoading(false);
                        setUploadedImage(null);
                        return;
                      }

                      try {
                        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/templates/view/${templateId}`, {
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });

                        if (!response.ok) {
                          throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const contentType = response.headers.get("content-type");
                        if (contentType && contentType.indexOf("application/json") !== -1) {
                          const result = await response.json();
                          const templateObject = result?.data?.__data?.template || result?.data?.template;
                          if (templateObject) {
                            setSelectedTemplate(templateObject);
                          } else {
                            setSelectedTemplate(possiblyLoadedTemplate);
                            alert("Could not load template details from API; using available data.");
                          }
                        } else {
                          throw new Error("Expected JSON response but got something else");
                        }
                      } catch (err) {
                        console.error("Error fetching template details:", err);
                        setSelectedTemplate(possiblyLoadedTemplate);
                        alert("Failed to load template details. Server error.");
                      } finally {
                        setSelectedTemplateLoading(false);
                        setUploadedImage(null);
                      }
                    }}
                    style={{ padding: '10px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                  >
                    <span style={{ fontWeight: 500, color: '#334155' }}>{tpl.template_name || tpl.name || tpl?.template?.name || 'Untitled'}</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({tpl.language || tpl?.template?.language || 'unknown'})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'none', marginBottom: '1.5rem', position: 'relative', marginTop: '1.5rem' }}>
            <div style={{ position: 'absolute', top: '-15px', left: '16px', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.2rem 0.6rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Template</span>
              <button
                onClick={() => { setSelectedTemplate(null); setUploadedImage(null); }}
                style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Change
              </button>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>{selectedTemplate.template_name || selectedTemplate.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem' }}>Language Code: <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedTemplate.language}</span></div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Category: <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedTemplate.category}</span></div>
            </div>
          </div>

          {(selectedTemplate.components || []).map((c, idx) => {
            if (!c) return null;
            if (c.type === 'HEADER') {
              const vars = extractVariables(c.text);
              const isMedia = c.format === 'IMAGE' || c.format === 'DOCUMENT' || c.format === 'VIDEO';
              return (
                <div key={`header-${idx}`} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none', marginBottom: '1rem', position: 'relative', marginTop: '1.5rem' }}>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, position: 'absolute', top: '-15px', left: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.2rem 0.6rem' }}>
                    Header
                  </div>
                  {!isMedia && c.text && (
                    <div style={{ marginBottom: vars.length > 0 ? '1.5rem' : 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: '1.5', fontWeight: 600 }}>
                      {c.text.split(/(\{\{[^}]+\}\})/g).map((part, i) =>
                        part.startsWith('{{') && part.endsWith('}}') ?
                          <span key={i} style={{ backgroundColor: '#fef3c7', padding: '0.1rem 0.3rem', borderRadius: '3px', fontWeight: 600 }}>{part}</span> :
                          part
                      )}
                    </div>
                  )}
                  {isMedia && (
                    <div style={{ marginBottom: vars.length > 0 ? '1.5rem' : 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Select {c.format === 'IMAGE' ? 'Image' : c.format === 'VIDEO' ? 'Video' : 'Document'}</label>
                      <div
                        style={{ backgroundColor: '#f8fafc', width: '240px', height: '120px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#64748b', fontSize: '0.85rem', border: '2px dashed #cbd5e1', overflow: 'hidden' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept={c.format === 'IMAGE' ? 'image/*' : c.format === 'VIDEO' ? 'video/*' : '*/*'} onChange={handleImageUpload} />
                        {uploadedImage && c.format === 'IMAGE' ? (
                          <img src={uploadedImage} alt="Uploaded image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : uploadedImage ? (
                          <span style={{ color: '#22c55e', fontWeight: 600 }}>Media Selected</span>
                        ) : (
                          `Select ${c.format === 'IMAGE' ? 'Image' : c.format === 'VIDEO' ? 'Video' : 'Document'}`
                        )}
                      </div>
                    </div>
                  )}
                  {vars.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 1rem' }}>
                      {vars.map(v => renderVariableInput(`header-${idx}-${v}`, v))}
                    </div>
                  )}
                </div>
              );
            }
            if (c.type === 'BODY') {
              const vars = extractVariables(c.text);
              return (
                <div key={`body-${idx}`} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none', marginBottom: '1rem', position: 'relative', marginTop: '1.5rem' }}>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, position: 'absolute', top: '-15px', left: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.2rem 0.6rem' }}>
                    Body
                  </div>
                  <div style={{ marginBottom: vars.length > 0 ? '1.5rem' : 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: '1.5' }}>
                    {c.text.split(/(\{\{[^}]+\}\})/g).map((part, i) =>
                      part.startsWith('{{') && part.endsWith('}}') ?
                        <span key={i} style={{ backgroundColor: '#fef3c7', padding: '0.1rem 0.3rem', borderRadius: '3px', fontWeight: 600 }}>{part}</span> :
                        part
                    )}
                  </div>
                  {vars.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 1rem' }}>
                      {vars.map(v => renderVariableInput(`body-${idx}-${v}`, v))}
                    </div>
                  )}
                </div>
              );
            }
            if (c.type === 'BUTTONS') {
              const uButtons = c.buttons.filter(b => b.type === 'URL' && b.url);
              const buttonsWithVars = uButtons.map(b => ({ btn: b, vars: extractVariables(b.url) })).filter(item => item.vars.length > 0);
              if (buttonsWithVars.length > 0) {
                return (
                  <div key={`btn-${idx}`} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none', marginBottom: '1rem', position: 'relative', marginTop: '1.5rem' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, position: 'absolute', top: '-15px', left: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.2rem 0.6rem' }}>
                      Buttons
                    </div>
                    {buttonsWithVars.map((item, bidx) => (
                      <div key={bidx} style={{ marginBottom: bidx < buttonsWithVars.length - 1 ? '1.5rem' : 0 }}>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>{item.btn.text} - {item.btn.url}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 1rem' }}>
                          {item.vars.map(v => renderVariableInput(`btn-${idx}-${bidx}-${v}`, v))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
            }
            return null;
          })}
        </>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3 style={{ color: '#ef4444', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Step 2</h3>

      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none', position: 'relative', marginTop: '1.5rem' }}>
        <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, position: 'absolute', top: '-15px', left: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.2rem 0.6rem' }}>
          Contacts and Schedule
        </div>

        <div className="form-group" style={{ marginBottom: '1.2rem' }}>
          <label className="form-label" style={{ fontSize: '0.85rem', color: '#64748b' }}>Campaign Title</label>
          <input
            type="text"
            className="form-input"
            style={{ backgroundColor: '#ffffff', padding: '0.6rem 1rem', border: '1px solid #cbd5e1' }}
            value={campaignTitle}
            onChange={(e) => setCampaignTitle(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.2rem' }}>
          <label className="form-label" style={{ fontSize: '0.85rem', color: '#64748b' }}>Groups/Contact</label>
          <div style={{ position: 'relative' }}>
            <select
              className="form-input"
              style={{ padding: '0.6rem 1rem', appearance: 'none', backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }}
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="">Select a Group...</option>
              <option value="1">First Visitors (example)</option>
              <option value="2">Mayilo Premium Offer</option>
              <option value="3">COD</option>
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.2rem' }}>
          <label className="form-label" style={{ fontSize: '0.85rem', color: '#64748b' }}>Labels/Tags</label>
          <input type="text" className="form-input" placeholder="Select Labels" style={{ backgroundColor: '#ffffff', padding: '0.6rem 1rem', border: '1px solid #cbd5e1' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', cursor: 'pointer' }} onClick={() => setRestrictLang(!restrictLang)}>
          <div style={{ width: '40px', height: '24px', borderRadius: '12px', backgroundColor: restrictLang ? '#22c55e' : '#e2e8f0', position: 'relative', transition: 'background-color 0.2s' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', left: restrictLang ? '18px' : '2px', top: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }}></div>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b', userSelect: 'none' }}>Restrict by Language Code - Send only to the contacts whose language code matches with template language code.</span>
        </div>

        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, position: 'absolute', top: '-15px', left: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.2rem 0.6rem' }}>Schedule</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', width: 'fit-content' }} onClick={() => setScheduleNow(!scheduleNow)}>
            <div style={{ width: '40px', height: '24px', borderRadius: '12px', backgroundColor: scheduleNow ? '#f59e0b' : '#e2e8f0', position: 'relative', transition: 'background-color 0.2s' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', left: scheduleNow ? '18px' : '2px', top: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }}></div>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, userSelect: 'none' }}>Now</span>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontSize: '0.85rem', color: '#64748b' }}>Send using Phone Number</label>
          <div style={{ position: 'relative', maxWidth: '500px' }}>
            <select className="form-input" style={{ padding: '0.6rem 1rem', appearance: 'none', backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }}>
              <option>+91 99520 43116</option>
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
          </div>
        </div>

        <button
          className="btn btn-primary"
          disabled={isSubmitting}
          onClick={handleCreateCampaign}
          style={{ backgroundColor: '#22c55e', width: 'auto', padding: '0.7rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? 'Scheduling...' : 'Schedule Campaign'}
        </button>

      </div>
    </div>
  );

  const renderMessagePreview = () => {
    if (selectedTemplateLoading || !selectedTemplate) {
      return (
        <div style={{ flexShrink: 0, width: '480px' }}>
          <div className="card" style={{ padding: '2rem 1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '1.5rem' }}>
            <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
              {selectedTemplateLoading ? 'Loading template preview...' : 'Please select a template to preview.'}
            </div>
          </div>
        </div>
      );
    }

    const components = selectedTemplate.components || [];

    return (
      <div style={{ flexShrink: 0, width: '480px' }}>
        <div className="card" style={{ padding: '0', border: '1px solid #e2e8f0', boxShadow: 'none', position: 'relative', marginTop: '1.5rem', overflow: 'visible', borderRadius: '8px' }}>
          <div style={{ position: 'absolute', top: '-15px', left: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.3rem 0.8rem', zIndex: 10 }}>
            <span style={{ color: '#818cf8', fontSize: '0.85rem', fontWeight: 600 }}>Message Preview</span>
          </div>

          <div style={{ padding: '2rem 1.5rem 1.5rem', backgroundColor: '#ffffff', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover', display: 'flex', justifyContent: 'center', minHeight: '250px' }}>
                <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '8px', borderTopLeftRadius: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)', width: '100%', alignSelf: 'flex-start' }}>
                  {components.map((c, i) => {
                    if (!c) return null;
                    if (c.type === 'HEADER' && c.format === 'IMAGE') {
                      const placeholderSVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' preserveAspectRatio='xMidYMid slice' viewBox='0 0 24 24' fill='%23e2e8f0'%3E%3Crect width='24' height='24' fill='%23cbd5e1' /%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z' fill='%2394a3b8'/%3E%3Ccircle cx='8' cy='8' r='2' fill='%2394a3b8'/%3E%3C/svg%3E";
                      const imgSrc = uploadedImage || c.example?.header_handle?.[0] || placeholderSVG;
                      return <img key={i} src={imgSrc} alt="Header" style={{ width: '100%', borderRadius: '4px', marginBottom: '0.5rem', objectFit: 'cover', aspectRatio: '1.5/1' }} onError={(e) => { e.target.onerror = null; e.target.src = placeholderSVG; }} />;
                    }
                    if (c.type === 'HEADER' && c.format === 'TEXT') {
                      return <div key={i} style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#111b21', whiteSpace: 'nowrap' }}>{c.text}</div>;
                    }
                    if (c.type === 'BODY') {
                      return <div key={i} style={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'pre-wrap', marginBottom: '0.5rem', wordBreak: 'break-word', lineHeight: '1.5' }}>{c.text}</div>;
                    }
                    if (c.type === 'BUTTONS') {
                      return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.5rem', borderTop: '1px solid #e9edef', paddingTop: '0.5rem' }}>
                          {(c.buttons || []).map((b, bi) => (
                            <div key={bi} style={{ color: '#0ea5e9', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, padding: '0.4rem 0' }}>
                              {b.type === 'URL' ? <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem' }}><ExternalLink size={14} /> {b.text}</span> : b.text}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0.8rem 1.5rem', backgroundColor: '#94a3b8', color: 'white', fontSize: '0.75rem', fontWeight: 600, borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
            Please note: Words like {`{{1}}`}, {`{{abc}}`} etc are dynamic variables and will be replaced based on your selections.
          </div>
        </div>
      </div>

    );
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', backgroundColor: '#ffffff', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--wa-green)', margin: 0 }}>
          Create New Campaign
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', cursor: 'pointer' }}>
            <RefreshCw size={14} />
            Sync WhatsApp Templates
          </button>
          <button
            className="btn btn-primary"
            style={{ backgroundColor: '#1e293b', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', cursor: 'pointer' }}
            onClick={() => navigate('/dashboard/campaigns')}
          >
            <List size={14} />
            Manage Campaigns
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Form Area */}
        <div style={{ flex: 1 }}>
          {renderStep1()}
          {selectedTemplate && renderStep2()}
        </div>

        {/* Right Preview Area */}
        {selectedTemplate && renderMessagePreview()}
      </div>

    </div>
  );
}


