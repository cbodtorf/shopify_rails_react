ShopifyApp.configure do |config|
  config.application_name = "Bamboo App"
  config.api_key = ENV['SHOPIFY_CLIENT_API_KEY']
  config.secret = ENV['SHOPIFY_CLIENT_API_SECRET']
  config.scope = "read_orders, read_products, write_shipping, read_shipping"
  config.embedded_app = true
  config.webhooks = [
  {
    topic: 'shop/update',
    address: "#{Rails.application.config.application_url}/webhooks/shop_update",
    format: 'json'
  },
  {
    topic: 'app/uninstalled',
    address: "#{Rails.application.config.application_url}/webhooks/app_uninstall",
    format: 'json'
  }
]
end
