class BulkFulfillJob < ApplicationJob
  def perform(shop_domain, order_ids)
    shop = Shop.find_by(shopify_domain: shop_domain)

    Rails.logger.info("shop: #{shop.inspect}")
    shop.with_shopify_session do
      order_fields = "id,line_items"
      fulfill_orders(order_fields, order_ids)
    end
  rescue ActiveResource::ResourceNotFound, ActiveResource::ClientError
    Rails.logger.warn("[#{self.class.name}] Shop not found shop_id=#{shop.id} shop_domain=#{shop_domain}")
  end

  def fulfill_orders(order_fields, order_ids)
    orders = ShopifyAPI.throttle { ShopifyAPI::Order.find(:all, :params=>{:status => "open", :fields => order_fields, :ids => order_ids}) }
    location = ShopifyAPI.throttle { ShopifyAPI::Location.find(:first, :params=>{:active => true}) }
    Rails.logger.debug("orders: #{orders.inspect}")
    Rails.logger.debug("orders size: #{orders.size}")
    fulfillments = orders.map do |order|
      ShopifyAPI.throttle { ShopifyAPI::Fulfillment.new(:location_id => location.id, :order_id => order.id, :notify_customer => false, :line_items => order.line_items.map{|item| {"id" => item.id}} ) }
    end
    Rails.logger.debug("fulfillments: #{fulfillments.size}")

    fulfillments.each do |f|
      Rails.logger.info("success: #{f.inspect} // #{ShopifyAPI.credit_left}")
      if ShopifyAPI.throttle { f.save }
        Rails.logger.info("success: #{f.inspect}")
      else
        Rails.logger.error("error: #{f.inspect}")
      end
    end
  end
end