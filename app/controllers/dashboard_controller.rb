class DashboardController < ShopifyApp::AuthenticatedController
  def index

    @fiveDayOrders = self.formatOrders

    @fiveDayOrders.map do |date|
      date[:revenue] = 0
      if date[:afternoon].size > 0
        date[:afternoon].each do |order|
          date[:revenue] += order.attributes[:total_price].to_f
        end
      end
      if date[:morning].size > 0
        date[:morning].each do |order|
          date[:revenue] += order.attributes[:total_price].to_f
        end
      end
      if date[:pickup].size > 0
        date[:pickup].each do |order|
          date[:revenue] += order.attributes[:total_price].to_f
        end
      end
    end
    # Rails.logger.debug("order date time: #{@fiveDayOrders.inspect}")

    # Subscriber Count (tagged with Active Subscriber)
    # http://support.rechargepayments.com/article/191-shopify-order-tags
    customers = ShopifyAPI::Customer.find(:all)
    activeSubscribers = customers.select do |c|
      c.attributes[:tags].split(', ').include?('Active Subscriber')
    end
    @activeSubscriberCount = activeSubscribers.count

    # Customer Count:
    @customerCount = ShopifyAPI::Customer.count

    # Bundle Information
    @bundles = ShopifyAPI::Product.find(:all, params: { product_type: 'bundle' })

    # Product Information
    @productCount = ShopifyAPI::Product.count
  end

  def generateCSV
    dates = self.formatOrders
    selectedDate = dates.select do |order|
      order[:date] == Date.parse(params[:date])
    end.first

    # Morning Cooks consist of morning deliveries and pickup orders. Addresses don't need pickup orders
    if params[:time] == 'morning' && params[:attribute] == 'items'
      @orders = selectedDate[:morning].concat(selectedDate[:pickup])
    elsif params[:time] == 'morning' && params[:attribute] == 'addresses'
      @orders = selectedDate[:morning]
    elsif params[:time] == 'afternoon'
      @orders = selectedDate[:afternoon]
    end
    Rails.logger.debug("order check?: #{@orders.inspect}")

    respond_to do |format|
      format.html
      format.csv {
        send_data params[:attribute] == "items" ? CSVGenerator.generateItemCSV(@orders) : CSVGenerator.generateAddressesCSV(@orders),
        filename: "#{Date.parse(params[:date])}_#{params[:time]}-#{params[:attribute]}.csv"
      }
    end
  end

  def showOrders
    dates = self.formatOrders
    selectedDate = dates.select do |order|
      order[:date] == Date.parse(params[:date])
    end.first

    @orders = selectedDate[params[:attribute].to_sym]

  end

  def formatOrders
    # Shopify requires time to be iso8601 format
    # Order Information 7 day range ( limit for which orders )
    # TODO: make sure this range is right,
    t = Time.now
    t8601 = t.iso8601
    sixDaysAgo = (t - 6.day).iso8601
    @orders = ShopifyAPI::Order.find(:all, params: { created_at_min: sixDaysAgo })
    # Rails.logger.debug("notes order: #{@orders.inspect}")

    date_from  = Date.current
    date_to    = date_from + 4
    date_range = (date_from..date_to).map()
    @fiveDayOrders = date_range.map {|date| {date: date, morning: [], afternoon: [], pickup: [], shipping: [], delivery: []}}
      @orders.each do |order|
        # TODO: error handling for orders that do NOT have note attributes.
        Rails.logger.debug("notes order: #{order.attributes[:note_attributes].inspect}")
        # Isolate Delivery Date
        dates = order.attributes[:note_attributes].select do |note|
          note.attributes[:name] === "delivery_date"
        end
        # Isolate Delivery Rate
        rates = order.attributes[:note_attributes].select {|note| note.attributes[:name] === "rate_id"}
        Rails.logger.debug("notes rate: #{rates.inspect}")
        rate = Rate.find(rates[0].attributes[:value])
        # Rails.logger.debug("notes rate: #{order.attributes[:note_attributes].inspect}")
        if dates[0] != nil
          @fiveDayOrders.map do |date|
            # Organize orders for counts
            if date[:date] == Date.parse(dates[0].attributes[:value])
              date[rate[:delivery_method].downcase.to_sym].push(order)
            end

            # Organize CSV orders
            if rate[:delivery_method].downcase == "delivery" || rate[:delivery_method].downcase == "pickup"
              if date[:date] == (Date.parse(dates[0].attributes[:value]) - 1) && rate[:cook_time] == "afternoon"
                date[rate[:cook_time].downcase.to_sym].push(order)
              elsif date[:date] == Date.parse(dates[0].attributes[:value]) && rate[:cook_time] == "morning"
                date[rate[:cook_time].downcase.to_sym].push(order)
              end
            end
          end

        end
      end

    return @fiveDayOrders
  end
end
