class SubscriptionController < ShopifyApp::AuthenticatedController
  def index
    shop = Shop.find_by(shopify_domain: params[:shop])
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
