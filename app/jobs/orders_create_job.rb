class OrdersCreateJob < ApplicationJob

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      Rails.logger.info("[Order tags]: #{webhook[:tags].split(', ').inspect}")
      # Re-adjusting the delivery date on subsequent subscription orders.
      # Delivery Date == Charge Date + 1
      if webhook[:tags].split(', ').include?('Subscription Recurring Order')
        Rails.logger.info("[webhook[:created_at]]: #{webhook[:created_at].inspect}")
        delivery_date = (Date.parse(webhook[:created_at]) + 1)

        recurringSubscriptionOrder = ShopifyAPI::Order.find(webhook[:id])
        Rails.logger.info("[Recurring Sub Order]: #{recurringSubscriptionOrder.attributes[:note_attributes].inspect}")
        recurringSubscriptionOrder.attributes[:note_attributes].each do |note|
          if note.attributes[:name] == "delivery_date"
            note.attributes[:value] = delivery_date.readable_inspect
            Rails.logger.info("[change delivery date?]: #{note.attributes[:value].inspect} -vs- #{delivery_date.readable_inspect}")
          end
        end
        Rails.logger.info("[Recurring delivery date]: #{recurringSubscriptionOrder.attributes[:note_attributes].inspect}")
        recurringSubscriptionOrder.save

      end

      order_notes = shop.order_notes.where(checkout_token: webhook[:checkout_token])
      Rails.logger.info("[Order Delete - note]: #{order_note.inspect}")
      Rails.logger.info("[Order Delete - sa]: #{order_note.shipping_address.inspect}")
      # order has been created, we can do clear these unneeded records.
      order_notes.each do |note|
        note.shipping_address.destroy
        note.destroy
      end

    end
  end

end
