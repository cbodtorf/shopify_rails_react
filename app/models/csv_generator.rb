class CSVGenerator
  def self.generateItemCSV(orders)
    # Rails.logger.debug("order 4 csv (model): #{orders.inspect}")

    attributes = %w{product quantity}
    itemsArray = []
    orders.each do |order|
      order.attributes[:line_items].each do |item|

        if item.attributes[:properties].any?{|prop| prop.attributes["name"].split(" ").first === "item"}
          # account for bundle line items properties
          item.attributes[:properties].each do |prop|
            # make sure we get the correct properties
            if prop.attributes["name"].split(" ").first === "item" && prop.attributes["value"] != ""
              # make sure we note quantity of line item properties.
              itemAndQuantity = prop.attributes["value"].split(' x')
              itemsArray.push([itemAndQuantity.first, itemAndQuantity.last.to_i])
            end
          end
        else
          # normal behavior for non bundle items
          itemsArray.push([item.attributes[:title], item.attributes[:quantity]])
        end
      end
    end
    # Reduce duplicates
    reducedItems = itemsArray.inject(Hash.new(0)) do |result, item|
      result[item.first] += item.last
      result
    end.to_a

    # Rails.logger.debug("items (model): #{itemsArray.inspect}")
    # Rails.logger.debug("reduced items (model): #{reducedItems.inspect}")

    CSV.generate(headers: true) do |csv|
      csv << attributes

      reducedItems.each do |item|
        csv << attributes.map{ |attr| attr == 'product' ? item[0] : item[1] }
      end
    end
  end

  def self.generateAddressesCSV(orders)

    attributes = %w{Customer\ Last\ Name First\ Name Address Address\ 2 City State Zip Notes}
    shippingAddressArray = []
    orders.each do |order|
      Rails.logger.debug("order address: #{order.attributes.inspect}")
      s_a = order.attributes[:shipping_address].attributes
      shippingAddressArray.push({
        customer_last_name: s_a[:last_name],
        first_name: s_a[:first_name],
        address: s_a[:address1],
        address_2: s_a[:address2],
        city: s_a[:city],
        state: s_a[:province_code],
        zip: s_a[:zip],
        notes: s_a[:note],
      })
    end

    CSV.generate(headers: true) do |csv|
      csv << attributes

      shippingAddressArray.each do |address|
        Rails.logger.debug("address (model): #{address.inspect}")
        csv << attributes.map{ |attr| address[attr.parameterize.underscore.to_sym] }
      end
    end
  end
end
