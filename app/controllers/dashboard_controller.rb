class DashboardController < ShopifyApp::AuthenticatedController
  def index
    @orders = ShopifyAPI::Order.find(:all, params: { limit: 10 })
    @bundles = ShopifyAPI::Product.find(:all, params: { product_type: 'bundle' })
  end
end
