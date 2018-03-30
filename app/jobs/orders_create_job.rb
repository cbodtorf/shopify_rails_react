class OrdersCreateJob < ApplicationJob

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      order = ShopifyAPI::Order.find(webhook[:id])
      delivery_date = ""
      update_delivery_date_for_recharge = false
      tags = order.tags.split(',').map(&:strip)

      tag_orders_flag = false # false will not tag. Not approved by client.

      if webhook[:tags].split(', ').include?('Subscription')
        Rails.logger.info("[subscriptionOrder]: #{order.inspect}")

        # Re-adjusting the delivery date on subsequent subscription orders.
        # Delivery Date == Charge Date + 1
        Rails.logger.info("[recurring?]: #{webhook[:tags].split(', ').include?('Subscription Recurring Order').inspect}")
        if webhook[:tags].split(', ').include?('Subscription Recurring Order')
          Rails.logger.info("[webhook[:created_at]]: #{webhook[:created_at].inspect}")
          delivery_date = (Date.parse(webhook[:created_at]) + 1)
          delivery_date = delivery_date.strftime("%a, %B %e, %Y")
          update_delivery_date_for_recharge = true

          Rails.logger.info("[Recurring Sub Order]: #{order.attributes[:note_attributes].inspect}")
          Rails.logger.info("[Recurring delivery date]: #{order.attributes[:note_attributes].inspect}")
        end
      end

      # loop attributes and tag
      order.attributes[:note_attributes].each do |note|
        if note.attributes[:name] == "Delivery Date"
          if update_delivery_date_for_recharge
            note.attributes[:value] = delivery_date
            Rails.logger.info("[change delivery date?]: #{note.attributes[:value].inspect} -vs- #{delivery_date.readable_inspect}")
          end
          tags << Date.parse(note.attributes[:value]).strftime("%m/%d/%Y")
          tags << Date.parse(note.attributes[:value]).strftime("%A")
        end
        if note.attributes[:name] == "Receive Window"
          tags << note.attributes[:value]
        end
        if note.attributes[:name] == "Checkout Method"
          tags << note.attributes[:value]
        end
      end

      updated_tags = tags.uniq.join(',')
      unless updated_tags == order.tags || order.attributes[:note_attributes] == webhook[:note_attributes]
        unless updated_tags == order.tags || tag_orders_flag == false
          order.tags = updated_tags
        end

        order.save
      end
    end
  end

end
