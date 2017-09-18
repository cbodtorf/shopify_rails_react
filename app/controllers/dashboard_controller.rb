class DashboardController < ShopifyApp::AuthenticatedController
  def index
    shop = ShopifyAPI::Shop.current()
    @fiveDayOrders = self.formatOrders(shop.attributes[:domain])


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
      dates = self.formatOrders(params[:shop])
      selectedDate = dates.select do |order|
        order[:date] == Date.parse(params[:date])
      end.first

      orders = []
      cook_title = ''

      # Morning Cooks consist of morning deliveries and pickup orders. Addresses don't need pickup orders
      selectedDate[:cook_schedules].each do |sched|
        if params[:time].to_i == sched[:cook_time].to_i && params[:attribute] == 'items'
          orders = sched[:orders]
          cook_title = sched[:title]
          Rails.logger.debug("item csv: #{sched[:title].inspect} #{sched[:cook_time].inspect}")
        elsif params[:time].to_i == sched[:cook_time].to_i && params[:attribute] == 'addresses'
          orders = sched[:addresses]
          cook_title = sched[:title]
          Rails.logger.debug("add csv: #{sched[:title].inspect} #{sched[:cook_time].inspect}")
        else
          Rails.logger.debug("err csv: #{sched[:cook_time].inspect}")
        end
      end

      Rails.logger.debug("orders: #{orders.size.inspect}")
      shop = ShopifyAPI::Shop.current()
      respond_to do |format|
        format.html
        format.csv {
          send_data params[:attribute] == "items" ? CSVGenerator.generateItemCSV(orders) : CSVGenerator.generateAddressesCSV(orders, shop),
          filename: "#{Date.parse(params[:date])}_#{cook_title}-#{params[:attribute]}.csv"
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
      dates = self.formatOrders(params[:shop])
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

  def formatOrders(shop_domain = params[:shop])
    # Shopify requires time to be iso8601 format
    # Order Information 7 day range ( limit for which orders )
    # TODO: make sure this range is right,
    shop = Shop.find_by(shopify_domain: shop_domain)
    t = Time.now
    t8601 = t.iso8601
    sixDaysAgo = (t - 6.day).iso8601
    @orders = ShopifyAPI::Order.find(:all, params: { created_at_min: sixDaysAgo })
    # Sort by cook time
    schedules = shop.cook_schedules.all.sort_by { |sched| sched[:cook_time] }

    date_from  = Date.current
    date_to    = date_from + 4
    date_range = (date_from..date_to).map()
    @fiveDayOrders = date_range.map do |date|
      obj = {
              date: date,
              cook_schedules: schedules.map {|sched| {orders: [], addresses: [], title: sched[:title], cook_time: sched[:cook_time]}},
              morning_items: [],
              afternoon_items: [],
              morning_addresses: [],
              afternoon_addresses: [],
              pickup: [],
              shipping: [],
              delivery: []
            }
    end


      @orders.each do |order|
        # TODO: error handling for orders that do NOT have note attributes.
        # Rails.logger.debug("notes order: #{order.attributes[:note_attributes].inspect}")
        # Isolate Delivery Date
        note_date = order.attributes[:note_attributes].select do |note|
          note.attributes[:name] === "delivery_date"
        end

        # Isolate Delivery Rate
        rates = order.attributes[:note_attributes].select {|note| note.attributes[:name] === "rate_id"}
        rate = shop.rates.find(rates[0].attributes[:value])

        if note_date[0] != nil
          note_date = Date.parse(note_date[0].attributes[:value])

          # match dates
          dateIndex = @fiveDayOrders.index { |date| date[:date] == note_date }
          if dateIndex
            # Counts
            @fiveDayOrders[dateIndex][rate[:delivery_method].downcase.to_sym].push(order)

            # Ignore shipping rates
            if rate[:delivery_method].downcase == "delivery" || rate[:delivery_method].downcase == "pickup"
              cook_date = nil

              # last cook of day?
              deliver_next_day = false

              # Find cook_day and cook_schedule that rate belongs to
              cook_days = rate.cook_day.select do |day|
                Rails.logger.debug("day: #{day.title.downcase.inspect}")
                Rails.logger.debug("day: #{note_date.strftime("%A").downcase.inspect}")
                Rails.logger.debug("id: #{day.cook_schedule_id.inspect}")
                if day.title.downcase == note_date.strftime("%A").downcase && day.cook_schedule_id != schedules.last.id
                  cook_date = (note_date)
                  deliver_next_day = false
                  true # cook on delivery date
                elsif day.title.downcase == note_date.strftime("%A").downcase && day.cook_schedule_id == schedules.last.id
                  cook_date = (note_date - 1.day)
                  deliver_next_day = true
                  true # cook day before delivery date
                else
                  cook_date = (note_date)
                  Rails.logger.debug("err: #{day.inspect}")
                  false
                end
              end

              Rails.logger.debug("rate: #{rate.inspect}")
              Rails.logger.debug("rate cook_days: #{rate.cook_day.inspect}")
              Rails.logger.debug("cook_days: #{cook_days.inspect}")
              Rails.logger.debug("cook_date: #{cook_date.inspect} - #{cook_date.strftime("%A").downcase.inspect}")
              Rails.logger.debug("delivery date: #{note_date.inspect} - #{note_date.strftime("%A").downcase.inspect}")
              Rails.logger.debug("order name: #{order.name.inspect}")

              if cook_days.size > 1
                # rate appears in multiple cook days ie. multiple cook times
                # TODO: this should not happen, need figure out how to prevent this.
              else
                if deliver_next_day
                  # DELIVERED NEXT DAY AFTER COOK
                  # prevent index from cycling to last item in array
                  dateIndex > 0 ? @fiveDayOrders[dateIndex - 1][:cook_schedules].select do |sched|
                    sched[:title] == cook_days.first.cook_schedule.title
                  end.first[:orders].push(order) : nil

                  # Last cooks go into the first delivery addresses of next day.
                  @fiveDayOrders[dateIndex][:cook_schedules].first[:addresses].push(order)
                else
                  # DELIVERED SAME DAY AS COOK
                  sched = @fiveDayOrders[dateIndex][:cook_schedules].select do |sched|
                    sched[:title] == cook_days.first.cook_schedule.title
                  end
                  sched.first[:orders].push(order)

                  # cooks that go out same day go into the next schedule's addresses.
                  Rails.logger.debug("index: #{@fiveDayOrders[dateIndex][:cook_schedules].index(sched.first) + 1}")
                  Rails.logger.debug("index: #{@fiveDayOrders[dateIndex][:cook_schedules][@fiveDayOrders[dateIndex][:cook_schedules].index(sched.first) + 1].inspect}")
                  @fiveDayOrders[dateIndex][:cook_schedules][@fiveDayOrders[dateIndex][:cook_schedules].index(sched.first) + 1][:addresses].push(order)
                end
              end
            end
          else
            # Order not in the Date Range
          end

        end
      end

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

    return shippingOrders
  end
end
