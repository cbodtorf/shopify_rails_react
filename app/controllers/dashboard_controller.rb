class DashboardController < ShopifyApp::AuthenticatedController
  def index
    # Retrieves Upcoming Active Subscriptions and attaches customer data to the hash.
    @rechargeSubscriptions = self.getRechargeData("https://api.rechargeapps.com/subscriptions?status=ACTIVE&limit=250")["subscriptions"].each do |sub|
      sub["customer"] = self.getRechargeData("https://api.rechargeapps.com/customers/#{sub["customer_id"]}")["customer"]
    end

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

    date_from  = Date.current
    date_to    = date_from + 4
    date_range = (date_from..date_to).map()
    @fiveDayOrders = date_range.map {|date| {date: date, morning: [], afternoon: [], pickup: []}}

    @orders.each do |order|
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
          if rate[:delivery_type].downcase == "subscription"
            if order.attributes[:tags].include?("Subscription First Order")
              # if same day cook morning or
              # else cook afternoon before
            elsif order.attributes[:tags].include?("Subscription Recurring Order")
              # cook afternoon before
            else
              # hopefully nothing
            end
          elsif rate[:delivery_method].downcase == "pickup"
            # TODO: find out where pickup subscriptions are cooked
            # standard pickups are cooked the morning of
            # but all subscriptions typically cooked afternoon before
          elsif rate[:delivery_method].downcase == "shipping"
            # These do not go into the standard csv
          elsif rate[:delivery_method].downcase == "delivery"
            # if same day cook morning of
            # if next day cook afternoon before
          else
            # hopefully nothing
          end
          # need to refactor this logic

          # if date[:date] == (Date.parse(dates[0].attributes[:value]) - 1) && rate[:cook_time] == "afternoon" && rate[:delivery_type].downcase == "subscription"
          #   if rate[:delivery_type].downcase === "subscription" && order.attributes[:tags].include?("Subscription First Order")
          #     # if same day must be done morning of order. SKIP
          #   elsif rate[:delivery_type].downcase === "subscription" && order.attributes[:tags].include?("Subscription Recurring Order")
          #     date[rate[:cook_time].downcase.to_sym].push(order)
          #   end
          # elsif date[:date] == (Date.parse(dates[0].attributes[:value]) - 1) && rate[:cook_time] == "afternoon" && rate[:delivery_type].downcase != "subscription"
          #   # afternoon cook happens day before delivery
          #   # return deliveries pm
          #   date[rate[:cook_time].downcase.to_sym].push(order)
          # elsif date[:date] == Date.parse(dates[0].attributes[:value]) && rate[:cook_time] == "afternoon" && rate[:delivery_type].downcase == "subscription"
          #   if rate[:delivery_method].downcase == "pickup"
          #     # return pickup orders
          #     date[rate[:delivery_method].downcase.to_sym].push(order)
          #   elsif rate[:delivery_type].downcase == "subscription" && order.attributes[:tags].include?("Subscription First Order")
          #     # if same day must be done morning of order.
          #     date[:morning].push(order)
          #   elsif rate[:delivery_type].downcase == "subscription" && order.attributes[:tags].include?("Subscription Recurring Order")
          #     # if same day must be done morning of order. SKIP
          #   end
          # elsif date[:date] == Date.parse(dates[0].attributes[:value]) && rate[:cook_time] == "morning"
          #   if rate[:delivery_method].downcase == "pickup"
          #     # return pickup orders
          #     date[rate[:delivery_method].downcase.to_sym].push(order)
          #   elsif rate[:delivery_type].downcase == "subscription"
          #     # return first time subscription orders
          #     date[:morning].push(order)
          #   else
          #     # return deliveries am
          #     date[rate[:cook_time].downcase.to_sym].push(order)
          #   end
          # end
        end

      end
    end

    return @fiveDayOrders
  end

  def getRechargeData(endpoint)
    # Access Recharge API
    api_token = '9ddfc399771643169db06e1b162a5b73'

    response = HTTParty.get(endpoint,
                             :headers => { "Content-Type" => 'application/json', "X-Recharge-Access-Token" => api_token})
   case response.code
      when 200
        puts "All good!"
      when 404
        puts "O noes not found!"
      when 500...600
        puts "ZOMG ERROR #{response.code}"
    end

    response.parsed_response
  end
end
