class SubscriptionController < ShopifyApp::AuthenticatedController
  def index
    shop = Shop.find_by(shopify_domain: params[:shop])
    @rechargeSubscriptions = shop.getRechargeData("https://api.rechargeapps.com/charges/?status=QUEUED&limit=250")['charges']
  end

  def get_shopify_customer_id
    shopify_customer_id = shop.getRechargeData("https://api.rechargeapps.com/customers/#{order['customer_id']}")['customer']['shopify_customer_id']
    render json: {shopifyCustomerId: shopify_customer_id} , status: 200
  end
end
