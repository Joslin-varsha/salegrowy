import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

import { Layout, Menu, Input, Select, Button, Tabs, Card, Space, Tag, Typography, Breadcrumb, message, Switch, TimePicker, Modal, Progress } from 'antd';
// import WidgetHome from '../widget/widgethome';
import { 
  UserOutlined, 
  DatabaseOutlined, 
  ThunderboltOutlined, 
  ToolOutlined, 
  FormOutlined, 
  SmileOutlined,
  SendOutlined,
  MessageOutlined,
  PlusOutlined,
  SearchOutlined,
  FileTextOutlined,
  LinkOutlined,
  YoutubeOutlined,
  QuestionCircleOutlined,
  CustomerServiceOutlined,
  LinkedinOutlined,
  ShareAltOutlined,
  GlobalOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined, 
  ArrowLeftOutlined,
  EditOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  SaveOutlined,
  FacebookOutlined,
  WhatsAppOutlined,
  GlobalOutlined as StoreUrlIcon,
  ClockCircleOutlined,
  SettingOutlined,
  CopyOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

import { motion, AnimatePresence } from 'framer-motion';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const BASE_URI = import.meta.env.VITE_BASE_URI;
const VENDOR_ID = localStorage.getItem('vendor_id');


const AIAgent = () => {
  const [activeSidebar, setActiveSidebar] = useState('knowledge');
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [isAiUpdating, setIsAiUpdating] = useState(false);
  const [isWidgetEnabled, setIsWidgetEnabled] = useState(false);
  const [isWidgetUpdating, setIsWidgetUpdating] = useState(false);
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);
  const [isMandatoryTokenDialog, setIsMandatoryTokenDialog] = useState(false);
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [shopifyAccessToken, setShopifyAccessToken] = useState('');
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState(null);
  const [authCode, setAuthCode] = useState('');
  const [shopifyUrl, setShopifyUrl] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const fetchShopifyAccessToken = async (code) => {
    try {
      setIsLoadingToken(true);
      setTokenError(null);
      const response = await axios.post(`${BASE_URI}getAccessTokenShopify`, {
        vendor_id: VENDOR_ID,
        code: code
      });
      if (response.data.status && response.data.data && response.data.data.access_token) {
        setShopifyAccessToken(response.data.data.access_token);
      } else {
        setTokenError(response.data.message || 'Failed to retrieve access token');
      }
    } catch (error) {
      console.error('Error fetching access token:', error);
      setTokenError('An error occurred while fetching the access token');
    } finally {
      setIsLoadingToken(false);
    }
  };

  const fetchAiStatus = async () => {
    try {
      const response = await axios.post(`${BASE_URI}getWidgetAi`, { vendor_id: VENDOR_ID });
      if (response.data.success && response.data.data) {
        setIsAiEnabled(response.data.data.ai_enabled === 1);
        if (response.data.widgetEnabled !== undefined) {
          setIsWidgetEnabled(response.data.widgetEnabled === 1);
        }
      }
    } catch (error) {
      console.error('Error fetching AI status:', error);
    }
  };

  useEffect(() => {
    fetchAiStatus();
    const windowSearch = new URLSearchParams(window.location.search);
    const hashSearch = new URLSearchParams(window.location.hash.split('?')[1] || '');
    if (windowSearch.get('firstPage') === '1' || hashSearch.get('firstPage') === '1') {
      setIsMandatoryTokenDialog(true);
      setShowRedirectDialog(true);
    }
    const code = windowSearch.get('code') || hashSearch.get('code');
    if (code) {
      setAuthCode(code);
      setShowLoadingDialog(true);
      fetchShopifyAccessToken(code);
    }
  }, []);

  const handleSaveShopifyDetailsAndGetToken = async () => {
    if (!shopifyUrl || !clientId || !clientSecret) {
      message.warning('Please fill all fields');
      return;
    }

    try {
      setIsSavingDetails(true);
      const response = await axios.post(`${BASE_URI}storeShopifyDetails`, {
        vendor_id: VENDOR_ID,
        client_id: clientId,
        client_secret: clientSecret,
        shop_url: shopifyUrl
      });
      
      if (response.data.status) {
        handleGetToken();
      } else {
        message.error(response.data.message || 'Failed to save Shopify details');
        setIsSavingDetails(false);
      }
    } catch (error) {
      console.error('Error saving Shopify details:', error);
      message.error('An error occurred while saving details');
      setIsSavingDetails(false);
    }
  };

  const handleGetToken = () => {
    if (!shopifyUrl || !clientId || !clientSecret) {
      message.warning('Please fill all fields');
      return;
    }

    let shopDomain = shopifyUrl.trim();
    if (shopDomain.startsWith('http://') || shopDomain.startsWith('https://')) {
      try {
        shopDomain = new URL(shopDomain).hostname;
      } catch (e) {}
    }

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('firstPage');
    
    const hashParts = currentUrl.hash.split('?');
    if (hashParts.length > 1) {
      const hashParams = new URLSearchParams(hashParts[1]);
      hashParams.delete('firstPage');
      const newHashSearch = hashParams.toString();
      currentUrl.hash = newHashSearch ? `${hashParts[0]}?${newHashSearch}` : hashParts[0];
    }

    const redirectUri = encodeURIComponent(currentUrl.toString());
    const authUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${clientId}&scope=read_products,write_products&redirect_uri=${redirectUri}`;
    console.log("authUrl", authUrl);
    window.location.href = authUrl;
  };

  const toggleAiStatus = async () => {
    const newStatus = !isAiEnabled;
    setIsAiUpdating(true);
    try {
      const response = await axios.post(`${BASE_URI}enableDisableWidgetAi`, {
        vendor_id: VENDOR_ID,
        status: newStatus ? 1 : 0
      });
      if (response.data.success) {
        setIsAiEnabled(newStatus);
        message.success(`AI Agent ${newStatus ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error updating AI status:', error);
      message.error('Failed to update AI status');
    } finally {
      setIsAiUpdating(false);
    }
  };

  const toggleWidgetStatus = async () => {
    const newStatus = !isWidgetEnabled;
    setIsWidgetUpdating(true);
    try {
      const response = await axios.post(`${BASE_URI}widgetToggle`, {
        vendor_id: VENDOR_ID,
        extension: newStatus ? 1 : 0
      });
      if (response.data.success || response.data.status || response.data.success === undefined) {
        setIsWidgetEnabled(newStatus);
        message.success(`Widget ${newStatus ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error updating Widget status:', error);
      message.error('Failed to update Widget status');
    } finally {
      setIsWidgetUpdating(false);
    }
  };
  // Sidebar Menu Items
  const menuItems = [
    // {
    //   key: 'persona',
    //   icon: <UserOutlined />,
    //   label: 'AI PERSONA',
    //   description: 'How the Agent talks and acts',
    // },
    {
      key: 'knowledge',
      icon: <DatabaseOutlined />,
      label: 'KNOWLEDGE BASE',
      description: 'Train Agent for context aware replies',
    },
    {
      key: 'actions',
      icon: <ThunderboltOutlined />,
      label: 'ACTIONS',
      description: 'Set conditions for replies and tasks',
    },
    
    {
      key: 'stop_contacts',
      icon: <ClockCircleOutlined />,
      label: 'AI STOP CONTACTS',
      description: 'Contacts where AI is stopped for 24h',
    },

    {
      key: 'widget',
      icon: <SettingOutlined />,
      label: 'WIDGET SETTINGS',
      description: 'Customize and install your chat widget',
    },
    // {
    //   key: 'tools',
    //   icon: <ToolOutlined />,
    //   label: 'TOOLS',
    //   description: 'Extend your Agent\'s capabilities',
    // },
  ];

  const renderContent = () => {
    switch (activeSidebar) {
      // case 'persona':
      //   return <AIPersonaContent />;
      case 'knowledge':
        return <KnowledgeBaseContent setShowRedirectDialog={setShowRedirectDialog} />;
      case 'actions':
        return <ActionsContent />;
      case 'widget':
        return <WidgetHome embedded={true} />;
      case 'stop_contacts':
        return <AiStopContactsContent />;
      default:
        return <div style={{ padding: 40, textAlign: 'center' }}>Coming Soon: {activeSidebar}</div>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Modal
        open={showLoadingDialog}
        closable={!isLoadingToken}
        onCancel={() => setShowLoadingDialog(false)}
        maskClosable={false}
        keyboard={false}
        centered
        footer={!isLoadingToken && !tokenError ? [
          <Button key="close" onClick={() => setShowLoadingDialog(false)}>
            Close
          </Button>
        ] : tokenError && !isLoadingToken ? [
          <Button key="close" onClick={() => setShowLoadingDialog(false)}>
            Close
          </Button>,
          <Button 
            key="retry" 
            type="primary" 
            style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
            onClick={() => fetchShopifyAccessToken(authCode)}
          >
            Retry
          </Button>
        ] : null}
        maskStyle={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.45)'
        }}
      >
        {isLoadingToken ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <SyncOutlined spin style={{ fontSize: 40, color: '#16a34a', marginBottom: 16 }} />
            <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Loading</Title>
            <Text type="secondary">Please wait while we retrieve your access token...</Text>
          </div>
        ) : tokenError ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <CloseCircleOutlined style={{ fontSize: 48, color: '#ef4444', marginBottom: 16 }} />
            <Title level={4} style={{ margin: 0, color: '#1e293b', marginBottom: 16 }}>Failed to Get Token</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16, color: '#ef4444' }}>
              {tokenError}
            </Text>
          </div>
        ) : shopifyAccessToken ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#16a34a', marginBottom: 16 }} />
            <Title level={4} style={{ margin: 0, color: '#1e293b', marginBottom: 16 }}>Access Token Generated</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Your Shopify access token has been generated successfully.
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <Input value={shopifyAccessToken} readOnly bordered={false} style={{ background: 'transparent' }} />
              <Button 
                type="text" 
                icon={<CopyOutlined />} 
                onClick={() => {
                  navigator.clipboard.writeText(shopifyAccessToken);
                  message.success('Access token copied to clipboard');
                }}
              />
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        title="Create Shopify Token"
        open={showRedirectDialog}
        onCancel={() => !isMandatoryTokenDialog && setShowRedirectDialog(false)}
        closable={!isMandatoryTokenDialog}
        maskClosable={!isMandatoryTokenDialog}
        keyboard={!isMandatoryTokenDialog}
        centered
        maskStyle={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.45)'
        }}
        footer={[
          <Button 
            key="submit" 
            type="primary" 
            loading={isSavingDetails}
            onClick={handleSaveShopifyDetailsAndGetToken}
            style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', color: '#fff', marginTop: '10px' }}
          >
            Get Token
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 4, fontWeight: 600 }}>Shopify URL</div>
          <Input
            placeholder="your-store.myshopify.com"
            value={shopifyUrl}
            onChange={(e) => setShopifyUrl(e.target.value)}
          />
        </div>
        <div>
          <div style={{ marginBottom: 4, fontWeight: 600 }}>Client ID</div>
          <Input
            placeholder="Enter Client ID"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 4, fontWeight: 600 }}>Client Secret</div>
          <Input.Password
            placeholder="Enter Client Secret"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
          />
        </div>
      </Modal>
      <Layout>
        {/* Sidebar */}
        <Sider 
          width={280} 
          style={{ 
            background: '#f0fdf4',
            boxShadow: '4px 0 15px rgba(0,0,0,0.02)',
            borderRight: '1px solid #bef5d1ff',
            height: '100vh',
            position: 'sticky',
            top: 0,
            left: 0
          }}
        >
          <div style={{ padding: '24px 24px 0' }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />}
              onClick={() => window.history.back()}
              style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, padding: 0 }}
            >
              Back
            </Button>
          </div>
          <div style={{ padding: '12px 0' }}>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.key}>
                {item.key === 'widget' && (
                  <div style={{ 
                    padding: '24px 24px 8px', 
                    fontSize: '10px', 
                    fontWeight: 800, 
                    color: '#059669', 
                    letterSpacing: '1.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ opacity: 0.6 }}>CHANNEL CONFIGURATION</span>
                    <div style={{ flex: 1, height: '1px', background: '#bef5d1ff', opacity: 0.5 }}></div>
                  </div>
                )}
                <div 
                  onClick={() => setActiveSidebar(item.key)}
                  style={{
                    padding: '16px 24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    background: activeSidebar === item.key ? 'rgba(22, 163, 74, 0.1)' : 'transparent',
                    borderLeft: activeSidebar === item.key ? '4px solid #16a34a' : '4px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ 
                    fontSize: '20px', 
                    color: activeSidebar === item.key ? '#16a34a' : '#64748b',
                    marginTop: '2px'
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ 
                      color: activeSidebar === item.key ? '#065f46' : '#475569', 
                      fontWeight: 700,
                      fontSize: '13px',
                      letterSpacing: '0.5px'
                    }}>
                      {item.label}
                    </div>
                    <div style={{ 
                      color: activeSidebar === item.key ? '#16a34a' : '#94a3b8', 
                      fontSize: '11px',
                      marginTop: '2px'
                    }}>
                      {item.description}
                    </div>
                  </div>
                </div>
                
                {/* Expandable Agent Status for Widget */}
                {item.key === 'widget' && activeSidebar === 'widget' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ padding: '4px 10px 1px 15px', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                      <div 
                        onClick={!isAiUpdating ? toggleAiStatus : undefined}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          cursor: isAiUpdating ? 'not-allowed' : 'pointer',
                          padding: '12px 16px',
                          background: isAiEnabled ? '#fff' : '#f8fafc',
                          border: isAiEnabled ? '2px solid #16a34a' : '1px solid #e2e8f0',
                          borderRadius: '10px',
                          transition: 'all 0.3s ease',
                          boxShadow: isAiEnabled ? '0 4px 6px -1px rgba(22, 163, 74, 0.1)' : 'none',
                        }}
                      >
                        <div style={{ 
                          fontSize: '11px', 
                          fontWeight: 900, 
                          color: isAiEnabled ? '#16a34a' : '#94a3b8', 
                          letterSpacing: '0.5px', 
                          textTransform: 'uppercase'
                        }}>
                          Enable / Disable AI
                        </div>
                        
                        {isAiUpdating ? (
                          <SyncOutlined spin style={{ color: '#16a34a', fontSize: '16px' }} />
                        ) : (
                          <div style={{ 
                            width: '36px', 
                            height: '20px', 
                            borderRadius: '20px', 
                            background: isAiEnabled ? '#16a34a' : '#cbd5e1',
                            position: 'relative',
                            transition: 'all 0.3s ease',
                            boxShadow: isAiEnabled ? 'inset 0 2px 4px rgba(0,0,0,0.1)' : 'none'
                          }}>
                            <div style={{ 
                              position: 'absolute',
                              top: '2px',
                              left: isAiEnabled ? '18px' : '2px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#fff',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}></div>
                          </div>
                        )}
                      </div>

                      <div 
                        onClick={!isWidgetUpdating ? toggleWidgetStatus : undefined}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          cursor: isWidgetUpdating ? 'not-allowed' : 'pointer',
                          padding: '12px 16px',
                          background: isWidgetEnabled ? '#fff' : '#f8fafc',
                          border: isWidgetEnabled ? '2px solid #16a34a' : '1px solid #e2e8f0',
                          borderRadius: '10px',
                          transition: 'all 0.3s ease',
                          boxShadow: isWidgetEnabled ? '0 4px 6px -1px rgba(22, 163, 74, 0.1)' : 'none',
                        }}
                      >
                        <div style={{ 
                          fontSize: '11px', 
                          fontWeight: 900, 
                          color: isWidgetEnabled ? '#16a34a' : '#94a3b8', 
                          letterSpacing: '0.5px', 
                          textTransform: 'uppercase'
                        }}>
                          Enable / Disable Widget
                        </div>
                        
                        {isWidgetUpdating ? (
                          <SyncOutlined spin style={{ color: '#16a34a', fontSize: '16px' }} />
                        ) : (
                          <div style={{ 
                            width: '36px', 
                            height: '20px', 
                            borderRadius: '20px', 
                            background: isWidgetEnabled ? '#16a34a' : '#cbd5e1',
                            position: 'relative',
                            transition: 'all 0.3s ease',
                            boxShadow: isWidgetEnabled ? 'inset 0 2px 4px rgba(0,0,0,0.1)' : 'none'
                          }}>
                            <div style={{ 
                              position: 'absolute',
                              top: '2px',
                              left: isWidgetEnabled ? '18px' : '2px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#fff',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        </Sider>

        {/* Content Area */}
        <Content style={{ 
          padding: '32px 48px', 
          overflowY: 'auto', 
          background: '#f8fafc',
          height: '100vh'
        }}>
          <motion.div
            key={activeSidebar}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </Content>
      </Layout>

      <style>{`
        .ant-select-selector {
          border-radius: 8px !important;
          border-color: #e2e8f0 !important;
        }
        .ant-input {
          border-radius: 8px !important;
          border-color: #e2e8f0 !important;
          padding: 8px 12px !important;
        }
        .ant-input:focus, .ant-input-focused, .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
          border-color: #16a34a !important;
          box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.1) !important;
        }
        .section-card {
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }
        .persona-suggestion-tag {
          cursor: pointer;
          padding: 6px 16px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          transition: all 0.2s;
        }
        .persona-suggestion-tag:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
      `}</style>
    </Layout>
  );
};

// --- Content Components ---

const AIPersonaContent = () => {
  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ 
            width: 40, height: 40, background: '#16a34a', borderRadius: 8, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' 
          }}>
            <UserOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>AI PERSONA</Title>
            <Text type="secondary">Write and customize how the AI talks and acts</Text>
          </div>
        </div>
      </div>

      <Card className="section-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>Agent Name</div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              Give a name to your Agent that will be displayed in the conversation
            </Text>
            <Input placeholder="Elara" />
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>Agent Role</div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
              Describe your Agent's job title
            </Text>
            <Input placeholder="Customer Support Agent" style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Technical Support Spec...', 'Help Desk Representative', 'Client Service Coordina...'].map(tag => (
                <div key={tag} className="persona-suggestion-tag">{tag}</div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>Default Language</div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              Select the language in which your Agents greet users
            </Text>
            <Select defaultValue="english" style={{ width: '100%' }}>
              <Select.Option value="english">English</Select.Option>
            </Select>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>Tone of Voice</div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              Select how you would like the AI to communicate
            </Text>
            <Select defaultValue="friendly" style={{ width: '100%' }}>
              <Select.Option value="friendly">😊 Friendly</Select.Option>
              <Select.Option value="professional">💼 Professional</Select.Option>
              <Select.Option value="witty">💡 Witty</Select.Option>
            </Select>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>Conversation Style</div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              Choose how the AI should structure its responses
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {['Concise', 'Narrative', 'Detailed'].map(style => (
                <div key={style} className="persona-suggestion-tag" style={{ textAlign: 'center' }}>{style}</div>
              ))}
            </div>
          </div>
        </Space>
      </Card>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" size="large" style={{ background: '#16a34a', border: 'none', height: 48, padding: '0 32px', borderRadius: 8 }}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

const KnowledgeBaseContent = ({ setShowRedirectDialog }) => {
  const [selectedSource, setSelectedSource] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [sourceEnabled, setSourceEnabled] = useState({
    SHOPIFY: false,
    WOOCOMMERCE: false,
    META: false
  });
  const [training, setTraining] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [knowledgeContent, setKnowledgeContent] = useState('');
  const [originalKnowledgeContent, setOriginalKnowledgeContent] = useState('');
  const [isSourceConnected, setIsSourceConnected] = useState(false);

  const handleTrainAgent = async () => {
    try {
      setTraining(true);
      setShowTrainingModal(true);
      const response = await axios.post(`${BASE_URI}processShopifyProductTraining`, { 
        vendor_id: VENDOR_ID
      });
      
      if (response.data.status) {
        message.success(response.data.message || 'Training completed successfully');
      } else {
        message.error(response.data.message || 'Training failed');
      }
    } catch (error) {
      console.error("Error training Agent:", error);
      message.error('Network error during training');
    } finally {
      setTraining(false);
      setShowTrainingModal(false);
    }
  };

  const handleTrainWooAgent = async () => {
    try {
      setTraining(true);
      setShowTrainingModal(true);
      const response = await axios.post(`${BASE_URI}processWoocommerceProductTraining`, { 
        vendor_id: VENDOR_ID 
      });
      
      if (response.data.status) {
        message.success(response.data.message || 'WooCommerce training completed successfully');
      } else {
        message.error(response.data.message || 'WooCommerce training failed');
      }
    } catch (error) {
      console.error("Error training Woo Agent:", error);
      message.error('Network error during training');
    } finally {
      setTraining(false);
      setShowTrainingModal(false);
    }
  };

  const handleTrainMetaAgent = async () => {
    try {
      setTraining(true);
      setShowTrainingModal(true);
      const response = await axios.post(`${BASE_URI}processMetaProductTraining`, { 
        vendor_id: VENDOR_ID 
      });
      
      if (response.data.status) {
        message.success(response.data.message || 'Meta training completed successfully');
      } else {
        message.error(response.data.message || 'Meta training failed');
      }
    } catch (error) {
      console.error("Error training Meta Agent:", error);
      message.error('Network error during training');
    } finally {
      setTraining(false);
      setShowTrainingModal(false);
    }
  };

  const handleTrainKnowledgeBase = async () => {
    if (!knowledgeContent.trim()) {
      message.warning('Please enter some information to train the agent');
      return;
    }
    
    try {
      setTraining(true);
      setShowTrainingModal(true);
      const response = await axios.post(`${BASE_URI}trainKnowledgeBase`, { 
        vendor_id: VENDOR_ID,
        content: knowledgeContent
      });
      
      if (response.data.status) {
        message.success(response.data.message || 'Knowledge base training completed successfully');
        setOriginalKnowledgeContent(knowledgeContent);
        // setSelectedSource(null);
      } else {
        message.error(response.data.message || 'Training failed');
      }
    } catch (error) {
      console.error("Error training knowledge base:", error);
      message.error('Network error during training');
    } finally {
      setTraining(false);
      setShowTrainingModal(false);
    }
  };

  const fetchInitialStatuses = async () => {
    if (!VENDOR_ID) return;
    try {
      const resp = await axios.post(`${BASE_URI}getActivePlatform`, { vendor_id: VENDOR_ID });
      if (resp.data.status) {
        const platform = resp.data.activePlatformForAi;
        setSourceEnabled({
          SHOPIFY: platform === 1,
          WOOCOMMERCE: platform === 2,
          META: platform === 3
        });
      }
    } catch (err) {
      console.error("Failed to fetch active platform status", err);
    }
  };

  useEffect(() => {
    fetchInitialStatuses();
  }, []);

  const fetchKnowledgeBase = async () => {
    if (!VENDOR_ID) return;
    try {
      setSyncing(true);
      const response = await axios.post(`${BASE_URI}viewKnowledgeBase`, { 
        vendor_id: VENDOR_ID 
      });
      if (response.data.status) {
        const content = response.data.data || '';
        setKnowledgeContent(content);
        setOriginalKnowledgeContent(content);
      }
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (selectedSource === 'KNOWLEDGE') {
      fetchKnowledgeBase();
    }
    setIsSourceConnected(false);
  }, [selectedSource]);

  const handleSourceToggle = async (title, checked, e) => {
    e.stopPropagation();
    
    // Only allow checking (if only one can be active)
    // Or if checking one, uncheck others
    if (checked) {
      const newEnabled = {
        SHOPIFY: title === 'SHOPIFY',
        WOOCOMMERCE: title === 'WOOCOMMERCE',
        META: title === 'META'
      };
      setSourceEnabled(newEnabled);
      
      try {
        const platformId = title === 'SHOPIFY' ? 1 : title === 'WOOCOMMERCE' ? 2 : 3;
        await axios.post(`${BASE_URI}updateActivePlatform`, { 
          vendor_id: VENDOR_ID,
          activePlatformForAi: platformId
        });
        message.success(`${title} activated as primary AI source`);
      } catch (err) {
        console.error("Failed to set active platform", err);
        message.error("Failed to update active source");
        fetchInitialStatuses(); // Revert
      }
    } else {
      // If unchecking the active one, maybe we set to 0?
      setSourceEnabled(prev => ({ ...prev, [title]: false }));
      try {
        await axios.post(`${BASE_URI}updateActivePlatform`, { 
          vendor_id: VENDOR_ID,
          activePlatformForAi: 0
        });
        message.info(`${title} deactivated`);
      } catch (err) {
        fetchInitialStatuses();
      }
    }
  };

  const sources = [
    { title: 'KNOWLEDGE', desc: 'Add text-based information to train your Agent', icon: <ThunderboltOutlined />, color: '#4ade80' },
    // { title: 'FILE', desc: 'Upload files to train your Agent', icon: <FileTextOutlined />, color: '#38bdf8' },
    { title: 'SHOPIFY', desc: 'Sync your products from Shopify store', icon: <ShoppingOutlined />, color: '#96bf48' },
    { title: 'WOOCOMMERCE', desc: 'Connect your WooCommerce store', icon: <ShoppingCartOutlined />, color: '#96588a' },
    { title: 'META', desc: 'Connect your Meta catalog & store', icon: <FacebookOutlined />, color: '#0668E1' },

    // { title: 'LINK', desc: 'Add website URLs train your Agent with dynamic information', icon: <LinkOutlined />, color: '#fbbf24' },
    // { title: 'QUESTIONS & ANSWER', desc: 'Provide a question-and-answer pairing your agent can use in conversations', icon: <QuestionCircleOutlined />, color: '#6366f1' },
    // { title: 'YOUTUBE', desc: 'Add YouTube videos or channels to train your Agent', icon: <YoutubeOutlined />, color: '#ef4444' },
    // { title: 'ZENDESK', desc: 'Add your Zendesk knowledge base to train your Agent', icon: <CustomerServiceOutlined />, color: '#22c55e' },
    // { title: 'FRESHDESK', desc: 'Add your Freshdesk knowledge base to train your Agent', icon: <CustomerServiceOutlined />, color: '#10b981' },
    // { title: 'SALESFORCE', desc: 'Add your Salesforce knowledge base to train your Agent', icon: <GlobalOutlined />, color: '#00a1e0' },
  ];

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 3000);
  };

  const ShopifyConfig = () => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [shopifyData, setShopifyData] = useState({
      api_key: '',
      access_token: '',
      secret_key: '',
      shop_url: ''
    });

    const fetchToken = async () => {
      if (!VENDOR_ID) return;
      try {
        setLoading(true);
        const response = await axios.post(`${BASE_URI}getShopifyToken`, { vendor_id: VENDOR_ID });
        if (response.data.status && response.data.data) {
          const data = response.data.data;
          setShopifyData({
            api_key: data.api_key || '',
            access_token: data.access_token || '',
            secret_key: data.secret_key || '',
            shop_url: data.shop_url || ''
          });
          setIsConnected(true);
          setIsSourceConnected(true);
          setIsEditing(false);
        } else {
          setIsConnected(false);
          setIsSourceConnected(false);
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error fetching Shopify token:", error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchToken();
    }, []);

    const handleSave = async () => {
      if (!shopifyData.shop_url || !shopifyData.api_key || !shopifyData.access_token || !shopifyData.secret_key) {
        message.warning('Please fill all fields');
        return;
      }

      try {
        setSyncing(true);
        const formData = new FormData();
        formData.append('vendor_id', VENDOR_ID);
        formData.append('api_key', shopifyData.api_key);
        formData.append('access_token', shopifyData.access_token);
        formData.append('secret_key', shopifyData.secret_key);
        formData.append('shop_url', shopifyData.shop_url);

        const response = await axios.post(`${BASE_URI}saveShopifyToken`, formData);
        
        if (response.data.status) {
          message.success('Shopify Configuration saved successfully');
          setIsConnected(true);
          setIsSourceConnected(true);
          setIsEditing(false);
        } else {
          message.error(response.data.message || 'Failed to save configuration');
        }
      } catch (error) {
        console.error("Error saving Shopify token:", error);
        message.error('Network error during save');
      } finally {
        setSyncing(false);
      }
    };

    if (loading) {
      return (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <SyncOutlined spin style={{ fontSize: 24, color: '#16a34a' }} />
          <div style={{ marginTop: 12, color: '#64748b' }}>Loading configuration...</div>
        </div>
      );
    }

    return (
      <div style={{ position: 'relative' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24,
          padding: '12px 16px',
          background: isConnected ? '#f0fdf4' : '#fff',
          borderRadius: 12,
          border: isConnected ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 32, height: 32, 
              background: isConnected ? '#16a34a' : '#94a3b8', 
              color: '#fff', 
              borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              {isConnected ? <CheckCircleOutlined /> : <QuestionCircleOutlined />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: isConnected ? '#065f46' : '#1e293b' }}>
                {isConnected ? 'Shopify Connected' : 'Shopify Not Configured'}
              </div>
              <div style={{ fontSize: '11px', color: isConnected ? '#166534' : '#64748b' }}>
                {isConnected ? 'Your store products are being synchronized' : 'Connect your store to sync products'}
              </div>
            </div>
          </div>
          {isConnected && !isEditing && (
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => setIsEditing(true)}
              style={{ color: '#16a34a' }}
            >
              Edit Connection
            </Button>
          )}
        </div>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontWeight: 600 }}>Store URL</div>
              <div 
                onClick={() => setShowRedirectDialog(true)} 
                style={{ color: '#16a34a', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
              >
                get token
              </div>
            </div>
            <Input 
              prefix={<StoreUrlIcon style={{ color: '#94a3b8' }} />}
              disabled={!isEditing}
              value={shopifyData.shop_url}
              onChange={e => setShopifyData({...shopifyData, shop_url: e.target.value})}
              placeholder="your-store.myshopify.com" 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ marginBottom: 4, fontWeight: 600 }}>API Key</div>
              <Input 
                disabled={!isEditing}
                value={shopifyData.api_key}
                onChange={e => setShopifyData({...shopifyData, api_key: e.target.value})}
                placeholder="Enter Shopify API key" 
              />
            </div>
            <div>
              <div style={{ marginBottom: 4, fontWeight: 600 }}>API Secret / Secret Key</div>
              <Input.Password 
                disabled={!isEditing}
                value={shopifyData.secret_key}
                onChange={e => setShopifyData({...shopifyData, secret_key: e.target.value})}
                placeholder="Enter secret key" 
              />
            </div>
          </div>

          <div>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>Admin Access Token</div>
            <Input.Password 
              disabled={!isEditing}
              value={shopifyData.access_token}
              onChange={e => setShopifyData({...shopifyData, access_token: e.target.value})}
              placeholder="shpat_..." 
            />
          </div>

          {!isConnected || isEditing ? (
            <div style={{ 
              background: '#f8fafc', 
              padding: '16px', 
              borderRadius: 12, 
              border: '1px solid #e2e8f0',
              marginTop: 8
            }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <ThunderboltOutlined style={{ color: '#16a34a', marginTop: 4 }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>Integration Note</div>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    Require custom app credentials with <b>Read Products</b> and <b>Read Inventory</b> permissions in your Shopify admin under Settings - App and sales channels.
                  </Text>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              background: '#fef3c7', 
              padding: '12px 16px', 
              borderRadius: 8, 
              border: '1px solid #fcd34d',
              display: 'flex',
              gap: 12,
              marginTop: 16
            }}>
              <SyncOutlined spin={syncing} style={{ color: '#d97706', marginTop: 4 }} />
              <div>
                <div style={{ fontWeight: 600, color: '#92400e', fontSize: '13px' }}>Sync Info</div>
                <div style={{ color: '#b45309', fontSize: '12px' }}>
                  Sync is active. Product updates typically reflect in 5 minutes.
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
              {isConnected && (
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              )}
              <Button 
                type="primary" 
                size="large" 
                loading={syncing}
                onClick={handleSave}
                icon={<SaveOutlined />}
                style={{ background: '#16a34a', border: 'none', height: 44, borderRadius: 8, padding: '0 32px' }}
              >
                {isConnected ? 'Update Configuration' : 'Connect Shopify'}
              </Button>
            </div>
          )}
        </Space>
      </div>
    );
  };

  const WooCommerceConfig = () => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [wooData, setWooData] = useState({
      consumer_key: '',
      consumer_secret: '',
      store_url: ''
    });

    const fetchToken = async () => {
      if (!VENDOR_ID) return;
      try {
        setLoading(true);
        const response = await axios.post(`${BASE_URI}getWoocommerceToken`, { vendor_id: VENDOR_ID });
        if (response.data.status && response.data.data) {
          const data = response.data.data;
          setWooData({
            consumer_key: data.consumer_key || '',
            consumer_secret: data.consumer_secret || '',
            store_url: data.store_url || ''
          });
          setIsConnected(true);
          setIsSourceConnected(true);
          setIsEditing(false);
        } else {
          setIsConnected(false);
          setIsSourceConnected(false);
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error fetching WooCommerce token:", error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchToken();
    }, []);

    const handleSave = async () => {
      if (!wooData.store_url || !wooData.consumer_key || !wooData.consumer_secret) {
        message.warning('Please fill all fields');
        return;
      }

      try {
        setSyncing(true);
        const formData = new FormData();
        formData.append('vendor_id', VENDOR_ID);
        formData.append('consumer_key', wooData.consumer_key);
        formData.append('consumer_secret', wooData.consumer_secret);
        formData.append('store_url', wooData.store_url);

        const response = await axios.post(`${BASE_URI}saveWoocommerceToken`, formData);
        
        if (response.data.status) {
          message.success('WooCommerce Configuration saved successfully');
          setIsConnected(true);
          setIsSourceConnected(true);
          setIsEditing(false);
        } else {
          message.error(response.data.message || 'Failed to save configuration');
        }
      } catch (error) {
        console.error("Error saving WooCommerce token:", error);
        message.error('Network error during save');
      } finally {
        setSyncing(false);
      }
    };

    if (loading) {
      return (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <SyncOutlined spin style={{ fontSize: 24, color: '#96588a' }} />
          <div style={{ marginTop: 12, color: '#64748b' }}>Loading configuration...</div>
        </div>
      );
    }

    return (
      <div style={{ position: 'relative' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24,
          padding: '12px 16px',
          background: isConnected ? '#fdf2f8' : '#fff',
          borderRadius: 12,
          border: isConnected ? '1px solid #fbcfe8' : '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 32, height: 32, 
              background: isConnected ? '#96588a' : '#94a3b8', 
              color: '#fff', 
              borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              {isConnected ? <CheckCircleOutlined /> : <QuestionCircleOutlined />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: isConnected ? '#4a2c44' : '#1e293b' }}>
                {isConnected ? 'WooCommerce Connected' : 'WooCommerce Not Configured'}
              </div>
              <div style={{ fontSize: '11px', color: isConnected ? '#704268' : '#64748b' }}>
                {isConnected ? 'Your store products are being synchronized' : 'Connect your store to sync products'}
              </div>
            </div>
          </div>
          {isConnected && !isEditing && (
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => setIsEditing(true)}
              style={{ color: '#96588a' }}
            >
              Edit Connection
            </Button>
          )}
        </div>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>Store URL</div>
            <Input 
              prefix={<StoreUrlIcon style={{ color: '#94a3b8' }} />}
              disabled={!isEditing}
              value={wooData.store_url}
              onChange={e => setWooData({...wooData, store_url: e.target.value})}
              placeholder="https://your-woocommerce-store.com" 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ marginBottom: 4, fontWeight: 600 }}>Consumer Key</div>
              <Input 
                disabled={!isEditing}
                value={wooData.consumer_key}
                onChange={e => setWooData({...wooData, consumer_key: e.target.value})}
                placeholder="ck_..." 
              />
            </div>
            <div>
              <div style={{ marginBottom: 4, fontWeight: 600 }}>Consumer Secret</div>
              <Input.Password 
                disabled={!isEditing}
                value={wooData.consumer_secret}
                onChange={e => setWooData({...wooData, consumer_secret: e.target.value})}
                placeholder="cs_..." 
              />
            </div>
          </div>

          {!isConnected || isEditing ? (
            <div style={{ 
              background: '#f8fafc', 
              padding: '16px', 
              borderRadius: 12, 
              border: '1px solid #e2e8f0',
              marginTop: 8
            }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <ThunderboltOutlined style={{ color: '#96588a', marginTop: 4 }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>Integration Note</div>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    Generate API keys in WooCommerce settings under Advanced - REST API. Ensure <b>Read</b> permissions are granted.
                  </Text>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              background: '#fef3c7', 
              padding: '12px 16px', 
              borderRadius: 8, 
              border: '1px solid #fcd34d',
              display: 'flex',
              gap: 12,
              marginTop: 16
            }}>
              <SyncOutlined spin={syncing} style={{ color: '#d97706', marginTop: 4 }} />
              <div>
                <div style={{ fontWeight: 600, color: '#92400e', fontSize: '13px' }}>Sync Info</div>
                <div style={{ color: '#b45309', fontSize: '12px' }}>
                  Sync is active. Product updates typically reflect in 5 minutes.
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
              {isConnected && (
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              )}
              <Button 
                type="primary" 
                size="large" 
                loading={syncing}
                onClick={handleSave}
                icon={<SaveOutlined />}
                style={{ background: '#96588a', border: 'none', height: 44, borderRadius: 8, padding: '0 32px' }}
              >
                {isConnected ? 'Update Configuration' : 'Connect WooCommerce'}
              </Button>
            </div>
          )}
        </Space>
      </div>
    );
  };

  const MetaConfig = () => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [metaData, setMetaData] = useState({
      catalog_id: '',
      store_name: '',
      website_url: '',
      whatsapp_number: ''
    });

    const fetchToken = async () => {
      if (!VENDOR_ID) return;
      try {
        setLoading(true);
        const response = await axios.post(`${BASE_URI}getMetaToken`, { vendor_id: VENDOR_ID });
        if (response.data.status && response.data.data) {
          const data = response.data.data;
          setMetaData({
            catalog_id: data.catalog_id || '',
            store_name: data.store_name || '',
            website_url: data.website_url || '',
            whatsapp_number: data.whatsapp_number || ''
          });
          setIsConnected(true);
          setIsSourceConnected(true);
          setIsEditing(false);
        } else {
          setIsConnected(false);
          setIsSourceConnected(false);
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error fetching Meta token:", error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchToken();
    }, []);

    const handleSave = async () => {
      if (!metaData.catalog_id || !metaData.store_name) {
        message.warning('Please fill required fields');
        return;
      }

      try {
        setSyncing(true);
        const formData = new FormData();
        formData.append('vendor_id', VENDOR_ID);
        formData.append('catalog_id', metaData.catalog_id);
        formData.append('store_name', metaData.store_name);
        formData.append('website_url', metaData.website_url);
        formData.append('whatsapp_number', metaData.whatsapp_number);

        const response = await axios.post(`${BASE_URI}saveMetaToken`, formData);
        
        if (response.data.status) {
          message.success('Meta Configuration saved successfully');
          setIsConnected(true);
          setIsSourceConnected(true);
          setIsEditing(false);
        } else {
          message.error(response.data.message || 'Failed to save configuration');
        }
      } catch (error) {
        console.error("Error saving Meta token:", error);
        message.error('Network error during save');
      } finally {
        setSyncing(false);
      }
    };

    if (loading) {
      return (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <SyncOutlined spin style={{ fontSize: 24, color: '#0668E1' }} />
          <div style={{ marginTop: 12, color: '#64748b' }}>Loading configuration...</div>
        </div>
      );
    }

    return (
      <div style={{ position: 'relative' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24,
          padding: '12px 16px',
          background: isConnected ? '#f0f7ff' : '#fff',
          borderRadius: 12,
          border: isConnected ? '1px solid #bae0ff' : '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 32, height: 32, 
              background: isConnected ? '#0668E1' : '#94a3b8', 
              color: '#fff', 
              borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              {isConnected ? <CheckCircleOutlined /> : <QuestionCircleOutlined />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: isConnected ? '#003a8c' : '#1e293b' }}>
                {isConnected ? 'Meta Connected' : 'Meta Not Configured'}
              </div>
              <div style={{ fontSize: '11px', color: isConnected ? '#0958d9' : '#64748b' }}>
                {isConnected ? 'Meta Catalog integration is active' : 'Connect your Meta catalog to showcase products'}
              </div>
            </div>
          </div>
          {isConnected && !isEditing && (
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => setIsEditing(true)}
              style={{ color: '#0668E1' }}
            >
              Edit Connection
            </Button>
          )}
        </div>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ marginBottom: 4, fontWeight: 600 }}>Catalog ID</div>
              <Input 
                disabled={!isEditing}
                value={metaData.catalog_id}
                onChange={e => setMetaData({...metaData, catalog_id: e.target.value})}
                placeholder="Enter Meta Catalog ID" 
              />
            </div>
            <div>
              <div style={{ marginBottom: 4, fontWeight: 600 }}>Store Name</div>
              <Input 
                disabled={!isEditing}
                value={metaData.store_name}
                onChange={e => setMetaData({...metaData, store_name: e.target.value})}
                placeholder="Enter Meta Store Name" 
              />
            </div>
          </div>

          <div>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>Website URL</div>
            <Input 
              prefix={<StoreUrlIcon style={{ color: '#94a3b8' }} />}
              disabled={!isEditing}
              value={metaData.website_url}
              onChange={e => setMetaData({...metaData, website_url: e.target.value})}
              placeholder="https://your-meta-store.com" 
            />
          </div>

          <div>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>WhatsApp Number</div>
            <Input 
              prefix={<WhatsAppOutlined style={{ color: '#25D366' }} />}
              disabled={!isEditing}
              value={metaData.whatsapp_number}
              onChange={e => setMetaData({...metaData, whatsapp_number: e.target.value})}
              placeholder="+1 234 567 890" 
            />
          </div>

          {!isConnected || isEditing ? (
            <div style={{ 
              background: '#f8fafc', 
              padding: '16px', 
              borderRadius: 12, 
              border: '1px solid #e2e8f0',
              marginTop: 8
            }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <FacebookOutlined style={{ color: '#0668E1', marginTop: 4 }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>Meta Integration Note</div>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    Provide your Meta Commerce Manager Catalog ID and associated store details to enable automated product showcases.
                  </Text>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              background: '#e6f4ff', 
              padding: '12px 16px', 
              borderRadius: 8, 
              border: '1px solid #91caff',
              display: 'flex',
              gap: 12,
              marginTop: 16
            }}>
              <SyncOutlined spin={syncing} style={{ color: '#0958d9', marginTop: 4 }} />
              <div>
                <div style={{ fontWeight: 600, color: '#003a8c', fontSize: '13px' }}>Sync Active</div>
                <div style={{ color: '#0050b3', fontSize: '12px' }}>
                  Your Meta Catalog is currently synced with the AI Agent.
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
              {isConnected && (
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              )}
              <Button 
                type="primary" 
                size="large" 
                loading={syncing}
                onClick={handleSave}
                icon={<SaveOutlined />}
                style={{ background: '#0668E1', border: 'none', height: 44, borderRadius: 8, padding: '0 32px' }}
              >
                {isConnected ? 'Update Configuration' : 'Connect Meta Catalog'}
              </Button>
            </div>
          )}
        </Space>
      </div>
    );
  };

  const renderSourceConfig = () => {
    const isEcom = selectedSource === 'SHOPIFY' || selectedSource === 'WOOCOMMERCE';
    const isKnowledge = selectedSource === 'KNOWLEDGE';
    const currentSource = sources.find(s => s.title === selectedSource);
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => setSelectedSource(null)}
          style={{ marginBottom: 24, fontSize: '13px', fontWeight: 600, color: '#64748b' }}
        >
          Back to Sources
        </Button>

        <Card className="section-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ 
                width: 48, height: 48, 
                background: `${currentSource?.color}15`, 
                color: currentSource?.color,
                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24
              }}>
                {currentSource?.icon}
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>{selectedSource} CONFIGURATION</Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>{currentSource?.desc || 'Connect and train your Agent'}</Text>
              </div>
            </div>

            {( (selectedSource === 'SHOPIFY' || selectedSource === 'WOOCOMMERCE' || selectedSource === 'META') && isSourceConnected ) && (
              <Button 
                type="primary" 
                size="large"
                loading={training}
                onClick={
                  selectedSource === 'SHOPIFY' ? handleTrainAgent : 
                  selectedSource === 'WOOCOMMERCE' ? handleTrainWooAgent : 
                  handleTrainMetaAgent
                }
                icon={<SyncOutlined spin={training} />}
                style={{ 
                  background: 
                    selectedSource === 'SHOPIFY' ? '#16a34a' : 
                    selectedSource === 'WOOCOMMERCE' ? '#96588a' : 
                    '#0668E1', 
                  border: 'none', 
                  height: 44, 
                  borderRadius: 10, 
                  padding: '0 24px',
                  fontWeight: 600,
                  boxShadow: `0 4px 12px 0 ${
                    selectedSource === 'SHOPIFY' ? 'rgba(22, 163, 74, 0.25)' : 
                    selectedSource === 'WOOCOMMERCE' ? 'rgba(150, 88, 138, 0.25)' : 
                    'rgba(6, 104, 225, 0.25)'
                  }`
                }}
              >
                Train Now
              </Button>
            )}
          </div>

          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {isKnowledge ? (
              <div>
                <div style={{ marginBottom: 12, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Training Information</span>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<SyncOutlined spin={syncing} />} 
                    onClick={fetchKnowledgeBase}
                    style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    Refresh
                  </Button>
                </div>
                <Input.TextArea 
                  rows={12} 
                  value={knowledgeContent}
                  onChange={(e) => setKnowledgeContent(e.target.value)}
                  placeholder="Paste or write the information you want your AI Agent to learn from. This could be company policies, product details, FAQ content, etc." 
                  style={{ borderRadius: 12 }}
                />
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                    <Button 
                      type="primary" 
                      size="large" 
                      loading={training}
                      disabled={!knowledgeContent.trim() || knowledgeContent === originalKnowledgeContent}
                      onClick={handleTrainKnowledgeBase}
                      style={{ 
                        background: (!knowledgeContent.trim() || knowledgeContent === originalKnowledgeContent) ? '#cbd5e1' : '#16a34a', 
                        border: 'none', 
                        height: 54, 
                        borderRadius: 12, 
                        padding: '0 60px', 
                        fontWeight: 700, 
                        fontSize: '16px' 
                      }}
                    >
                      Train My Agent
                    </Button>
                </div>
              </div>
            ) : selectedSource === 'SHOPIFY' ? (
                <ShopifyConfig />
            ) : selectedSource === 'WOOCOMMERCE' ? (
                <WooCommerceConfig />
            ) : selectedSource === 'META' ? (
                <MetaConfig />
            ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Text type="secondary">Configuration for {selectedSource} is coming soon.</Text>
                </div>
            )}
          </Space>
        </Card>
      </motion.div>
    );
  };


  return (
    <div style={{ maxWidth: '900px' }}>
      <AnimatePresence mode="wait">
            {/* Training Modal */}
            <Modal
                open={showTrainingModal}
                footer={null}
                closable={false}
                centered
                maskClosable={false}
                width={500}
                bodyStyle={{ padding: '40px 30px', textAlign: 'center' }}
            >
                <div style={{ marginBottom: 24 }}>
                    <div style={{ 
                        width: 80, height: 80, 
                        background: '#f0fdf4', 
                        borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                        border: '4px solid #bbf7d0'
                    }}>
                        <SyncOutlined spin style={{ fontSize: 40, color: '#16a34a' }} />
                    </div>
                </div>
                
                <Title level={3} style={{ marginBottom: 12, color: '#1e293b' }}>
                    Training AI Agent
                </Title>
                
                <Text style={{ fontSize: 16, color: '#64748b', display: 'block', marginBottom: 32 }}>
                    Please wait while we process your data and train the AI model. 
                    <br />
                    <span style={{ fontWeight: 600, color: '#16a34a' }}>This process typically takes 1 to 5 minutes.</span>
                </Text>

                <Progress
                    percent={99}
                    status="active"
                    strokeColor={{
                        '0%': '#10b981',
                        '100%': '#34d399',
                    }}
                    showInfo={false}
                    strokeWidth={8}
                    style={{ marginBottom: 12 }}
                />
                
                <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>
                    Optimization in progress... please do not close this window.
                </div>
            </Modal>

        {!selectedSource ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ 
                  width: 40, height: 40, background: '#10b981', borderRadius: 8, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' 
                }}>
                  <DatabaseOutlined style={{ fontSize: 20 }} />
                </div>
                <div>
                  <Title level={4} style={{ margin: 0 }}>KNOWLEDGE BASE</Title>
                  <Text type="secondary">Train your Agent for context-aware responses to ensure accurate replies</Text>
                </div>
              </div>
            </div>

            {/* <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <Input 
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
                placeholder="Search" 
                style={{ height: 44 }}
              />
              <Select defaultValue="all" style={{ width: 140, height: 44 }}>
                <Select.Option value="all">👁️ See All</Select.Option>
              </Select>
            </div> */}

            <div style={{ display: 'grid', gap: 12 }}>
              {sources.map(source => {
                const isSelectable = ['SHOPIFY', 'WOOCOMMERCE', 'META', 'KNOWLEDGE'].includes(source.title);
                return (
                  <div 
                    key={source.title} 
                    onClick={() => isSelectable && setSelectedSource(source.title)}
                    style={{
                      background: '#fff',
                      borderRadius: 12,
                      padding: '16px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid #edf2f7',
                      borderLeft: `5px solid ${source.color}`,
                      cursor: isSelectable ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={(e) => {
                      if (isSelectable) {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                        e.currentTarget.style.borderColor = '#16a34a33';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                      e.currentTarget.style.borderColor = '#edf2f7';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ 
                        width: 36, height: 36, background: `${source.color}15`, color: source.color,
                        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18
                      }}>
                        {source.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>{source.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{source.desc}</div>
                      </div>
                    </div>
                    {isSelectable && (
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {['SHOPIFY', 'WOOCOMMERCE', 'META'].includes(source.title) ? (
                          <Switch 
                            checked={sourceEnabled[source.title]} 
                            onChange={(checked, e) => handleSourceToggle(source.title, checked, e)}
                            style={{ 
                              background: sourceEnabled[source.title] ? source.color : '#cbd5e1' 
                            }}
                          />
                        ) : (
                          <div style={{ color: '#cbd5e1' }}>
                            <PlusOutlined />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : renderSourceConfig()}
      </AnimatePresence>
    </div>
  );
};

const ActionsContent = () => {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [startTime, setStartTime] = useState(dayjs('09:00', 'HH:mm'));
  const [endTime, setEndTime] = useState(dayjs('18:00', 'HH:mm'));
  const [users, setUsers] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axios.post(`${BASE_URI}get-users`, { vendorId: VENDOR_ID });
      if (response.data.status) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAiBotSettings = async () => {
    if (!VENDOR_ID) return;
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URI}aiBotSettingView`, { vendorId: VENDOR_ID });
      if (response.data.status && Array.isArray(response.data.data)) {
        const settings = response.data.data;
        settings.forEach(item => {
          if (item.name === 'status') setAiEnabled(item.value === '1');
          if (item.name === 'startTime' && item.value) setStartTime(dayjs(item.value, 'HH:mm'));
          if (item.name === 'endTime' && item.value) setEndTime(dayjs(item.value, 'HH:mm'));
          if (item.name === 'agent_id' && item.value) setSelectedAgentId(parseInt(item.value));
        });
      }
    } catch (error) {
      console.error("Error fetching AI bot settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiBotSettings();
    fetchUsers();
  }, []);

  const handleSaveActions = async () => {
    setFormSubmitted(true);
    if (!selectedAgentId) {
      message.warning('Please select a Support Agent before saving');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        vendorId: VENDOR_ID,
        startTime: startTime.format('HH:mm'),
        endTime: endTime.format('HH:mm'),
        status: aiEnabled ? 1 : 0,
        agent_id: selectedAgentId
      };

      const response = await axios.post(`${BASE_URI}enableDisableAiBot`, payload);

      if (response.data.status) {
        message.success('AI Agent actions updated successfully');
      } else {
        message.error(response.data.message || 'Failed to update actions');
      }
    } catch (error) {
      console.error("Error updating AI actions:", error);
      message.error('Network error while updating actions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ 
            width: 40, height: 40, background: '#059669', borderRadius: 8, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' 
          }}>
            <ThunderboltOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>AI AGENT ACTIONS</Title>
            <Text type="secondary">Control when and how your AI Agent operates</Text>
          </div>
        </div>
      </div>

      <Card className="section-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* AI Enable/Disable */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Enable AI Agent</div>
              <Text type="secondary" style={{ fontSize: 12 }}>Toggle to turn the AI Agent on or off globally</Text>
            </div>
            <Switch 
              checked={aiEnabled} 
              onChange={setAiEnabled} 
              checkedChildren="ON" 
              unCheckedChildren="OFF"
              style={{ background: aiEnabled ? '#16a34a' : '#cbd5e1' }}
            />
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>Operating Hours</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ marginBottom: 8, fontSize: 13, color: '#64748b' }}>From Time</div>
                <TimePicker 
                  format="HH:mm" 
                  style={{ width: '100%' }} 
                  value={startTime}
                  onChange={setStartTime}
                  allowClear={false}
                />
              </div>
              <div>
                <div style={{ marginBottom: 8, fontSize: 13, color: '#64748b' }}>To Time</div>
                <TimePicker 
                  format="HH:mm" 
                  style={{ width: '100%' }} 
                  value={endTime}
                  onChange={setEndTime}
                  allowClear={false}
                />
              </div>
            </div>
            <Text type="secondary" style={{ fontSize: 11, marginTop: 8, display: 'block' }}>
              The Agent will only respond during these hours. Outside this window, it will stay inactive.
            </Text>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Support Agent <span style={{ color: '#ef4444' }}>*</span></div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              Select an agent to handle inquiries when needed
            </Text>
            <Select 
              style={{ width: '100%' }}
              placeholder="Select an agent"
              value={selectedAgentId}
              onChange={(v) => {
                setSelectedAgentId(v);
                if (v) setFormSubmitted(false);
              }}
              status={formSubmitted && !selectedAgentId ? 'error' : ''}
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {users.map(user => (
                <Select.Option key={user._id} value={user._id}>
                  {user.first_name} {user.last_name} ({user.email})
                </Select.Option>
              ))}
            </Select>
          </div>
        </Space>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <Button 
          type="primary" 
          size="large" 
          loading={loading}
          onClick={handleSaveActions}
          style={{ background: '#16a34a', border: 'none', height: 48, padding: '0 40px', borderRadius: 8, fontWeight: 600 }}
        >
          Save Actions
        </Button>
      </div>
    </div>
  );
};

