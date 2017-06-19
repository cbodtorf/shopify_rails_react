class DashboardController < ShopifyApp::AuthenticatedController
  def index
    # Shopify requires time to be iso8601 format
    # Order Information 7 day range (limit for which orders )
    # TODO: make sure this range is right,
    t = Time.now
    t8601 = t.iso8601
    sixDaysAgo = (t - 6.day).iso8601
    Rails.logger.debug("Time: #{t8601.inspect}")
    Rails.logger.debug("Time - 1: #{sixDaysAgo.inspect}")
    @orders = ShopifyAPI::Order.find(:all, params: { created_at_min: sixDaysAgo })

    @allOrders = ShopifyAPI::Order.find(:all, params: { limit: 10 })
    Rails.logger.debug("orders: #{@orders.inspect}")


    # Subscriber Count (tagged with Active Subscriber)
    # http://support.rechargepayments.com/article/191-shopify-order-tags
    customers = ShopifyAPI::Customer.find(:all)
    activeSubscribers = customers.select do |c|
      c.attributes[:tags].split(', ').include?('Active Subscriber')
    end
    @activeSubscriberCount = activeSubscribers.count

    # Customer Count:
    @customerCount = ShopifyAPI::Customer.count

    # Bundle Information
    @bundles = ShopifyAPI::Product.find(:all, params: { product_type: 'bundle' })

    # Product Information
    @productCount = ShopifyAPI::Product.count
  end
end
