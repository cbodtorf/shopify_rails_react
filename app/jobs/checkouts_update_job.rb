class CheckoutsUpdateJob < ApplicationJob
  @@order_notes = nil

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      @@order_notes = OrderNote.where(checkout_token: webhook[:token]).first
      Rails.logger.info("[Order Notes] #{@@order_notes.inspect}")
      # Rails.logger.info("[Shipping Address] #{webhook[:shipping_address].inspect}")
      Rails.logger.info("[Shipping Address] #{webhook[:email].inspect}")
      # @checkout = ShopifyAPI::Checkout.find(webhook[:token])

      # Rails.logger.info("[Checkout pre] #{@checkout.attributes[:shipping_address].attributes[:company].inspect}")
      # if @checkout.attributes[:shipping_address].attributes[:company] == nil
      #   @checkout.attributes[:shipping_address].attributes[:company] = ' '
      #   Rails.logger.info("[Checkout nil] #{@checkout.attributes[:shipping_address].attributes[:company].inspect}")
      # else
      #   @checkout.attributes[:shipping_address].attributes[:company] = @checkout.attributes[:shipping_address].attributes[:company] + ' '
      #   Rails.logger.info("[Checkout other] #{@checkout.attributes[:shipping_address].attributes[:company].inspect}")
      # end
      #
      # Rails.logger.debug("[Checkout methods] #{@checkout.methods - Object.methods}")
      # Rails.logger.debug("[Checkout test] #{@checkout.schema}")
      # if @checkout.valid?
      #   Rails.logger.debug("[Checkout save success] #{@checkout.inspect}")
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
      # @product = ShopifyAPI::Variant.find(:first, params: {id: webhook[:line_items][0][:variant_id]})
      # Rails.logger.debug("[Product Variant 1] #{webhook[:line_items][0][:variant_id].inspect}")
      # Rails.logger.debug("[Product Variant 1] #{webhook[:line_items][0].variant_id.inspect}")
      #
      # if ((@product.weight >= 0) and (@product.weight < 1.0))
      #   @product.weight = @product.weight + 1.0
      # elsif ((@product.weight > 0) and (@product.weight <= 1.0))
      #   @product.weight = @product.weight - 0.9
      # else
      #   @product.weight = @product.weight + 1.0
      # end
      #
      # if @product.save
      #   Rails.logger.debug("[Product save-success] #{@product.inspect}")
      # else
      #   Rails.logger.debug("[Product save-error] #{@product.inspect}")
      # end

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
