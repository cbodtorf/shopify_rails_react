class OrdersCreateJob < ApplicationJob

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      Rails.logger.info("[Order tags]: #{webhook[:tags].split(', ').inspect}")
      cart_token = ''
      order = ShopifyAPI::Order.find(webhook[:id])


      if webhook[:tags].split(', ').include?('Subscription')
        subscriptionOrder = order
        Rails.logger.info("[subscriptionOrder]: #{subscriptionOrder.inspect}")


        # Re-adjusting the delivery date on subsequent subscription orders.
        # Delivery Date == Charge Date + 1
        if webhook[:tags].split(', ').include?('Subscription Recurring Order')
          Rails.logger.info("[webhook[:created_at]]: #{webhook[:created_at].inspect}")
          delivery_date = (Date.parse(webhook[:created_at]) + 1)

          Rails.logger.info("[Recurring Sub Order]: #{subscriptionOrder.attributes[:note_attributes].inspect}")
          subscriptionOrder.attributes[:note_attributes].each do |note|
            if note.attributes[:name] == "delivery_date"
              note.attributes[:value] = delivery_date.readable_inspect
              Rails.logger.info("[change delivery date?]: #{note.attributes[:value].inspect} -vs- #{delivery_date.readable_inspect}")
            end
          end
          Rails.logger.info("[Recurring delivery date]: #{subscriptionOrder.attributes[:note_attributes].inspect}")
          subscriptionOrder.save
        end
      end

    end
  end

end
