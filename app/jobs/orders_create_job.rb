class OrdersCreateJob < ApplicationJob

  def orderAttributesToHash(_attr)
    obj = {}
    _attr.each do |a|
      obj[a.attributes[:name].parameterize.underscore.to_sym] = a.attributes[:value]
    end
    return obj
  end

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      Rails.logger.info("[Order tags]: #{webhook[:tags].split(', ').inspect}")
      cart_token = ''
      order = ShopifyAPI::Order.find(webhook[:id])
      orderAttributes = orderAttributesToHash(order.attributes[:note_attributes])
      rates = shop.rates.select("id, title, delivery_method")

      saveOrder = false
      shippingLine = webhook[:shipping_lines].first[:title]

      if webhook[:tags].split(', ').include?('Subscription')
        # TODO: change rate id note attribute if order shipping line is different
        # TODO: this is temporary fix, should prevent this from happening
        Rails.logger.info("[subscriptionOrder]: #{order.inspect}")
        Rails.logger.info("[orderAttributes]: #{orderAttributes.inspect}")
        Rails.logger.info("[shippingLine]: #{shippingLine.inspect}")

        if orderAttributes[:delivery_rate].present?
          rateFromAttribute = rates.find(orderAttributes[:delivery_rate].split(']')[0].split('[')[1].to_i)
          Rails.logger.info("[rateFromAttribute]: #{rateFromAttribute.inspect}")
          # Don't change for pickup (only available to admin)
          if rateFromAttribute[:title] != shippingLine && rateFromAttribute[:delivery_method] == "delivery"
            Rails.logger.info("[change shipping rate]")
            newRate = rates.find_by(delivery_method: "shipping")

            order.attributes[:note_attributes].select! do |note|
              if note.attributes[:name] == "Delivery Rate"
                note.attributes[:value] = "[#{newRate[:id].to_i}] #{newRate[:title]}"
              elsif note.attributes[:name] == "Checkout Method"
                note.attributes[:value] = newRate[:delivery_method]
              end
            end
            saveOrder = true
          end
        end

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
      else

        # Not a Subscription
        if orderAttributes[:delivery_rate].present?
          rateFromAttribute = rates.find(orderAttributes[:delivery_rate].split(']')[0].split('[')[1].to_i)
          Rails.logger.info("[rateFromAttribute]: #{rateFromAttribute.inspect}")
          # Don't shipping
          if rateFromAttribute[:title] != shippingLine && rateFromAttribute[:delivery_method] != "shipping"
            Rails.logger.info("[change shipping rate]")
            newRate = rates.find_by(delivery_method: "shipping")

            order.attributes[:note_attributes].select! do |note|
              if note.attributes[:name] == "Delivery Rate"
                note.attributes[:value] = "[#{newRate[:id].to_i}] #{newRate[:title]}"
              elsif note.attributes[:name] == "Checkout Method"
                note.attributes[:value] = newRate[:delivery_method]
              end
            end
            saveOrder = true
          end
        end

      end

      Rails.logger.info("[saveOrder?]: #{saveOrder.inspect}")
      if saveOrder
        order.save
      end
    end
  end

end
