$files = @(
  "src\pages\WhatsAppTemplates.jsx",
  "src\pages\VendorDashboard.jsx",
  "src\pages\SuperAdminDashboard.jsx",
  "src\pages\SuperAdminVendors.jsx",
  "src\pages\Settings.jsx",
  "src\pages\RegisterVendor.jsx",
  "src\pages\Profile.jsx",
  "src\pages\MessageLog.jsx",
  "src\pages\Labels.jsx",
  "src\pages\Login.jsx",
  "src\pages\CreateContact.jsx",
  "src\pages\CreateCampaign.jsx",
  "src\pages\Contacts.jsx",
  "src\pages\ContactGroups.jsx",
  "src\pages\Campaigns.jsx",
  "src\layouts\DashboardLayout.jsx"
)

foreach ($f in $files) {
  $path = Join-Path $PWD $f
  if (Test-Path $path) {
    $content = Get-Content -Raw -Path $path
    
    # Calculate depth to `src`
    # E.g., src\pages\File.jsx is depth 2 (from workspace root)
    # the config.js is in src\config.js
    # so from pages we go to ../config.js 
    # from layouts we go to ../config.js
    # both are 1 level down from src!
    
    if (-Not $content.Contains("API_BASE_URL")) {
        $importLine = "import { API_BASE_URL } from '../config';`n"
        $content = $importLine + $content
    }
    
    # Replace single quote
    $content = $content -replace "fetch\('/api/", "fetch(``${API_BASE_URL}/api/"
    # Replace double quote
    $content = $content -replace "fetch\(`"/api/", "fetch(``${API_BASE_URL}/api/"
    # Replace backtick
    $content = $content -replace "fetch\(`(`/api/", "fetch(``${API_BASE_URL}/api/"
    # Replace the absolute one
    $content = $content -replace "fetch\('http://192\.168\.100\.144:3000/api/", "fetch(``${API_BASE_URL}/api/"

    Set-Content -Path $path -Value $content -Encoding Default
    Write-Host "Processed $f"
  } else {
    Write-Host "File not found $f"
  }
}