const AiStopContactsContent = () => {
    const [loading, setLoading] = useState(false);
    const [stoppedContacts, setStoppedContacts] = useState([]);

    const fetchStoppedContacts = async () => {
        if (!VENDOR_ID) return;
        try {
            setLoading(true);
            const response = await axios.post(`${BASE_URI}aiStopedChats`, { vendorId: VENDOR_ID });
            if (response.data.status && response.data.data?.list) {
                setStoppedContacts(response.data.data.list);
            }
        } catch (err) {
            console.error("Failed to fetch stopped contacts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStoppedContacts();
    }, []);

    const handleResumeAi = async (id) => {
        try {
            const response = await axios.post(`${BASE_URI}deleteAiStopedChats`, { id: id });
            if (response.data.status) {
                message.success('AI resumed for contact');
                fetchStoppedContacts();
            }
        } catch (err) {
            message.error('Failed to resume AI');
        }
    };

    return (
        <div style={{ maxWidth: '900px' }}>
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ 
                        width: 40, height: 40, background: '#ef4444', borderRadius: 8, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' 
                    }}>
                        <ClockCircleOutlined style={{ fontSize: 20 }} />
                    </div>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>AI STOP CONTACTS (24 HOURS)</Title>
                        <Text type="secondary">View and manage contacts where the AI Agent is temporarily paused</Text>
                    </div>
                </div>
            </div>

            <Card className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Message</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stopped At</th>
                                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stoppedContacts.length > 0 ? stoppedContacts.map(contact => (
                                <tr key={contact.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown'}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{contact.wa_id}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px' }}>
                                        {contact.last_message}
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px' }}>
                                        {contact.time}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <Button 
                                            type="primary" 
                                            ghost 
                                            size="small"
                                            style={{ borderColor: '#16a34a', color: '#16a34a', borderRadius: 6 }}
                                            onClick={() => handleResumeAi(contact.id)}
                                        >
                                            Resume AI
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '64px 24px', color: '#94a3b8' }}>
                                        <div style={{ marginBottom: 16 }}>
                                            <ClockCircleOutlined style={{ fontSize: 40, opacity: 0.2, color: '#64748b' }} />
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: 500 }}>No contacts are currently paused</div>
                                        <div style={{ fontSize: '12px', marginTop: 4 }}>AI will automatically pause for contacts requiring human intervention</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AIAgent;
