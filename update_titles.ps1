# Update shop.html
(Get-Content -Path "shop.html") -replace '<title>Shop - Kaira</title>', '<title>Shop - ONYXIA</title>' | Set-Content -Path "shop.html"

# Update product.html
(Get-Content -Path "product.html") -replace '<title>Product Detail - Kaira</title>', '<title>Product - ONYXIA</title>' | Set-Content -Path "product.html"

# Update cart.html is already correct as it uses ONYXIA
# Update index_new.html is already correct as it uses ONYXIA

# Update thank-you.html
(Get-Content -Path "thank-you.html") -replace '<title>Thank You for Your Order - Kaira</title>', '<title>Thank You - ONYXIA</title>' | Set-Content -Path "thank-you.html"

# Update order-index.html
(Get-Content -Path "order-index.html") -replace '<title>Order Product - Kaira</title>', '<title>Order - ONYXIA</title>' | Set-Content -Path "order-index.html"

Write-Host "Page titles have been updated successfully!"
