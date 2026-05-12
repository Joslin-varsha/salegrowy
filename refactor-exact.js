const fs = require('fs');
const path = require('path');

const files = [
  "src/pages/WhatsAppTemplates.jsx",
  "src/pages/VendorDashboard.jsx",
  "src/pages/SuperAdminDashboard.jsx",
  "src/pages/SuperAdminVendors.jsx",
  "src/pages/Settings.jsx",
  "src/pages/RegisterVendor.jsx",
  "src/pages/Profile.jsx",
  "src/pages/MessageLog.jsx",
  "src/pages/Labels.jsx",
  "src/pages/Login.jsx",
  "src/pages/CreateContact.jsx",
  "src/pages/CreateCampaign.jsx",
  "src/pages/Contacts.jsx",
  "src/pages/ContactGroups.jsx",
  "src/pages/Campaigns.jsx",
  "src/layouts/DashboardLayout.jsx"
];

for (const relPath of files) {
  const filePath = path.join(__dirname, relPath);
  console.log('Processing:', relPath);
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Add import
    if (!content.includes('API_BASE_URL')) {
      const depth = relPath.split('/').length - 1;
      const prefix = depth > 0 ? '../'.repeat(depth) : './';
      content = `import { API_BASE_URL } from '${prefix}config';\n` + content;
    }

    // Replace endpoints
    content = content.replace(/fetch\(\s*['"]\/api\//g, "fetch(`${API_BASE_URL}/api/");
    content = content.replace(/fetch\(\s*`\/api\//g, "fetch(`${API_BASE_URL}/api/");
    content = content.replace(/fetch\(\s*['"]http:\/\/192\.168\.100\.144:3000\/api\//g, "fetch(`${API_BASE_URL}/api/");

    fs.writeFileSync(filePath, content, 'utf8');
  } catch (err) {
    fs.appendFileSync('patch-error.log', err.message + '\n');
  }
}
