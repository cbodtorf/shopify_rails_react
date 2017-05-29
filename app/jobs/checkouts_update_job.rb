class CheckoutsUpdateJob < ApplicationJob
  @@order_notes = nil

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      @@order_notes = OrderNote.new(webhook[:note_attributes])
      Rails.logger.info("[Order Notes] #{@@order_notes.inspect}")
      Rails.logger.info("[Shipping Address] #{webhook[:shipping_address].inspect}")
      @product = ShopifyAPI::Variant.find(:first, :params => {:product_id => 7896754117})
      if ((@product.weight >= 0) and (@product.weight < 1.0))
        @product.weight = @product.weight + 0.1
      elsif ((@product.weight > 0) and (@product.weight <= 1.0))
        @product.weight = @product.weight - 0.9
      end

      Rails.logger.info("[Product] #{@product.attributes}")
      @product.save

      # TODO: need to figure out how to update checkout and clear the cache
      # might need to utilize cart update instead?
    end
  end

  def self.getOrderNotes
    return @@order_notes
  end

end
