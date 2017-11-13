class SubscriptionController < ShopifyApp::AuthenticatedController
  def index
    shop = Shop.find_by(shopify_domain: params[:shop])
    @rechargeSubscriptions = shop.getRechargeData("https://api.rechargeapps.com/charges/?status=QUEUED&limit=250")['charges']

    @rechargeSubscriptions.map do |order|
      order['shopify_customer_id'] = shop.getRechargeData("https://api.rechargeapps.com/customers/#{order['customer_id']}")['customer']['shopify_customer_id']
    end
  end
end
