class OrdersCreateJob < ApplicationJob

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      Rails.logger.info("[Order tags]: #{webhook[:tags].split(', ').inspect}")
      # Re-adjusting the delivery date on subsequent subscription orders.
      # Delivery Date == Charge Date + 1
      if webhook[:tags].split(', ').include?('Subscription Recurring Order')
        delivery_date = Date.parse(webhook[:created_at]) + 1

        recurringSubscriptionOrder = ShopifyAPI::Order.find(webhook[:id])
        Rails.logger.info("[Recurring Sub Order]: #{recurringSubscriptionOrder.attributes[:note_attributes].inspect}")
        recurringSubscriptionOrder.attributes[:note_attributes].each do |note|
          if note.attributes[:name] == "delivery_date"
            note.attributes[:value] = delivery_date
            Rails.logger.info("[change delivery date?]: #{note.attributes[:value].inspect} -vs- #{delivery_date}")
          end
        end
        Rails.logger.info("[Recurring delivery date]: #{recurringSubscriptionOrder.attributes[:note_attributes].inspect}")
        recurringSubscriptionOrder.save
      end

      order_note = shop.order_notes.where(checkout_token: webhook[:checkout_token]).first
      Rails.logger.info("[Order Create - note]: #{order_note.inspect}")
      Rails.logger.info("[Order Create - sa]: #{order_note.shipping_address.inspect}")
      # order has been created, we can do clear these unneeded records.
      order_note.shipping_address.destroy
      order_note.destroy
    end
  end

end
