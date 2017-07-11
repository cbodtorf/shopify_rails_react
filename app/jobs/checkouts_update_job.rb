class CheckoutsUpdateJob < ApplicationJob

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    # create order_note params
    # TODO: might be an issue with postal_code. We don't really need it so we may want to consider axing it.
    hash = {}
    hash[:checkout_token] = webhook[:token]
    hash[:cart_token] = webhook[:cart_token]
    webhook[:note_attributes].select do |note|
      if note[:name] === 'delivery_date' || note[:name] === 'checkout_method' || note[:name] === 'rate_id'
        Rails.logger.info("[hash Note]: #{note.inspect}")
        hash[note[:name].to_sym] = note[:value]
      end
    end

    Rails.logger.info("[right b4 sesh]: #{hash.inspect}")
    # this could be our cue to cycle order notes and delete those that have been completed.
    if webhook[:completed_at] == nil
      shop.with_shopify_session do
        # Make sure we have an order note
        @order_note = OrderNote.where(checkout_token: webhook[:token]).first
        Rails.logger.info("[Order Note sesh]: #{@order_note.inspect}")

        if @order_note == nil
          # If one doesn't exist we need to create one.
          # debugger
          @order_note = OrderNote.create(hash)
          Rails.logger.info("[Order Note nil to new]: #{@order_note.inspect}")
          @order_note.shipping_address = ShippingAddress.create(webhook[:shipping_address])
          Rails.logger.info("[Order Note shipping?]: #{@order_note.shipping_address.inspect}")


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
    else
      # delete order with this a completed checkout.
      Rails.logger.info("[Checkout Complete]: #{webhook[:completed_at].inspect}")
      @order_note = OrderNote.where(checkout_token: webhook[:token]).first
      if @order_note
        @order_note.shipping_address.destroy
        @order_note.destroy
      end
    end
  end

end
