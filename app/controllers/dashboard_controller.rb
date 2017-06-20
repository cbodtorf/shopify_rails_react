class DashboardController < ShopifyApp::AuthenticatedController
  def index
    # Shopify requires time to be iso8601 format
    # Order Information 7 day range ( limit for which orders )
    # TODO: make sure this range is right,
    t = Time.now
    t8601 = t.iso8601
    sixDaysAgo = (t - 6.day).iso8601
    Rails.logger.debug("Time: #{t8601.inspect}")
    Rails.logger.debug("Time - 1: #{sixDaysAgo.inspect}")
    @orders = ShopifyAPI::Order.find(:all, params: { created_at_min: sixDaysAgo })

    date_from  = Date.current
    date_to    = date_from + 4
    date_range = (date_from..date_to).map()
    @fiveDayOrders = date_range.map {|date| {date: date, morning: [], afternoon: [], pickup: []}}

    @orders.each do |order|
      # Isolate Delivery Date
      dates = order.attributes[:note_attributes].select do |note|
        note.attributes[:name] === "delivery_date"
      end
      # Isolate Delivery Rate
      rates = order.attributes[:note_attributes].select do |note|
        note.attributes[:name] === "rate_id"
      end
      if dates[0] != nil
        @fiveDayOrders.map do |date|
          if (date[:date] == Date.parse(dates[0].attributes[:value]))
            Rails.logger.debug("rate time: #{order.inspect}")
            date[Rate.find(rates[0].attributes[:value])[:delivery_time].downcase.to_sym].push(order)
          end
        end
        # @fiveDayOrders.push(dateObj)
        # Rails.logger.debug("notes rate: #{Rate.find(rates[0].attributes[:value]).inspect}")
        # Rails.logger.debug("notes time: #{Time.parse(dates[0].attributes[:value]).inspect}")
      end
    end
    Rails.logger.debug("order date time: #{@fiveDayOrders.inspect}")


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
end
