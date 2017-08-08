class SubscriptionController < ShopifyApp::AuthenticatedController
  def index
    # Retrieves Upcoming Active Subscriptions and attaches customer data to the hash.
    @rechargeSubscriptions = self.getRechargeData("https://api.rechargeapps.com/subscriptions?status=ACTIVE&limit=250")["subscriptions"].each do |sub|
      sub["customer"] = self.getRechargeData("https://api.rechargeapps.com/customers/#{sub["customer_id"]}")["customer"]
    end

    # Subscriber Count (tagged with Active Subscriber)
    # http://support.rechargepayments.com/article/191-shopify-order-tags
    customers = ShopifyAPI::Customer.find(:all)
    activeSubscribers = customers.select do |c|
      c.attributes[:tags].split(', ').include?('Active Subscriber')
    end
    @activeSubscriberCount = activeSubscribers.count
    

  end

  def getRechargeData(endpoint)
    # Access Recharge API
    api_token = '9ddfc399771643169db06e1b162a5b73'

    response = HTTParty.get(endpoint,
                             :headers => { "Content-Type" => 'application/json', "X-Recharge-Access-Token" => api_token})
   case response.code
      when 200
        puts "All good!"
      when 404
        puts "O noes not found!"
      when 500...600
        puts "ZOMG ERROR #{response.code}"
    end

    response.parsed_response
  end
end
