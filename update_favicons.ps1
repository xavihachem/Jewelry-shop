# List of HTML files to update
$files = @(
    "admin-order-view.html",
    "admin-orders.html",
    "admin.html",
    "cities.html",
    "edit.html",
    "order-index.html",
    "product.html",
    "thank-you.html",
    "test-api.html"
)

# Favicon HTML to insert
$faviconHtml = '    <!-- Favicon -->
    <link rel="icon" type="image/png" href="img/logo.png">'

# Process each file
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Check if favicon already exists
        if ($content -notmatch 'rel="icon"') {
            # Insert favicon after the viewport meta tag
            $content = $content -replace '(?<=<meta name="viewport"[^>]*>)', "`n$faviconHtml"
            
            # Save the file
            $content | Set-Content $file -NoNewline
            Write-Host "Updated favicon in $file"
        } else {
            # Update existing favicon
            $content = $content -replace '<link rel="icon"[^>]*>', $faviconHtml
            $content | Set-Content $file -NoNewline
            Write-Host "Updated existing favicon in $file"
        }
    } else {
        Write-Host "File not found: $file"
    }
}
