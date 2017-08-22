ShopifyApp.configure do |config|
  config.application_name = "Bamboo App"
  config.api_key = ENV['SHOPIFY_CLIENT_API_KEY']
  config.secret = ENV['SHOPIFY_CLIENT_API_SECRET']
  config.scope = "read_reports, write_orders, read_orders, write_products, read_products, write_shipping, read_shipping, read_customers, write_customers, read_checkouts, write_checkouts"
  config.embedded_app = true
  config.webhooks = [
  {
    topic: 'orders/create',
    address: "#{Rails.configuration.application_url}/webhooks/orders_create/",
    format: 'json'
  },
  {
    topic: 'checkouts/update',
    address: "#{Rails.configuration.application_url}/webhooks/checkouts_update/",
    format: 'json'
  },
  {
    topic: 'checkouts/create',
    address: "#{Rails.configuration.application_url}/webhooks/checkouts_create/",
    format: 'json'
  },
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
