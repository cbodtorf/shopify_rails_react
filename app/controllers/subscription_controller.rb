class SubscriptionController < ShopifyApp::AuthenticatedController
  def index
    shop = Shop.find_by(shopify_domain: params[:shop])
    # Retrieves Upcoming Active Subscriptions and attaches customer data to the hash.
    # @rechargeSubscriptions = self.getRechargeData("https://api.rechargeapps.com/subscriptions?status=ACTIVE&limit=250")["subscriptions"].each do |sub|
    #   sub["customer"] = self.getRechargeData("https://api.rechargeapps.com/customers/#{sub["customer_id"]}")["customer"]
    # end

    @rechargeSubscriptions = shop.getRechargeData("https://api.rechargeapps.com/charges/?status=QUEUED&limit=250")['charges']

    # Subscriber Count (tagged with Active Subscriber)
    # http://support.rechargepayments.com/article/191-shopify-order-tags
    customers = ShopifyAPI::Customer.find(:all)
    activeSubscribers = customers.select do |c|
      c.attributes[:tags].split(', ').include?('Active Subscriber')
    end
    @activeSubscriberCount = activeSubscribers.count


  end
end
