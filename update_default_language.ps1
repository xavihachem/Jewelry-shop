# Update all files to use 'ar' as default language instead of 'en'

# Update shop.html
(Get-Content -Path "shop.html") -replace "localStorage.getItem\('language'\) \|\| 'en'", "localStorage.getItem('language') || 'ar'" | Set-Content -Path "shop.html"

# Update product.html
(Get-Content -Path "product.html") -replace "localStorage.getItem\('language'\) \|\| 'en'", "localStorage.getItem('language') || 'ar'" | Set-Content -Path "product.html"

# Update order-index.html
(Get-Content -Path "order-index.html") -replace "localStorage.getItem\('language'\) \|\| 'en'", "localStorage.getItem('language') || 'ar'" | Set-Content -Path "order-index.html"

# Update cart.html
(Get-Content -Path "cart.html") -replace "localStorage.getItem\('language'\) \|\| 'en'", "localStorage.getItem('language') || 'ar'" | Set-Content -Path "cart.html"

# Update index_new.html
(Get-Content -Path "index_new.html") -replace "localStorage.getItem\('language'\) \|\| 'en'", "localStorage.getItem('language') || 'ar'" | Set-Content -Path "index_new.html"

# Update custom.js - handle the case where it might be setting a default language
(Get-Content -Path "js/custom.js") -replace "const savedLang = localStorage.getItem\('language'\)", "const savedLang = localStorage.getItem('language') || 'ar'" | Set-Content -Path "js/custom.js"

# Clear any existing language setting to force using the new default
Write-Host "Default language has been set to Arabic (ar) across the site."
Write-Host "Note: The layout direction (LTR/RTL) remains unchanged as per your request."
