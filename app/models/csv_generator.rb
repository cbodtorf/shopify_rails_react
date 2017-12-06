class CSVGenerator
  def self.generateItemCSV(orders)
    # Rails.logger.debug("order 4 csv (model): #{orders.inspect}")

    attributes = %w{product quantity}
    items_array = []
    orders.each do |order|
      # sort refunds
      if order.attributes[:financial_status] == "partially_refunded"
        refunded_item_ids = []
        refunded_items = {}
        order.attributes[:refunds].each do |refund|
          refund.attributes[:refund_line_items].each do |r_item|
            refunded_item_ids.push(r_item.attributes[:line_item_id])
            if refunded_items[r_item.attributes[:line_item_id]] == nil
              refunded_items[r_item.attributes[:line_item_id]] = r_item.attributes[:quantity]
            else
              refunded_items[r_item.attributes[:line_item_id]] += r_item.attributes[:quantity]
            end
          end
        end
      end

      order.attributes[:line_items].each do |item|
        item_quantity = item.attributes[:quantity]
        # subtract refund quantities
        unless refunded_item_ids.blank?
          if refunded_item_ids.include?(item.attributes[:id])
            item_quantity -= refunded_items[item.attributes[:id]]
          end
        end

        if item_quantity > 0 && item.attributes[:requires_shipping]
          if item.attributes[:title].include?("Auto renew") # modify name of Subscriptions
            item.attributes[:title] = item.attributes[:title].split('Auto renew').first.strip
          end
          if item.attributes[:properties].any?{|prop| prop.attributes["name"].split(" ").first === "item" && prop.attributes["value"] != "" }
            # account for bundle line items properties
            item.attributes[:properties].each do |prop|
              # make sure we get the correct properties
              if prop.attributes["name"].split(" ").first === "item" && prop.attributes["value"] != ""
                # make sure we note quantity of line item properties.
                itemAndQuantity = prop.attributes["value"].split(' x')

                items_array.push([itemAndQuantity.first, (itemAndQuantity.last.to_i * item_quantity)])
              end
            end
          else
            # normal behavior for non bundle items
            items_array.push([item.attributes[:title], item_quantity])
          end
        end
      end
    end

    # Reduce duplicates
    reduced_items = items_array.inject(Hash.new(0)) do |result, item|
      result[item.first] += item.last
      result
    end.to_a
    Rails.logger.debug("reduceed 4 csv (model): #{reduced_items.inspect}")

    CSV.generate(headers: true) do |csv|
      csv << attributes

      reduced_items.each do |item|
        csv << attributes.map{ |attr| attr == 'product' ? item[0] : item[1] }
      end
    end
  end

  def self.generateAddressesCSV(orders, shop, cook)
    rates = Shop.find_by(shopify_domain: shop.attributes[:myshopify_domain]).rates
    cook_time = cook.split(' ').first.downcase
    # Rails.logger.debug("cook_time: #{cook_time}")

    attributes = %w{Customer\ Last\ Name First\ Name Address Address\ 2 City State Zip Notes}
    shipping_address_array = []
    shipping_address_array.push({
      customer_last_name: shop.attributes[:name],
      first_name: '',
      address: shop.attributes[:address1],
      address_2: shop.attributes[:address2],
      city: shop.attributes[:city],
      state: shop.attributes[:province_code],
      zip: shop.attributes[:zip],
      notes: '',
    })

    if cook_time == 'morning'
      attributes = %w{Customer\ Last\ Name First\ Name Address Address\ 2 City State Zip Receive\ Window Notes}
      shipping_address_array.first[:receive_window] = ""
    end

    orders.each do |order|

      receive_window = ''
      if order.attributes[:tags].split(', ').include?('Subscription')
        receive_window = 'Subscription'
      else
        receive_window = rates.find(order.note_attributes.find {|note| note.name == "Delivery Rate"}.value.split("]")[0].split("[")[1].to_i).receive_window
      end

      Rails.logger.debug("s_a: #{order.attributes[:shipping_address].inspect}")
      s_a = order.attributes[:shipping_address].attributes
      address_to_push = {
        customer_last_name: s_a[:last_name],
        first_name: s_a[:first_name],
        address: s_a[:address1],
        address_2: s_a[:address2],
        city: s_a[:city],
        state: s_a[:province_code],
        zip: s_a[:zip],
        notes: order.attributes[:note],
      }
      if cook_time == 'morning'
        address_to_push[:receive_window] = receive_window
      end

      shipping_address_array.push(address_to_push)
    end

    CSV.generate(headers: true) do |csv|
      csv << attributes

      shipping_address_array.each do |address|
        csv << attributes.map{ |attr| address[attr.parameterize.underscore.to_sym] }
      end
    end
  end

end
