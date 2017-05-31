class CheckoutsUpdateJob < ApplicationJob
  @@order_notes = nil
  @@customer = nil

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      @@order_notes = OrderNote.new(webhook[:note_attributes])
      Rails.logger.info("[Order Notes] #{@@order_notes.inspect}")
      # Rails.logger.info("[Shipping Address] #{webhook[:shipping_address].inspect}")
      Rails.logger.info("[Shipping Address] #{webhook[:email].inspect}")
      # @checkout = ShopifyAPI::Checkout.find(webhook[:token])
      # Rails.logger.info("[Checkout] #{@checkout.attributes[:shipping_address].attributes[:company].inspect}")
      # if @checkout.attributes[:shipping_address].attributes[:company] == nil
      #   @checkout.attributes[:shipping_address].attributes[:company] = ' '
      #   Rails.logger.info("[Checkout] #{@checkout.attributes[:shipping_address].attributes[:company].inspect}")
      # else
      #   @checkout.attributes[:shipping_address].attributes[:company] = @checkout.attributes[:shipping_address].attributes[:company] + ' '
      #   Rails.logger.info("[Checkout] #{@checkout.attributes[:shipping_address].attributes[:company].inspect}")
      # end
      # if @checkout.save
      #   Rails.logger.info("[Checkout save success] #{@checkout.inspect}")
      # else
      #   Rails.logger.debug("[Checkout save fail] #{@checkout.inspect}")
      # end

      # @customer = ShopifyAPI::Customer.find(:first, params: {id: webhook[:customer][:id]})
      # @@customer = @customer
      # Rails.logger.debug("[Customer Address] #{@customer.attributes[:addresses].inspect}")
      #
      # if @customer.attributes[:addresses][0].attributes[:company] == nil
      #   @customer.attributes[:addresses][0].attributes[:company] = '_'
      # else
      #   @customer.attributes[:addresses][0].attributes[:company] = @customer.attributes[:addresses][0].attributes[:company] + '-'
      # end
      # Rails.logger.debug("[Customer Company] #{@customer.attributes[:addresses][0].attributes[:company].inspect}")
      # @customer.save
      #
      # @product = ShopifyAPI::Variant.find(:all, params: {id: webhook[:line_items][0].variant_id})
      # Rails.logger.debug("[Product Variant 1] #{webhook[:line_items][0].variant_id.inspect}")
      # if ((@product.weight >= 0) and (@product.weight < 1.0))
      #   @product.weight = @product.weight + 0.001
      # elsif ((@product.weight > 0) and (@product.weight <= 1.0))
      #   @product.weight = @product.weight - 0.9
      # end
      # @product.save

      # TODO: need to figure out how to update checkout and clear the cache
      # might need to utilize cart update instead?
    end
  end

  def self.getOrderNotes
    return @@order_notes
  end
  def self.getCustomer
    return @@customer
  end

end
