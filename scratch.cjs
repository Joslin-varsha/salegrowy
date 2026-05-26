const fs = require('fs');
let content = fs.readFileSync('src/aiagent/aiagent.jsx', 'utf8');

// Update BASE_URI
content = content.replace(
  /const BASE_URI = import\.meta\.env\.VITE_BASE_URI;/g,
  "const BASE_URI = `${import.meta.env.VITE_API_URL}/api/vendor`;"
);

// We want to add the headers to all axios.post calls that use BASE_URI
const regex = /axios\.post\(\s*\`\$\{BASE_URI\}\/([a-zA-Z0-9_-]+)\`\s*,\s*(\{.*?\}|payload|formData)\s*\)/gs;
content = content.replace(regex, (match, endpoint, payload) => {
    return `axios.post(\`${"${BASE_URI}"}/${endpoint}\`, ${payload}, { headers: { Authorization: \`Bearer ${"${localStorage.getItem('token')}"}\` } })`;
});

// Also there might be a call like getActivePlatform that has newlines
const activePlatformRegex = /axios\.post\(\s*\`\$\{BASE_URI\}\/getActivePlatform\`\s*,\s*\{\s*vendor_id:\s*vendorId\s*\}\s*\)/g;
content = content.replace(activePlatformRegex, `axios.post(\`${"${BASE_URI}"}/getActivePlatform\`, { vendor_id: vendorId }, { headers: { Authorization: \`Bearer ${"${localStorage.getItem('token')}"}\` } })`);

fs.writeFileSync('src/aiagent/aiagent.jsx', content);
console.log('Update completed for aiagent.jsx');
