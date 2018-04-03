class OrdersCreateJob < ApplicationJob

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      order = ShopifyAPI::Order.find(webhook[:id])
      delivery_date = ""
      delivery_date_checker = ""
      update_delivery_date_for_recharge = false
      tags = order.tags.split(',').map(&:strip)
      tag_orders_flag = false # false will not tag. Not approved by client.

      orderAttributes = orderAttributesToHash(order.attributes[:note_attributes])
      note_date = Date.parse(orderAttributes[:delivery_date])

      # Sort by cook time
      schedules = shop.cook_schedules.all.sort_by { |sched| sched[:cook_time] }
      # blackout dates
      blackout_dates = shop.blackout_dates.pluck(:blackout_date)

      # Find cook_day and cook_schedule that rate belongs to
      day_before_blackout = blackout_dates.any? {|date| (note_date - 1.day) == date.to_date}
      Rails.logger.debug("day_before_blackout: #{day_before_blackout}")
      last_cook_not_available_day_before = schedules.last.cook_days.any? {|day| day.title.downcase == (note_date - 1.day).strftime("%A").downcase && day.rates.empty?}


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
        elsif webhook[:tags].split(', ').include?('Subscription First Order')
          if Date.parse(webhook[:created_at])

          end
        end
      end

      # loop attributes and tag
      order.attributes[:note_attributes].each do |note|
        if note.attributes[:name] == "Delivery Date"
          if update_delivery_date_for_recharge
            note.attributes[:value] = delivery_date
            Rails.logger.info("[change delivery date?]: #{note.attributes[:value].inspect} -vs- #{delivery_date.readable_inspect}")
          end
          delivery_date_checker = note.attributes[:value]
          tags << Date.parse(note.attributes[:value]).strftime("%m/%d/%Y")
          tags << Date.parse(note.attributes[:value]).strftime("%A")
        end
        if note.attributes[:name] == "Receive Window"
          Rails.logger.info("[receive window]: #{note.attributes[:value].inspect}")

          if webhook[:tags].split(', ').include?('Subscription')
            if day_before_blackout
              # day before no cook or blackout
              note.attributes[:value] = "4pm - 8pm"
            elsif last_cook_not_available_day_before
              # day before no cook or blackout
              note.attributes[:value] = "4pm - 8pm"
            else
              note.attributes[:value] = "10am - 4pm"
            end
          end
          
          if webhook[:tags].split(', ').include?('Subscription First Order')
            Rails.logger.info("[first sub & receive_window]: #{webhook[:tags].split(', ').include?('Subscription First Order')}")
              Rails.logger.info("[created at today? && delivered today?]: #{(DateTime.parse(webhook[:created_at]).today? && DateTime.parse(delivery_date_checker).today?)}")
              Rails.logger.info("[delivered tomorrow]: #{Date.parse(webhook[:created_at]).tomorrow == Date.parse(delivery_date_checker)}")
              Rails.logger.info("[created after 15]: #{DateTime.parse(webhook[:created_at]).hour >= 15}")
              Rails.logger.info("[created after 15 and delivered tomorrow?]: #{(Date.parse(webhook[:created_at]).tomorrow == Date.parse(delivery_date_checker) && DateTime.parse(webhook[:created_at]).hour >= 15)}")
              Rails.logger.info("[full conditional]: #{(DateTime.parse(webhook[:created_at]).today? && DateTime.parse(delivery_date_checker).today?) || (Date.parse(webhook[:created_at]).tomorrow == Date.parse(delivery_date_checker) && DateTime.parse(webhook[:created_at]).hour >= 15)}")
            if (DateTime.parse(webhook[:created_at]).today? && DateTime.parse(delivery_date_checker).today?) || (Date.parse(webhook[:created_at]).tomorrow == Date.parse(delivery_date_checker) && DateTime.parse(webhook[:created_at]).hour >= 15)
              # deliver same day as order
              note.attributes[:value] = "4pm - 8pm"
            end
          end

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

  def orderAttributesToHash(_attr)
    obj = {}
    _attr.each do |a|
      obj[a.attributes[:name].parameterize.underscore.to_sym] = a.attributes[:value]
    end
    return obj
  end

end
