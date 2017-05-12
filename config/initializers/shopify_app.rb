ShopifyApp.configure do |config|
  config.application_name = "My Shopify App"
  config.api_key = "da3d87b960396a584a50c51d67437484"
  config.secret = "b4b2afa986106ce7c5b9527c83573923"
  config.scope = "read_orders, read_products"
  config.embedded_app = true
end
