# Get all HTML files in the current directory
$htmlFiles = Get-ChildItem -Path . -Filter "*.html" -Recurse -File

# New favicon HTML to insert
$faviconHtml = @"
    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="img/logo.png">
    <link rel="icon" type="image/png" sizes="64x64" href="img/logo.png">
    <link rel="icon" type="image/png" sizes="96x96" href="img/logo.png">
    <link rel="icon" type="image/png" sizes="128x128" href="img/logo.png">
    <link rel="apple-touch-icon" sizes="180x180" href="img/logo.png">
    <meta name="msapplication-TileImage" content="img/logo.png">
    <meta name="theme-color" content="#D4AF37">
"@

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Remove any existing favicon links
    $content = $content -replace '(?s)<!-- Favicon -->.*?<link rel="[^"]*icon[^"]*"[^>]*>', ''
    $content = $content -replace '(?s)<link rel="[^"]*icon[^"]*"[^>]*>', ''
    $content = $content -replace '(?s)<meta name="msapplication-TileImage"[^>]*>', ''
    $content = $content -replace '(?s)<meta name="theme-color"[^>]*>', ''
    
    # Insert new favicon after the viewport meta tag
    $content = $content -replace '(?<=<meta name="viewport"[^>]*>)', "`n$faviconHtml"
    
    # Save the updated content
    Set-Content -Path $file.FullName -Value $content -NoNewline
    
    Write-Host "Updated favicon in $($file.Name)"
}

Write-Host "Favicon update complete!"
