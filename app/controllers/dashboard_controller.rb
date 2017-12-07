class DashboardController < ShopifyApp::AuthenticatedController
  before_action :check_date, only: [:showOrders, :generateCSV]

  def index
    shop = ShopifyAPI::Shop.current()
    shop = Shop.find_by(shopify_domain: shop.attributes[:myshopify_domain])

    # filterErrors returns {:error_orders, :orders}
    order_fields = "created_at, tags, id, line_items, name, note_attributes, total_price, financial_status, fulfillment_status, cancelled_at, closed_at, refunds, fulfillments"
    orders = filterErrors(ShopifyAPI::Order.find(:all, params: { fields: order_fields, status: "any", limit: 250, created_at_min: (Time.now - 35.day).iso8601 }))

    fiveDayOrdersWithErrors = self.formatOrders(shop[:shopify_domain], true, orders)
    Rails.logger.debug("5day error size: #{fiveDayOrdersWithErrors[:errorOrders].size}")

    @fiveDayOrders = fiveDayOrdersWithErrors[:fiveDayOrders]

    # subscription errors
    subs_with_errors = shop.getRechargeData("https://api.rechargeapps.com/charges/count/?status=ERROR")['count']
    @errorOrdersCount = orders[:error_orders].count + subs_with_errors

    @fiveDayOrders.each do |date|
      date[:delivery_revenue] = 0
      date[:pickup_revenue] = 0
      if date[:delivery].size > 0
        date[:delivery_revenue] = date[:delivery].inject(0){|sum, order| sum + order.attributes[:total_price].to_f}
      end
      if date[:pickup].size > 0
        date[:pickup_revenue] = date[:pickup].inject(0){|sum, order| sum + order.attributes[:total_price].to_f}
      end
    end

    # Subscriber Count (Active Subscriptions with unique customer)
    @activeSubscriberCount = shop
      .getRechargeData("https://api.rechargeapps.com/subscriptions/?status=ACTIVE&limit=250")['subscriptions']
      .uniq {|sub| sub["customer_id"]}.size

    # Shipping Orders:
    shippingOrders = getShippingOrders(orders[:orders])

    @shippingOrdersCount = shippingOrders.count

    @shippingOrdersRevenue = shippingOrders.inject(0){|sum, order| sum + order.attributes[:total_price].to_f}

    # Customer Count:
    @customerCount = ShopifyAPI::Customer.count

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
          # Rails.logger.debug("item csv: #{sched[:title].inspect} #{sched[:cook_time].inspect}")
        elsif params[:time].to_i == sched[:cook_time].to_i && params[:attribute] == 'addresses'
          orders = sched[:addresses]
          cook_title = sched[:title]
          # Rails.logger.debug("add csv: #{sched[:title].inspect} #{sched[:cook_time].inspect}")
        else
          # Rails.logger.debug("err csv: #{sched[:cook_time].inspect}")
        end
      end

      # Rails.logger.debug("orders: #{orders.size.inspect}")
      shop = ShopifyAPI::Shop.current()

      respond_to do |format|
        format.html
        format.csv {
          send_data params[:attribute] == "items" ? CSVGenerator.generateItemCSV(orders) : CSVGenerator.generateAddressesCSV(orders, shop, cook_title),
          filename: "#{Date.parse(params[:date])}_#{cook_title.split(' ').first}-#{params[:attribute]}.csv"
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
    shop = Shop.find_by(shopify_domain: params[:shop])
    @attribute = params[:attribute].capitalize
    @date = params[:date]

    if params[:attribute].downcase == 'pickup' || params[:attribute].downcase == 'delivery'
      dates = self.formatOrders(params[:shop])
      selectedDate = dates.select do |order|
        order[:date] == Date.parse(params[:date])
      end.first
      @orders = selectedDate[params[:attribute].to_sym]
    elsif params[:attribute].downcase == 'shipping'
      @orders = self.getShippingOrders
    elsif params[:attribute].downcase == 'errors'
      # Missing Delivery Data
      order_fields = "created_at, tags, id, line_items, name, note_attributes, total_price, financial_status, fulfillment_status, order_number, customer, note, cancelled_at, closed_at, refunds, fulfillments"
      orders = filterErrors(ShopifyAPI::Order.find(:all, params: { fields: order_fields, status: "any", limit: 250 }))
      @orders = orders[:error_orders]


      # Out of Stock Subs
      subs_with_errors = shop.getRechargeData("https://api.rechargeapps.com/charges/?status=ERROR&limit=250")['charges']
      out_variants = shop.getOutOfStockProduct
      Rails.logger.debug("out_variants: #{out_variants.inspect}")

      subs_with_errors.map do |sub|
        sub_out_variants = sub['line_items'].select do |item|
          out_variants.include?(item['shopify_variant_id'].to_i)
        end
        if sub['error_type'] == "SHOPIFY_REJECTED" && sub_out_variants != []
          sub['stripe_shipping_id'] = sub['error'].split(' ERROR id: ').last
          sub['error'] = [sub['error']].unshift("OUT OF STOCK - This subscription could not create an order because #{sub_out_variants.map{|s| s['title']}.join(', ')} was out of stock")
          sub['out_of_stock_variants'] = sub_out_variants.map{|s| s['shopify_variant_id']}
        elsif sub['error_type'] == "CUSTOMER_NEEDS_TO_UPDATE_CARD"
          sub['error'] = [sub['error']].unshift("FAILED PAYMENT - the subscription could not create an order because the payment method failed. #{sub['first_name']} #{sub['last_name']} needs to update card")
        elsif sub['error_type'] == "SHOPIFY_REJECTED" && sub['error'].include?("list index out of range")
          sub['error'] = [sub['error']].unshift("PRODUCT DOES NOT EXIST - Product may have been deleted. Make sure to sync product in Recharge if changes are made.")
        else
          sub['error'] = [sub['error']]
        end
      end

      @orders.concat(subs_with_errors)
    end
  end

  def orderAttributesToHash(_attr)
    obj = {}
    _attr.each do |a|
      obj[a.attributes[:name].parameterize.underscore.to_sym] = a.attributes[:value]
    end
    return obj
  end

  def formatOrders(shop_domain = params[:shop], showErrors = false, filteredOrders = false)
    # Shopify requires time to be iso8601 format
    # Order Information 7 day range ( limit for which orders )
    # TODO: make sure this range is right,
    shop = Shop.find_by(shopify_domain: shop_domain)

    if filteredOrders.blank?
      order_fields = "created_at, tags, id, line_items, name, note_attributes, total_price, financial_status, fulfillment_status, order_number, customer, note, shipping_address, cancelled_at, closed_at, refunds, fulfillments"
      orders = filterErrors(ShopifyAPI::Order.find(:all, params: { fields: order_fields, status: "any", created_at_min: (Time.now - 6.day).iso8601, limit: 250 }))
    else
      orders = filteredOrders
    end
    errorOrders = orders[:error_orders]

    # Sort by cook time
    schedules = shop.cook_schedules.all.sort_by { |sched| sched[:cook_time] }
    # blackout dates
    blackout_dates = shop.blackout_dates.pluck(:blackout_date)
    # TODO: Figure this out We'll use last cook_schedule cook_time as end of day
    # end_of_day = DateTime.now.change({ hour: schedules.last.cook_time })

    rates = shop.rates.select("id,delivery_type,delivery_method")

    date_from  = Date.current
    date_to    = date_from + 4
    date_range = (date_from..date_to).map()
    @fiveDayOrders = date_range.map do |date|
      blackout = blackout_dates.any? {|d| d.to_date == date}
      obj = {
              date: date,
              cook_schedules: schedules.map {|sched| {orders: [], addresses: [], title: sched[:title], cook_time: sched[:cook_time]}},
              blackout: blackout,
              pickup: [],
              shipping: [],
              delivery: []
            }
    end


      orders[:orders].each do |order|
        # TODO: error handling for orders that do NOT have note attributes.
        # Rails.logger.debug("notes order: #{order.attributes[:note_attributes].inspect}")
        orderAttributes = orderAttributesToHash(order.attributes[:note_attributes])

        # Format order created_at
        # Rails.logger.debug("order created_at: #{orderAttributes.inspect}")
        order_created_at = DateTime.parse(order.attributes[:created_at])

        # Rails.logger.debug("order: #{order.attributes[:name].inspect}")
        # Isolate Delivery Date
        note_date = orderAttributes[:delivery_date]
        # Isolate Checkout method
        checkout_method = orderAttributes[:checkout_method]
        # Isolate Delivery Rate
        rate_id = orderAttributes[:delivery_rate]
        rate = nil
        if rate_id.present?
          if is_number?(rate_id)
            rate = rates.select{|r| r.id == rate_id.to_i}.first
          else
            rate = rates.select{|r| r.id == rate_id.split(']')[0].split('[')[1].to_i}.first
          end
        end

        if note_date != nil && note_date != ''
          note_date = Date.parse(note_date)

          # match dates
          dateIndex = @fiveDayOrders.index { |date| date[:date] == note_date }
          if dateIndex
            # Counts
            @fiveDayOrders[dateIndex][rate[:delivery_method].downcase.to_sym].push(order)

            # Ignore shipping rates
            if rate[:delivery_method].downcase == "delivery" || rate[:delivery_method].downcase == "pickup"
              cook_date = nil

              # Subscription?
              sub_order = order.attributes[:tags].split(', ').include?("Subscription")
              # Subscription First Order?
              sub_first_order = order.attributes[:tags].split(', ').include?("Subscription First Order")
              # Rails.logger.debug("first sub?: #{sub_first_order.inspect}")

              # last cook of day?
              deliver_next_day = false

              # Find cook_day and cook_schedule that rate belongs to
              day_before_blackout = blackout_dates.any? {|date| (note_date - 1.day) == date.to_date}
              # Rails.logger.debug("day_before_blackout: #{day_before_blackout}")
              last_cook_not_available_day_before = schedules.last.cook_days.any? {|day| day.title.downcase == (note_date - 1.day).strftime("%A").downcase && day.rates.empty?}
              Rails.logger.debug("last_cook_not_available_day_before: #{last_cook_not_available_day_before}")

              # Rails.logger.debug("note day: #{note_date.strftime("%A").downcase.inspect}")
              cook_days = rate.cook_day.pluck(:cook_schedule_id, :title).select do |day|
                if day[0] != schedules.last.id && day[1].downcase == note_date.strftime("%A").downcase && (note_date == order_created_at.to_date || (note_date == (order_created_at.to_date + 1.day) && order_created_at.hour >= 23))
                  # same day as delivery, must cook this day
                  # Rails.logger.debug("cook day: #{day[1].downcase.inspect}, id: #{day[0].inspect}")
                  cook_date = (note_date)
                  deliver_next_day = false
                  # Rails.logger.debug("#sub  cook same day as delivery date")
                  true
                elsif day[0] == schedules.last.id && day[1].downcase == (note_date - 1.day).strftime("%A").downcase && !day_before_blackout && note_date != order_created_at.to_date && !(note_date == (order_created_at.to_date + 1.day) && order_created_at.hour >= 23)
                  cook_date = (note_date - 1.day)
                  deliver_next_day = true
                  # Rails.logger.debug("# cook day before delivery date")
                  true # cook day before delivery date
                elsif day[0] != schedules.last.id && day[1].downcase == note_date.strftime("%A").downcase
                  cook_date = (note_date)
                  if !sub_order
                    # Rails.logger.debug("cook day: #{day[1].downcase.inspect}, id: #{day[0].inspect}")
                    deliver_next_day = false
                    # Rails.logger.debug("# cook same day as delivery date")
                    true # cook on delivery date
                  elsif (sub_order && last_cook_not_available_day_before) || (sub_order && day_before_blackout)
                    # Rails.logger.debug("cook day: #{day[1].downcase.inspect}, id: #{day[0].inspect}")
                    deliver_next_day = false
                    # Rails.logger.debug("# cook same day as delivery date")
                    true # cook on delivery date
                  else
                    # Rails.logger.debug("err not a cook day: #{day.inspect}")
                    false
                  end
                else
                  cook_date = (note_date)
                  # Rails.logger.debug("err not a cook day: #{day.inspect}")
                  false
                end
              end

              Rails.logger.debug("deliver_next_day: #{deliver_next_day.inspect}")
              Rails.logger.debug("rate: #{rate.inspect}")
              Rails.logger.debug("cook_days: #{cook_days.inspect}")
              Rails.logger.debug("cook_date: #{cook_date.inspect} - #{cook_date.strftime("%A").downcase.inspect}")
              Rails.logger.debug("delivery date: #{note_date.inspect} - #{note_date.strftime("%A").downcase.inspect}")
              Rails.logger.debug("order name: #{order.name.inspect}")
              Rails.logger.debug("order method: #{checkout_method.inspect}")

              if cook_days.size > 1
                # rate appears in multiple cook days ie. multiple cook times
                # TODO: this should not happen, need figure out how to prevent this.
                Rails.logger.debug("err - cook_days.size > 1: #{cook_days.inspect}")
              elsif cook_days.size == 0
                Rails.logger.debug("no cook days #{cook_days.inspect}")
              else
                if deliver_next_day
                  # DELIVERED NEXT DAY AFTER COOK

                  Rails.logger.debug("delivery next day")
                  # prevent index from cycling to last item in array
                  dateIndex > 0 ? @fiveDayOrders[dateIndex - 1][:cook_schedules].select do |sched|
                    sched[:title] == schedules.select{|cook_sched| cook_sched.id == cook_days.first.first}.first.title
                  end.first[:orders].push(order) : nil

                  # Last cooks go into the first delivery addresses of next day.
                  # filter out Pickups
                  if checkout_method != "pickup"
                    @fiveDayOrders[dateIndex][:cook_schedules].first[:addresses].push(order)
                  end
                else
                  # DELIVERED SAME DAY AS COOK

                  Rails.logger.debug("delivery same day")
                  sched = @fiveDayOrders[dateIndex][:cook_schedules].select do |sched|
                    sched[:title] == schedules.select{|cook_sched| cook_sched.id == cook_days.first.first}.first.title
                  end

                  if sub_order
                    @fiveDayOrders[dateIndex][:cook_schedules].first[:orders].push(order)
                    # cooks that go out same day go into the next schedule's addresses.
                    Rails.logger.debug("sub_first_order same day index: #{@fiveDayOrders[dateIndex][:cook_schedules].index(sched.first) + 1}")
                    # Rails.logger.debug("sub_first_order same day cs: #{@fiveDayOrders[dateIndex][:cook_schedules][@fiveDayOrders[dateIndex][:cook_schedules].index(sched.first) + 1].inspect}")
                    # filter out Pickups
                    if checkout_method != "pickup"
                      @fiveDayOrders[dateIndex][:cook_schedules][@fiveDayOrders[dateIndex][:cook_schedules].index(sched.first) + 1][:addresses].push(order)
                    end
                  else
                    sched.first[:orders].push(order)
                    # cooks that go out same day go into the next schedule's addresses.
                    Rails.logger.debug("reg same day index: #{@fiveDayOrders[dateIndex][:cook_schedules].index(sched.first) + 1}")
                    # Rails.logger.debug("reg same day next cs: #{@fiveDayOrders[dateIndex][:cook_schedules][@fiveDayOrders[dateIndex][:cook_schedules].index(sched.first) + 1].inspect}")
                    # filter out Pickups
                    if checkout_method != "pickup"
                      @fiveDayOrders[dateIndex][:cook_schedules][@fiveDayOrders[dateIndex][:cook_schedules].index(sched.first) + 1][:addresses].push(order)
                    end
                  end

                end
              end
            end
          else
            # Order not in the Date Range
          end

        end
      end

    if showErrors == true
      return {:fiveDayOrders => @fiveDayOrders, :errorOrders => errorOrders}
    else
      return @fiveDayOrders
    end
  end

  def getShippingOrders(orders = false)
    order_fields = "created_at, tags, id, line_items, name, note_attributes, total_price, financial_status, fulfillment_status, order_number, customer, note, cancelled_at, closed_at, refunds, fulfillments"
    shipping_orders = orders == false ? filterErrors(ShopifyAPI::Order.find(:all, params: { fields: order_fields, status: "open", limit: 250 }))[:orders] : orders
    shippingOrders = []
    shipping_orders.select do |order|
      unless order.attributes[:fulfillment_status] == 'fulfilled' || order.attributes[:fulfillment_status] == 'shipped'
        order.attributes[:note_attributes].each do |note|
          if note.attributes[:name] == "Checkout Method"
            if note.attributes[:value].downcase == "shipping"
               shippingOrders.push(order)
            end
          end
        end
      end
    end

    return shippingOrders
  end

  def setError(order, error_string)
    Rails.logger.debug("set error: order_#{order.attributes[:name].inspect}, error#{error_string} ")
    order.attributes[:error] = []

    case error_string
    when "notes_blank"
      order.attributes[:error].push("MISSING DELIVERY DATA - Please make sure the order has a delivery method, date, rate, etc.")
      order.attributes[:error_type] = "MISSING_DELIVERY_DATA"
    when "rate_blank"
      order.attributes[:error].push("MISSING RATE DATA - Please make sure the order has a delivery method, date, rate, etc.")
    when "method_blank"
      order.attributes[:error].push("MISSING METHOD DATA - Please make sure the order has a delivery method, date, rate, etc.")
    when "product_does_not_exist"
      order.attributes[:error].push("PRODUCT DOES NOT EXIST - Product may have been deleted. Make sure to sync product in Recharge if changes are made.")
    when "delivery_in_past"
      order.attributes[:error].push("DELIVERY DATE IS SET IN THE PAST - Date may not have been updated from Recurring Subscription. Please update.")
    when "note_date_blank"
      order.attributes[:error].push("MISSING DELIVERY DATE - Please make sure the order has a delivery method, date, rate, etc.")
    when "cook_day_error"
      order.attributes[:error].push("NO AVAILABLE COOKS - Delivery date is probably set to a day where there are no cooks. Please Change the rate and/or delivery date.")
    else
      order.attributes[:error].push("UNKNOWN ERROR - Please contact support.")
    end

    order
  end

  def is_number? string
    true if Float(string) rescue false
  end

  def filterErrors(orders_to_be_filtered)
    error_orders = []
    reg_orders = []
    rates = shop.rates.all
    orders_to_be_filtered.each do |order|
      # remove cancelled/refunded/unshippable orders.
      next if order.attributes[:cancelled_at] != nil
      next if order.attributes[:financial_status] == 'refunded'
      next if order.attributes[:line_items].all? {|item| item.attributes[:requires_shipping] == false}

      # order line item presence
      product_does_not_exist = order.attributes[:line_items].select{|item| !item.attributes[:product_exists]}

      orderAttributes = orderAttributesToHash(order.attributes[:note_attributes])
      # Isolate Delivery Date
      note_date = orderAttributes[:delivery_date]
      # Isolate Checkout method
      checkout_method = orderAttributes[:checkout_method]
      # Isolate Delivery Rate
      rate_id = orderAttributes[:delivery_rate]
      rate = nil
      if rate_id.present?
        if is_number?(rate_id)
          rate = rates.select{|r| r.id == rate_id.to_i}.first
        else
          rate = rates.select{|r| r.id == rate_id.split(']')[0].split('[')[1].to_i}.first
        end
      end

      # cook_days
      cook_days = rate.present? && note_date.present? ? rate.cook_day.select{|day| day.title.downcase == Date.parse(note_date).strftime("%A").downcase} : nil

      # Error catch
      if order.attributes[:note_attributes].size == 0
        self.setError(order, "notes_blank")
      elsif rate_id.blank?
        self.setError(order, "rate_blank")
      elsif checkout_method.blank?
        self.setError(order, "method_blank")
      elsif product_does_not_exist.present?
        self.setError(order, "product_does_not_exist")
      elsif note_date.present? && checkout_method != 'shipping'
          new_date = note_date
          unless new_date.class == Date
            new_date = Date.parse(note_date)
          end
          if new_date < Date.parse(order.attributes[:created_at])
            self.setError(order, "delivery_in_past")
          end
      elsif checkout_method != "shipping" && note_date.blank?
        self.setError(order, "note_date_blank")
      else
        # TODO: this needs attention
        cook_day_error = cook_days.blank? && rate[:delivery_type] == "same_day" ? true : false
        if cook_day_error
          self.setError(order, "cook_day_error")
        end
      end

      order.attributes[:error].blank? ? reg_orders.push(order) : error_orders.push(order)
    end

    return { :error_orders => error_orders, :orders => reg_orders}
  end

  def bulk_fulfill
    order_fields = "id,line_items"
    orders = ShopifyAPI::Order.find(:all, :params=>{:fields => order_fields, :ids => params[:ids]})
    Rails.logger.debug("orders: #{orders.inspect}")
    Rails.logger.debug("orders size: #{orders.size}")
    fulfillments = orders.map do |order|
      ShopifyAPI::Fulfillment.new(:order_id => order.id, :notify_customer => false, :line_items => order.line_items.map{|item| {"id" => item.id}} )
    end
    Rails.logger.debug("orders: #{fulfillments.inspect}")

    fulfillments.each do |f|
      if f.save
        Rails.logger.info("success: #{f.inspect}")
      else
        Rails.logger.error("error: #{f.inspect}")
      end
    end

    redirect_back fallback_location: { action: "index" }
  end

  private

  def check_date
    if Date.parse(params[:date]) < Date.today
      redirect_to action: "index"
    end
  end

  def delete_orders
    # shop = ShopifyAPI::Shop.current()
    # shop = Shop.find_by(shopify_domain: shop.attributes[:domain])
    # ShopifyAPI::Base.activate_session(ShopifyApp::SessionRepository.retrieve(1))
    # orders = ShopifyAPI::Order.find(:all, params: { status: "any", limit: 75, fields: "id" })
    # orderIds = orders.map{|order| order.attributes[:id]}

    # orders.each do |order|
    #   order.destroy
    # end
  end

  def update_webhooks(new_URI_host)
    # Start Session
    # ShopifyAPI::Base.activate_session(ShopifyApp::SessionRepository.retrieve(1))

    # webhooks = ShopifyAPI::Webhook.find(:all)
    # webhooks.each {|hook| hook.address.sub!(URI.parse(hook.address).host, new_URI_host) }
  end
end
