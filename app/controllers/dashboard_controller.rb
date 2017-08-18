class DashboardController < ShopifyApp::AuthenticatedController
  def index

    @fiveDayOrders = self.formatOrders

    @fiveDayOrders.map do |date|
      date[:delivery_revenue] = 0
      date[:pickup_revenue] = 0
      if date[:delivery].size > 0
        date[:delivery].each do |order|
          date[:delivery_revenue] += order.attributes[:total_price].to_f
        end
      end
      if date[:pickup].size > 0
        date[:pickup].each do |order|
          date[:pickup_revenue] += order.attributes[:total_price].to_f
        end
      end
    end
    # Rails.logger.debug("order date time: #{@fiveDayOrders.inspect}")

    # Subscriber Count (tagged with Active Subscriber)
    # http://support.rechargepayments.com/article/191-shopify-order-tags
    customers = ShopifyAPI::Customer.find(:all)
    # TODO: It is not counting customers made in the recharge admin section.
    # maybe look for repeat customers.
    activeSubscribers = customers.select do |c|
      c.attributes[:tags].split(', ').include?('Active Subscriber')
    end
    @activeSubscriberCount = activeSubscribers.count

    @shippingOrdersCount = getShippingOrders.count
    @shippingOrdersRevenue = 0
    getShippingOrders.each do |order|
      @shippingOrdersRevenue += order.attributes[:total_price].to_f
    end

    # Customer Count:
    @customerCount = ShopifyAPI::Customer.count

    # Bundle Information
    @bundles = ShopifyAPI::Product.find(:all, params: { product_type: 'bundle' })

    # Product Information
    @productCount = ShopifyAPI::Product.count
  end

  def generateCSV
    if params[:attribute].downcase != 'shipping'
      dates = self.formatOrders
      selectedDate = dates.select do |order|
        order[:date] == Date.parse(params[:date])
      end.first

      # Morning Cooks consist of morning deliveries and pickup orders. Addresses don't need pickup orders
      if params[:time] == 'morning' && params[:attribute] == 'items'
        @orders = selectedDate[:morning_items]
      elsif params[:time] == 'morning' && params[:attribute] == 'addresses'
        @orders = selectedDate[:morning_addresses]
      elsif params[:time] == 'afternoon' && params[:attribute] == 'items'
        @orders = selectedDate[:afternoon_items]
      elsif params[:time] == 'afternoon' && params[:attribute] == 'addresses'
        @orders = selectedDate[:afternoon_addresses]
      end
      # Rails.logger.debug("order check?: #{@orders.inspect}")

      respond_to do |format|
        format.html
        format.csv {
          send_data params[:attribute] == "items" ? CSVGenerator.generateItemCSV(@orders) : CSVGenerator.generateAddressesCSV(@orders),
          filename: "#{Date.parse(params[:date])}_#{params[:time]}-#{params[:attribute]}.csv"
        }
      end
    else
      # SHIPPING CSV
      shippingOrders = self.getShippingOrders

      respond_to do |format|
        format.html
        format.csv {
          send_data CSVGenerator.generateItemCSV(shippingOrders),
          filename: "#{Date.parse(params[:date])}-#{params[:attribute]}.csv"
        }
      end
    end
  end

  def showOrders
    if params[:attribute].downcase != 'shipping'
      dates = self.formatOrders
      selectedDate = dates.select do |order|
        order[:date] == Date.parse(params[:date])
      end.first

      @orders = selectedDate[params[:attribute].to_sym]
    else
      @orders = self.getShippingOrders
    end
    @date = params[:date]
    @attribute = params[:attribute].capitalize

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
    @fiveDayOrders = date_range.map {|date| {
      date: date,
      morning_items: [],
      morning_addresses: [],
      afternoon_items: [],
      afternoon_addresses: [],
      pickup: [],
      shipping: [],
      delivery: []
      }}
      @orders.each do |order|
        # TODO: error handling for orders that do NOT have note attributes.
        # Rails.logger.debug("notes order: #{order.attributes[:note_attributes].inspect}")
        # Isolate Delivery Date
        note_date = order.attributes[:note_attributes].select do |note|
          note.attributes[:name] === "delivery_date"
        end

        # Isolate Delivery Rate
        rates = order.attributes[:note_attributes].select {|note| note.attributes[:name] === "rate_id"}
        # Rails.logger.debug("notes rate: #{rates.inspect}")
        rate = Rate.find(rates[0].attributes[:value])
        # Rails.logger.debug("notes rate: #{order.attributes[:note_attributes].inspect}")
        if note_date[0] != nil
          note_date = Date.parse(note_date[0].attributes[:value])

          # mach dates
          dateIndex = @fiveDayOrders.index { |date| date[:date] == note_date }
          if dateIndex
            # Counts
            @fiveDayOrders[dateIndex][rate[:delivery_method].downcase.to_sym].push(order)

            # Organize CSV orders for delivery and pickup
            if rate[:delivery_method].downcase == "delivery" || rate[:delivery_method].downcase == "pickup"

              # Same Day [same_day] [morning]
              if rate[:cook_time].downcase == "morning" && rate[:delivery_type].downcase == "same_day"
                @fiveDayOrders[dateIndex][:morning_items].push(order)
                @fiveDayOrders[dateIndex][:afternoon_addresses].push(order)
              end
              # Free Local [next_day] [morning] && Pickup [next_day] [morning]
              if rate[:cook_time].downcase == "morning" && rate[:delivery_type].downcase == "next_day" && rate[:delivery_method].downcase == "delivery"
                @fiveDayOrders[dateIndex][:morning_items].push(order)
                @fiveDayOrders[dateIndex][:afternoon_addresses].push(order)
              end
              # Pickup [next_day] [morning] TODO: double check pickup is cooked in the morning of date.
              if rate[:cook_time].downcase == "morning" && rate[:delivery_type].downcase == "next_day" && rate[:delivery_method].downcase == "pickup"
                @fiveDayOrders[dateIndex][:morning_items].push(order)
                # no addresses needed.
              end
              # Super Fast [next_day] [afternoon]
              if rate[:cook_time].downcase == "afternoon" && rate[:delivery_type].downcase == "next_day"
                # prevent index from cycling to last item in array
                dateIndex > 0 ? @fiveDayOrders[dateIndex - 1][:afternoon_items].push(order) : nil
                @fiveDayOrders[dateIndex][:morning_addresses].push(order)
              end
              # Subscription First [next_day] [afternoon]
              if rate[:cook_time].downcase == "afternoon" && rate[:delivery_type].downcase == "subscription"
                # prevent index from cycling to last item in array
                dateIndex > 0 ? @fiveDayOrders[dateIndex - 1][:afternoon_items].push(order) : nil
                @fiveDayOrders[dateIndex][:morning_addresses].push(order)
              end
              # Subscription Recurring [next_day] [afternoon]
              # Subscription First Same day [same_day] [afternoon]
              # Subscription Recurring Same day [same_day] [afternoon]
            end
          else
            # Order not in the Date Range
          end

        end
      end
      # Rails.logger.debug("date: #{@fiveDayOrders[0][:afternoon].inspect}")
    return @fiveDayOrders
  end

  def getShippingOrders
    orders = ShopifyAPI::Order.find(:all, params: { fulfillment_status: "unshipped", limit: 250 })
    shippingOrders = []
    orders.select do |order|
      order.attributes[:note_attributes].each do |note|
        if note.attributes[:name] == "checkout_method"
          if note.attributes[:value].downcase == "shipping"
             shippingOrders.push(order)
          end
        end
      end
    end
    # Rails.logger.debug("shipping orders check?: #{shippingOrders.inspect}")
    # Rails.logger.debug("shipping orders check?: #{shippingOrders.size}")

    return shippingOrders
  end
end
