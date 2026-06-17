const fs = require('fs');
let content = fs.readFileSync('src/aiagent/aiagent.jsx', 'utf8');

const syncProductsComponent = `
const SyncProductsContent = () => {
  const [loading, setLoading] = useState(false);
  const [syncData, setSyncData] = useState(null);

  const handleSyncProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        "https://ecomapi.salegrowy.com/api/vendor/sync-products",
        {},
        {
          headers: {
            Authorization: \`Bearer ${"${token}"}\`
          }
        }
      );
      if (response.data && response.data.data) {
        setSyncData(response.data.data);
        message.success(response.data.message || "Product sync job successfully queued");
      }
    } catch (error) {
      console.error("Sync products error:", error);
      message.error("Failed to sync products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ 
            width: 40, height: 40, background: '#3b82f6', borderRadius: 8, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' 
        }}>
            <SyncOutlined style={{ fontSize: 20 }} />
        </div>
        <div>
            <Title level={4} style={{ margin: 0 }}>SYNC PRODUCTS</Title>
            <Text type="secondary">Sync all products recursively</Text>
        </div>
      </div>
      
      <Card style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ marginBottom: 24 }}>
          <Button type="primary" size="large" onClick={handleSyncProducts} loading={loading} style={{ background: '#3b82f6', borderColor: '#3b82f6' }}>
            Sync All Products
          </Button>
        </div>
        
        {syncData && (
          <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>Sync Job Status</Title>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px 16px' }}>
              <Text strong style={{ color: '#64748b' }}>Job ID:</Text> 
              <Text>{syncData.jobId}</Text>
              
              <Text strong style={{ color: '#64748b' }}>Job UUID:</Text> 
              <Text>{syncData.jobUuid}</Text>
              
              <Text strong style={{ color: '#64748b' }}>Queue:</Text> 
              <Text>{syncData.queue}</Text>
              
              <Text strong style={{ color: '#64748b' }}>Status:</Text> 
              <Text style={{ color: '#16a34a', textTransform: 'capitalize', fontWeight: 600 }}>{syncData.status}</Text>
              
              <Text strong style={{ color: '#64748b' }}>Limit:</Text> 
              <Text>{syncData.limit}</Text>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

const AIAgent = () => {`;

content = content.replace('const AIAgent = () => {', syncProductsComponent);

const menuInsertionStr = `
      {
        key: 'sync_products',
        icon: <SyncOutlined />,
        label: 'SYNC PRODUCTS',
        description: 'Sync all products from your platforms',
      },`;

const searchMenu = `      {
        key: 'widget',
        icon: <SettingOutlined />,
        label: 'WIDGET SETTINGS',
        description: 'Customize and install your chat widget',
      },`;

if (content.includes(searchMenu)) {
  content = content.replace(searchMenu, searchMenu + menuInsertionStr);
} else {
  console.log("Could not find WIDGET SETTINGS menu item");
}

const caseInsertionStr = `        case 'sync_products':
          return <SyncProductsContent />;
        case 'widget':`;

if (content.includes("case 'widget':")) {
  content = content.replace("case 'widget':", caseInsertionStr);
} else {
  console.log("Could not find case 'widget':");
}

if (!content.includes('SyncOutlined')) {
  content = content.replace('CloseCircleOutlined', 'CloseCircleOutlined,\n    SyncOutlined');
}

fs.writeFileSync('src/aiagent/aiagent.jsx', content);
console.log('Update finished.');
