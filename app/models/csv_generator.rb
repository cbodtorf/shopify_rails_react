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

    attributes = %w{Customer\ Last\ Name First\ Name Address City State Zip Notes}

    orders.each do |order|
      Rails.logger.debug("order address: #{order.attributes.inspect}")
    end

    # CSV.generate(headers: true) do |csv|
    #   csv << attributes
    #
    #   reducedItems.each do |item|
    #     csv << attributes.map{ |attr| attr == 'product' ? item[0] : item[1] }
    #   end
    # end
  end
end
