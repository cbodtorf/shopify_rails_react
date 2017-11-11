class SubscriptionController < ShopifyApp::AuthenticatedController
  def index
    shop = Shop.find_by(shopify_domain: params[:shop])
    @rechargeSubscriptions = shop.getRechargeData("https://api.rechargeapps.com/charges/?status=QUEUED&limit=250")['charges']

  end
end
