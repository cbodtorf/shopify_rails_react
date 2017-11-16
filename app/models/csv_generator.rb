class CSVGenerator
  def self.generateItemCSV(orders)
    # Rails.logger.debug("order 4 csv (model): #{orders.inspect}")

    attributes = %w{product quantity}
    itemsArray = []
    orders.each do |order|
      order.attributes[:line_items].each do |item|
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

              itemsArray.push([itemAndQuantity.first, (itemAndQuantity.last.to_i * item.attributes[:quantity])])
            end
          end
        else
          # normal behavior for non bundle items
          itemsArray.push([item.attributes[:title], item.attributes[:quantity]])
        end
      end
    end
    Rails.logger.debug("items 4 csv (model): #{itemsArray.inspect}")
    # Reduce duplicates
    reducedItems = itemsArray.inject(Hash.new(0)) do |result, item|
      result[item.first] += item.last
      result
    end.to_a
    Rails.logger.debug("reduceed 4 csv (model): #{reducedItems.inspect}")

    CSV.generate(headers: true) do |csv|
      csv << attributes

      reducedItems.each do |item|
        csv << attributes.map{ |attr| attr == 'product' ? item[0] : item[1] }
      end
    end
  end

  def self.generateAddressesCSV(orders, shop)
    rates = Shop.find_by(shopify_domain: shop.attributes[:domain]).rates

    attributes = %w{Customer\ Last\ Name First\ Name Address Address\ 2 City State Zip Receive\ Window Notes}
    shippingAddressArray = []
    shippingAddressArray.push({
      customer_last_name: shop.attributes[:name],
      first_name: '',
      address: shop.attributes[:address1],
      address_2: shop.attributes[:address2],
      city: shop.attributes[:city],
      state: shop.attributes[:province_code],
      zip: shop.attributes[:zip],
      receive_window: '',
      notes: '',
    })
    Rails.logger.debug("bamboo: #{shop.attributes.inspect}")
    orders.each do |order|
      Rails.logger.debug("s_a: #{order.attributes[:shipping_address].inspect}")
      s_a = order.attributes[:shipping_address].attributes
      shippingAddressArray.push({
        customer_last_name: s_a[:last_name],
        first_name: s_a[:first_name],
        address: s_a[:address1],
        address_2: s_a[:address2],
        city: s_a[:city],
        state: s_a[:province_code],
        zip: s_a[:zip],
        receive_window: rates.find(order.note_attributes.find {|note| note.name == "Delivery Rate"}.value.split("]")[0].split("[")[1].to_i).receive_window,
        notes: order.attributes[:note],
      })
    end

    CSV.generate(headers: true) do |csv|
      csv << attributes

      shippingAddressArray.each do |address|
        csv << attributes.map{ |attr| address[attr.parameterize.underscore.to_sym] }
      end
    end
  end

end
