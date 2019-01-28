class BulkCancelFulfillJob < ApplicationJob
  def perform(shop_domain, order_ids)
    shop = Shop.find_by(shopify_domain: shop_domain)

    Rails.logger.info("shop: #{shop.inspect}")
    shop.with_shopify_session do
      order_fields = "id,line_items"
      cancel_fulfillments(order_fields, order_ids)
    end
  rescue ActiveResource::ResourceNotFound, ActiveResource::ClientError
    Rails.logger.warn("[#{self.class.name}] Shop not found shop_id=#{shop.id} shop_domain=#{shop_domain}")
  end

  def cancel_fulfillments(order_fields, order_ids)
    orders = ShopifyAPI.throttle { ShopifyAPI::Order.find(:all, :params=>{:status => "closed", :fields => order_fields, :ids => order_ids}) }
    Rails.logger.debug("orders size: #{orders.size}")
    fulfillments = []
    orders.map do |order|
      fulfillments.concat ShopifyAPI.throttle { ShopifyAPI::Fulfillment.find(:all, :params => { :order_id => order.id }) }
    end

    fulfillments.each do |f|
      ShopifyAPI.throttle { f.cancel }
    end
  end
end