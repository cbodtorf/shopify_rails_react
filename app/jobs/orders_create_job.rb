class OrdersCreateJob < ApplicationJob

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      order = ShopifyAPI::Order.find(webhook[:id])

      saveOrder = false

      if webhook[:tags].split(', ').include?('Subscription')
        Rails.logger.info("[subscriptionOrder]: #{order.inspect}")

        # Re-adjusting the delivery date on subsequent subscription orders.
        # Delivery Date == Charge Date + 1
        Rails.logger.info("[recurring?]: #{webhook[:tags].split(', ').include?('Subscription Recurring Order').inspect}")
        if webhook[:tags].split(', ').include?('Subscription Recurring Order')
          Rails.logger.info("[webhook[:created_at]]: #{webhook[:created_at].inspect}")
          delivery_date = (Date.parse(webhook[:created_at]) + 1)

          Rails.logger.info("[Recurring Sub Order]: #{order.attributes[:note_attributes].inspect}")
          order.attributes[:note_attributes].each do |note|
            if note.attributes[:name] == "Delivery Date"
              note.attributes[:value] = delivery_date.strftime("%a, %B %e, %Y")
              Rails.logger.info("[change delivery date?]: #{note.attributes[:value].inspect} -vs- #{delivery_date.readable_inspect}")
              saveOrder = true
            end
          end
          Rails.logger.info("[Recurring delivery date]: #{order.attributes[:note_attributes].inspect}")
        end

      end

      Rails.logger.info("[saveOrder?]: #{saveOrder.inspect}")
      if saveOrder
        order.save
      end
    end
  end

end
