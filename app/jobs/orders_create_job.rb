class OrdersCreateJob < ApplicationJob

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      Rails.logger.info("[Order tags]: #{webhook[:tags].split(', ').inspect}")
      cart_token = ''
      order = ShopifyAPI::Order.find(webhook[:id])
      rates = shop.rates.select("id, title")
      saveOrder = false
      shippingLine = webhook[:shipping_lines].first[:title]

      if webhook[:tags].split(', ').include?('Subscription')
        # TODO: change rate id note attribute if order shipping line is different
        # TODO: this is temporary fix, should prevent this from happening
        subscriptionOrder = order
        Rails.logger.info("[subscriptionOrder]: #{subscriptionOrder.inspect}")
        Rails.logger.info("[shippingLine]: #{shippingLine.inspect}")


        subscriptionOrder.attributes[:note_attributes].each do |note|
          Rails.logger.info("[note?]: #{note.inspect}")
          if note.attributes[:name] == "rate_id"
            Rails.logger.info("[rate match]: #{rates.find(note.attributes[:value].to_i)[:title]} != #{shippingLine} ? #{rates.find(note.attributes[:value].to_i)[:title] != shippingLine}")
            if rates.find(note.attributes[:value].to_i)[:title] != shippingLine
              Rails.logger.info("[change shipping rate?]: #{note.attributes[:value].inspect}")
              note.attributes[:value] = rates.find_by(title: shippingLine)[:id].to_i
              saveOrder = true
            end
          end
        end


        # Re-adjusting the delivery date on subsequent subscription orders.
        # Delivery Date == Charge Date + 1
        Rails.logger.info("[recurring?]: #{webhook[:tags].split(', ').include?('Subscription Recurring Order').inspect}")
        if webhook[:tags].split(', ').include?('Subscription Recurring Order')
          Rails.logger.info("[webhook[:created_at]]: #{webhook[:created_at].inspect}")
          delivery_date = (Date.parse(webhook[:created_at]) + 1)

          Rails.logger.info("[Recurring Sub Order]: #{subscriptionOrder.attributes[:note_attributes].inspect}")
          subscriptionOrder.attributes[:note_attributes].each do |note|
            if note.attributes[:name] == "delivery_date"
              note.attributes[:value] = delivery_date.strftime("%a, %B %e, %Y")
              Rails.logger.info("[change delivery date?]: #{note.attributes[:value].inspect} -vs- #{delivery_date.readable_inspect}")
              saveOrder = true
            end
          end
          Rails.logger.info("[Recurring delivery date]: #{subscriptionOrder.attributes[:note_attributes].inspect}")
        end
      end

      Rails.logger.info("[saveOrder?]: #{saveOrder.inspect}")
      if saveOrder
        subscriptionOrder.save
      end
    end
  end

end
