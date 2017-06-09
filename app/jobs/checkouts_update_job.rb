class CheckoutsUpdateJob < ApplicationJob

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    # create order_note params
    hash = {}
    hash[:checkout_token] = webhook[:token]
    hash[:cart_token] = webhook[:cart_token]
    webhook[:note_attributes].select do |note|
      if note[:name] === 'postal_code' || note[:name] === 'delivery_time' || note[:name] === 'delivery_date' || note[:name] === 'checkout_method' || note[:name] === 'rate_id'
        Rails.logger.info("[hash Note]: #{note.inspect}")
        hash[note[:name].to_sym] = note[:value]
      end
    end

    Rails.logger.info("[right b4 sesh]: #{hash.inspect}")
    shop.with_shopify_session do
      # Make sure we have an order note
      @order_note = OrderNote.where(checkout_token: webhook[:token]).first
      Rails.logger.info("[Order Note sesh]: #{@order_note.inspect}")

      if @order_note == nil
        # If one doesn't exist we need to create one.
        @order_note = OrderNote.create(hash)
        @order_note.shipping_address = ShippingAddress.create(webhook[:shipping_address])

        if @order_note.save
          Rails.logger.info("[Order Note] - Saving: #{@order_note.inspect}")
          # Issue with checkouts/update running multiple instances, need to remove duplicates
          OrderNote.get_duplicates(:checkout_token, :cart_token).dedupe(:checkout_token, :cart_token)
        else
          Rails.logger.error("[Order Note] - Error: #{@order_note.inspect}")
        end

      else
        # order_note exits, update attributes or maybe do this in the app proxy

        Rails.logger.info("[Order Note] - exits: #{@order_note.inspect}")
        @order_note.update_attributes(hash)
        @order_note.shipping_address.update_attributes(webhook[:shipping_address])
        Rails.logger.info("[Order Note] - update: #{@order_note.inspect}")
        Rails.logger.info("[Shipping] - update: #{@order_note.shipping_address.inspect}")
      end
    end
  end

end
