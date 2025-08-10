# Remove console logs from order-index.html

# Read the file content
$content = Get-Content -Path "order-index.html" -Raw

# Remove all console.log statements
$content = $content -replace '\s*console\.log\([^;]*\);?\s*', ''

# Remove console.error statements but keep the error handling
$content = $content -replace '\s*console\.error\([^;]*\);?\s*', ''

# Remove any empty lines left after removing console logs
$content = $content -replace '(?m)^\s*$\n?', ''

# Save the updated content back to the file
$content | Set-Content -Path "order-index.html" -NoNewline

Write-Host "Console logs have been removed from order-index.html"
