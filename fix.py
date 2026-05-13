import re
import os

files = [
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
]

for f in files:
    path = os.path.join(r"d:\salegrowy", f)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Fix the broken fetch calls created by the PowerShell script.
        # Original broken format: fetch(`/api/some-endpoint',
        # Goal: fetch(`http://52.66.85.100:3000/api/some-endpoint`,
        content = re.sub(r'fetch\(`(\/api\/.*?)([\'"`])', r'fetch(`http://52.66.85.100:3000/\1`', content)
        
        with open(path, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Fixed {f}")
    else:
        print(f"Not found: {f}")
