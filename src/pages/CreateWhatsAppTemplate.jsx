import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  ExternalLink,
  Smartphone,
  Copy,
  MessageSquare,
  X,
  Image as ImageIcon,
  Play,
  FileText,
  MapPin,
  Upload,
  Phone,
  Link as LinkIcon,
  Reply,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function CreateWhatsAppTemplate() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showAllButtons, setShowAllButtons] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    language: 'en',
    category: 'MARKETING',
    headerType: 'NONE',
    headerText: '',
    headerVariableExample: '',
    bodyText: '',
    footerText: '',
    buttons: []
  });

  const [headerFile, setHeaderFile] = useState(null);
  const [headerFilePreview, setHeaderFilePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeaderFile(file);
      if (file.type.startsWith('image/')) {
        setHeaderFilePreview(URL.createObjectURL(file));
      } else {
        setHeaderFilePreview(null);
      }
    }
  };

  const addHeaderVariable = () => {
    setFormData(prev => ({ ...prev, headerText: prev.headerText + ` {{1}}` }));
  };

  const addBodyVariable = () => {
    const varCount = (formData.bodyText.match(/\{\{\d+\}\}/g) || []).length + 1;
    setFormData(prev => ({ ...prev, bodyText: prev.bodyText + ` {{${varCount}}}` }));
  };

  const addButton = (type) => {
    if (formData.buttons.length >= 10) return;
    const newButton = { type, text: '', phone: '', url: '', example: '' };
    setFormData(prev => ({ ...prev, buttons: [...prev.buttons, newButton] }));
  };

  const updateButton = (index, field, value) => {
    const updated = [...formData.buttons];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, buttons: updated }));
  };

  const removeButton = (index) => {
    setFormData(prev => ({ ...prev, buttons: prev.buttons.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.language) {
      alert("Please fill in the template name and language.");
      return;
    }

    setLoading(true);
    const components = [];

    if (formData.headerType !== 'NONE') {
      const headerComp = { type: 'HEADER', format: formData.headerType };
      if (formData.headerType === 'TEXT') {
        headerComp.text = formData.headerText;
        if (formData.headerText.includes('{{1}}')) {
          headerComp.example = { header_text: [formData.headerVariableExample] };
        }
      } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(formData.headerType)) {
        headerComp.example = { header_handle: [""] };
      }
      components.push(headerComp);
    }

    components.push({ type: 'BODY', text: formData.bodyText });
    if (formData.footerText) components.push({ type: 'FOOTER', text: formData.footerText });

    if (formData.buttons.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: formData.buttons.map(btn => {
          const b = { type: btn.type === 'DYNAMIC_URL' ? 'URL' : btn.type, text: btn.text };
          if (btn.type === 'PHONE_NUMBER') b.phone_number = btn.phone;
          if (btn.type === 'URL' || btn.type === 'DYNAMIC_URL') b.url = btn.url;
          if (btn.type === 'COPY_CODE') b.example = [btn.example];
          return b;
        })
      });
    }

    try {
      const response = await fetch(`http://52.66.85.100:3000/api/whatsapp/templates/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ name: formData.name, category: formData.category, language: formData.language, components: components })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        alert("Template created successfully!");
        navigate('/dashboard/whatsapp-templates');
      } else {
        if (result.message && result.message.includes("WABA")) {
          alert("Setup Incomplete: " + result.message + ". Please go to Settings to complete your WhatsApp integration.");
        } else {
          alert(result.message || "Failed to create template");
        }
      }
    } catch (error) {
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const renderedButtons = showAllButtons ? formData.buttons : formData.buttons.slice(0, 2);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--wa-green)', margin: 0 }}>Create New Template</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-top-slate" onClick={() => navigate('/dashboard/whatsapp-templates')}>Back to Templates</button>
          <button className="btn-top-navy">Help</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label-gray">Template Name</label>
            <input type="text" name="name" className="form-input-white" placeholder="Enter template name..." value={formData.name} onChange={handleChange} />
            <span style={{ color: 'var(--wa-green)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem', display: 'block' }}>Template Formatting Help</span>
          </div>

          <div className="form-group">
            <label className="form-label-gray">Template Language Code</label>
            <select name="language" className="form-input-white" value={formData.language} onChange={handleChange}>
              <option value="en">English (en)</option>
              <option value="hi">Hindi (hi)</option>
            </select>
          </div>

          <div style={{ backgroundColor: '#64748b', color: '#f8fafc', padding: '1rem 1.5rem 2.25rem', borderRadius: '6px', fontSize: '0.85rem', position: 'relative', marginBottom: '1.5rem', lineHeight: '1.4' }}>
            While Authentication and Flow templates are supported for sending however you need to create/edit those templates on Meta.
            <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: '#94a3b8', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
              Manage Templates on Meta <ExternalLink size={12} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label-gray">Category</label>
            <select name="category" className="form-input-white" value={formData.category} onChange={handleChange}>
              <option value="MARKETING">MARKETING</option>
              <option value="UTILITY">UTILITY</option>
            </select>
          </div>

          <div className="section-container">
            <div className="section-badge">Header (Optional)</div>
            <div className="form-group">
              <label className="form-label-gray">Header Type</label>
              <select name="headerType" className="form-input-white" value={formData.headerType} onChange={handleChange}>
                <option value="NONE">None</option>
                <option value="TEXT">Text</option>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="DOCUMENT">Document</option>
                <option value="LOCATION">Location</option>
              </select>

              {formData.headerType === 'TEXT' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <label className="form-label-gray">Header Text</label>
                  <div style={{ position: 'relative' }}>
                    <input type="text" name="headerText" className="form-input-white" placeholder={"{{1}}"} value={formData.headerText} onChange={handleChange} />
                    <button type="button" onClick={addHeaderVariable} className="btn-add-var-small">+ Add Variable</button>
                  </div>
                  <label className="form-label-gray" style={{ marginTop: '1.5rem' }}>Header Text Variable Example</label>
                  <input type="text" name="headerVariableExample" className="form-input-white" placeholder={"Example value for {{1}}"} value={formData.headerVariableExample} onChange={handleChange} />
                </div>
              )}

              {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(formData.headerType) && (
                <div onClick={handleFileClick} className="media-selector-box">
                  {headerFilePreview ? <img src={headerFilePreview} alt="Preview" className="media-preview-img" /> : headerFile ? <div className="media-file-info"><FileText size={32} /><span>{headerFile.name}</span></div> : <><Upload size={24} /><span>Select {formData.headerType.toLowerCase()}</span></>}
                </div>
              )}
            </div>
          </div>

          <div className="section-container">
            <div className="section-badge">Body</div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>Enter the text for your message in the language you've selected.</p>
            <label className="form-label-gray">Body Text</label>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <textarea name="bodyText" rows="6" className="form-input-white" style={{ border: 'none', padding: '1rem', width: '100%', resize: 'none' }} value={formData.bodyText} onChange={handleChange}></textarea>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem 1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="formatting-btn"><Bold size={16} /></button>
                <button type="button" className="formatting-btn"><Italic size={16} /></button>
                <button type="button" className="formatting-btn"><Strikethrough size={16} /></button>
                <button type="button" className="formatting-btn"><Code size={16} /></button>
                <button type="button" onClick={addBodyVariable} className="btn-add-var">+ Add Variables</button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label-gray">Footer (Optional)</label>
            <input type="text" name="footerText" className="form-input-white" placeholder="Enter footer text..." value={formData.footerText} onChange={handleChange} />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>Add a short line of text to the bottom of your message template.</p>
          </div>

          <div className="section-container">
            <div className="section-badge">Buttons (Optional)</div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>Create buttons that let customers respond to your message or take action.</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button type="button" onClick={() => addButton('QUICK_REPLY')} className="btn-toolbar-navy"><Reply size={14} style={{ transform: 'scaleX(-1)' }} /> Quick Reply Button</button>
              <button type="button" onClick={() => addButton('PHONE_NUMBER')} className="btn-toolbar-navy"><Phone size={14} /> Phone Number Button</button>
              <button type="button" onClick={() => addButton('COPY_CODE')} className="btn-toolbar-navy"><Copy size={14} /> Copy Code Button</button>
              <button type="button" onClick={() => addButton('URL')} className="btn-toolbar-navy"><ExternalLink size={14} /> URL Button</button>
              <button type="button" onClick={() => addButton('DYNAMIC_URL')} className="btn-toolbar-navy"><ExternalLink size={14} /> Dynamic URL Button</button>
            </div>

            {formData.buttons.map((btn, i) => (
              <div key={i} className="button-card">
                <div className="button-card-header">
                  <span>{btn.type.replace(/_/g, ' ')}</span>
                  <X size={18} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeButton(i)} />
                </div>
                <div className="button-card-body">
                  {btn.type !== 'COPY_CODE' && (
                    <div className="form-group">
                      <label className="form-label-gray">Button Text</label>
                      <div className="input-with-icon">
                        <span className="input-icon-label">A</span>
                        <input type="text" className="form-input-bare" placeholder="Enter button text" value={btn.text} onChange={(e) => updateButton(i, 'text', e.target.value)} />
                      </div>
                    </div>
                  )}
                  {btn.type === 'PHONE_NUMBER' && (
                    <div className="form-group">
                      <label className="form-label-gray">Phone Number</label>
                      <div className="input-with-icon">
                        <Phone size={16} className="input-icon" />
                        <input type="text" className="form-input-bare" placeholder="Enter phone number" value={btn.phone} onChange={(e) => updateButton(i, 'phone', e.target.value)} />
                      </div>
                    </div>
                  )}
                  {(btn.type === 'URL' || btn.type === 'DYNAMIC_URL') && (
                    <div className="form-group">
                      <label className="form-label-gray">Website URL</label>
                      <div className="input-with-icon">
                        <LinkIcon size={16} className="input-icon" />
                        <input type="text" className="form-input-bare" placeholder="https://..." value={btn.url} onChange={(e) => updateButton(i, 'url', e.target.value)} />
                        {btn.type === 'DYNAMIC_URL' && <span className="input-suffix">{"{{1}}"}</span>}
                      </div>
                    </div>
                  )}
                  {(btn.type === 'COPY_CODE' || btn.type === 'DYNAMIC_URL') && (
                    <div className="form-group">
                      <label className="form-label-gray">Example</label>
                      <input type="text" className="form-input-white" placeholder="Enter example value" value={btn.example} onChange={(e) => updateButton(i, 'example', e.target.value)} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} className="btn-submit" disabled={loading}>{loading ? '...' : 'Submit'}</button>
        </div>

        {/* PREVIEW SIDE (MATCHING IMAGE) */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '1.5rem' }}>Template Preview</h3>
          <div className="wa-preview-bg">
            <div className="wa-bubble-container">
              <div className="wa-bubble-content">
                {formData.headerType === 'TEXT' && (formData.headerText || formData.headerVariableExample) && (
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem', color: '#334155' }}>
                    {formData.headerText.replace('{{1}}', formData.headerVariableExample || '{{1}}')}
                  </div>
                )}
                {formData.headerType === 'IMAGE' && <div className="wa-media-placeholder">{headerFilePreview ? <img src={headerFilePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={40} color="#94a3b8" />}</div>}
                {formData.headerType === 'VIDEO' && <div className="wa-media-placeholder"><Play size={40} color="#94a3b8" /></div>}
                {formData.headerType === 'DOCUMENT' && <div className="wa-media-placeholder"><FileText size={40} color="#94a3b8" /></div>}
                {formData.headerType === 'LOCATION' && <div className="wa-media-placeholder"><MapPin size={40} color="#94a3b8" /></div>}

                <div style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: '#334155', marginBottom: '0.5rem' }}>
                  {formData.bodyText || <span style={{ color: '#94a3b8' }}>Body text...</span>}
                </div>
                {formData.footerText && <div style={{ fontSize: '0.75rem', color: '#667781', marginTop: '0.5rem' }}>{formData.footerText}</div>}
              </div>

              {/* BUTTONS INSIDE BUBBLE WITH SEPARATORS */}
              {renderedButtons.map((btn, i) => (
                <div key={i} className="wa-btn-row">
                  {btn.type === 'QUICK_REPLY' && <Reply size={16} className="wa-btn-icon" style={{ transform: 'scaleX(-1)' }} />}
                  {btn.type === 'PHONE_NUMBER' && <Phone size={16} className="wa-btn-icon" />}
                  {btn.type === 'COPY_CODE' && <Copy size={16} className="wa-btn-icon" />}
                  {(btn.type === 'URL' || btn.type === 'DYNAMIC_URL') && <ExternalLink size={16} className="wa-btn-icon" />}
                  <span className="wa-btn-text">{btn.text || (btn.type === 'COPY_CODE' ? 'Copy Code' : btn.type.replace(/_/g, ' '))}</span>
                </div>
              ))}

              {/* SEE ALL OPTIONS TOGGLE */}
              {formData.buttons.length > 2 && (
                <div className="wa-btn-row" onClick={() => setShowAllButtons(!showAllButtons)} style={{ cursor: 'pointer', color: '#00a884', fontWeight: 600 }}>
                  {showAllButtons ? (
                    <><ChevronUp size={16} className="wa-btn-icon" /> Show less</>
                  ) : (
                    <><MessageSquare size={16} className="wa-btn-icon" /> See all options</>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .form-label-gray { display: block; font-size: 0.9rem; color: #64748b; margin-bottom: 0.5rem; font-weight: 500; }
        .form-input-white { width: 100%; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 4px; background: white; font-size: 0.95rem; outline: none; }
        .section-container { position: relative; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2.25rem 1.5rem 1.5rem; margin-top: 1rem; }
        .section-badge { position: absolute; top: -14px; left: 1.5rem; background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.8rem; font-weight: 700; color: #475569; }
        .formatting-btn { background: #475569; color: white; border: none; border-radius: 4px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .btn-add-var { background: #0f172a; color: white; border: none; padding: 0.4rem 1rem; border-radius: 4px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
        .btn-add-var-small { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: #475569; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
        .btn-toolbar-navy { background: #0f172a; color: white; border: none; padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
        .btn-submit { background: #22c55e; color: white; border: none; padding: 0.75rem 2rem; border-radius: 4px; font-weight: 700; cursor: pointer; width: 140px; margin-top: 1rem; }
        .btn-top-slate { background: #475569; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 4px; font-weight: 700; cursor: pointer; }
        .btn-top-navy { background: #0f172a; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 4px; font-weight: 700; cursor: pointer; }
        .media-selector-box { margin-top: 1.5rem; height: 140px; background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; fontSize: 0.9rem; cursor: pointer; overflow: hidden; }
        .media-preview-img { width: 100%; height: 100%; object-fit: cover; }
        
        .button-card { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 1rem; background: white; }
        .button-card-header { background: #f8fafc; padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-weight: 600; color: #334155; }
        .button-card-body { padding: 1rem; }
        .input-with-icon { display: flex; align-items: center; border: 1px solid #e2e8f0; border-radius: 4px; padding: 0 1rem; background: white; }
        .input-icon-label { font-weight: 900; color: #94a3b8; font-size: 1.1rem; border-right: 1px solid #e2e8f0; padding-right: 0.75rem; margin-right: 0.75rem; }
        .input-icon { color: #94a3b8; border-right: 1px solid #e2e8f0; padding-right: 0.75rem; margin-right: 0.75rem; }
        .form-input-bare { flex: 1; border: none; padding: 0.75rem 0; font-size: 0.95rem; outline: none; }
        
        .wa-preview-bg { background-color: #efeae2; background-image: url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png"); background-size: cover; padding: 2rem; border-radius: 16px; border: 1px solid #e2e8f0; }
        .wa-bubble-container { background: white; border-radius: 12px; border-top-left-radius: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 340px; overflow: hidden; }
        .wa-bubble-content { padding: 1rem; }
        .wa-media-placeholder { width: 100%; height: 160px; background: #f1f5f9; border-radius: 8px; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        
        /* New Button Row Styles to match image */
        .wa-btn-row { padding: 0.75rem; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: center; gap: 0.6rem; transition: background 0.2s; }
        .wa-btn-icon { color: #00a884; }
        .wa-btn-text { color: #00a884; font-weight: 600; font-size: 0.9rem; }
      `}</style>
    </div>
  );
}
