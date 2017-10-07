class AppProxyController < ApplicationController
   include ShopifyApp::AppProxyVerification

  def index

    shop = Shop.find_by(shopify_domain: params[:shop])
    session = ShopifyApp::SessionRepository.retrieve(shop.id)
    ShopifyAPI::Base.activate_session(session)

    # iterate over order notes
    # Choose the one that was created most recently or double check checkout_token and delete if completed
    order_note = shop.order_notes.where(cart_token: params[:cart_token])
    order_note = order_note.select do |order|
      checkout = ShopifyAPI::Checkout.find(order[:checkout_token])
      Rails.logger.debug("[token?] #{order[:checkout_token].inspect}")
      Rails.logger.debug("[checkout? expired?] #{checkout.attributes[:completed_at].inspect}")
      if checkout.attributes[:completed_at] == nil
        Rails.logger.debug("[order note?] #{checkout.inspect}")
        order
      end
    end
    Rails.logger.debug("[order note?] #{order_note.inspect}")
    order_note = order_note.first
    # order_note = shop.order_notes.where(cart_token: params[:cart_token]).first

    if order_note
      Rails.logger.debug("[Order Note Exists] #{order_note.inspect}")
      @checkout = ShopifyAPI::Checkout.find(order_note[:checkout_token])
      Rails.logger.debug("[Checkout] #{@checkout.inspect}")

      if order_note.update_attributes(order_note_params) && @checkout.attributes[:shipping_address]
        if order_note.shipping_address
          Rails.logger.debug("[sa] #{order_note.shipping_address.inspect}")
          if @checkout.attributes[:shipping_address].attributes[:company] == nil
            @checkout.attributes[:shipping_address].attributes[:company] = "_"
          else
            order_note.shipping_address.update_attributes(company: @checkout.attributes[:shipping_address].attributes[:company] += " ")
          end
        else
          order_note.shipping_address = ShippingAddress.create(@checkout.attributes[:shipping_address])
        end
        breakCarrierCache()
        render json: order_note, status: 200
      else
        # render json: { errors: order_note.errors }, status: 422
        # TODO: might need to handle some errors, but right now this is when a shipping address is not entered on checkout initially.
        render json: order_note, status: 200
      end
    else
      Rails.logger.debug("[Order Note does not exist] #{order_note.inspect}")
      # this shouldn't run, order note should already be created
      # Shouldn't need to breakCarrierCache either.

      # checkouts = ShopifyAPI::Checkout.all
      # Rails.logger.debug("[Checkouts] #{checkouts.inspect}")
      # @checkout = checkouts.select do |checkout|
      #   checkout.attributes[:cart_token] == params[:cart_token]
      # end.first
      # Rails.logger.debug("[Checkout no note] #{@checkout.inspect}")

      # @order_note = OrderNote.create(order_note_params)
      # @order_note.shipping_address = ShippingAddress.create(@checkout.attributes[:shipping_address].attributes)

      # if @order_note.save
      #   # breakCarrierCache()
      #   render json: @order_note, status: 200
      # else
      #   # This just for reference if I wanted to render a page
      #   # render layout: false, content_type: 'application/liquid'
      #   render json: { errors: @order_note.errors }, status: 422
      # end
      render json: order_note, status: 200
    end



    Rails.logger.debug("[Checkout edit] #{@checkout.inspect}")
  end

  def order_note_params
    params.permit(
      :checkout_token,
      :cart_token,
      :rate_id,
      :checkout_method,
      :postal_code,
      :delivery_date
    )
  end

  def breakCarrierCache
    api_token = ENV['SHOPIFY_PRIVATE_API_KEY']
    checkout_token = @checkout.attributes[:token]
    endpoint = "https://bamboojuices.myshopify.com/admin/checkouts/#{checkout_token}.json"
    # TODO: need to encode Base64.encode64('username:password')
    # Should also look into whether or not I can use the App's credentials and not the private app.
    # ** note on editing company: Must use a character, just a space does not register as a change, probably trimming space at some point.
    # Need to decide if I should revert changes.
    token_string="Basic MDRkNmRmMjhmOTQwZmFkYTc2M2I2OTNiODljNzFkOWU6MTViZjdjNzZiMWQ3YmUyNmQwOTJmZjA4ZjA2MWVhNWQ="

    data = {
      "checkout": {
        "token": checkout_token,
        "shipping_address": {
          "id": @checkout.attributes[:shipping_address].attributes[:id],
          "company": @checkout.attributes[:shipping_address].attributes[:company] += "_",
        }
      }
    }

    response = HTTParty.put(endpoint,
                             :body => data.to_json,
                             :headers => { "Content-Type" => 'application/json', "Authorization" => token_string})
   case response.code
      when 200
        puts "All good!"
      when 404
        puts "O noes not found!"
      when 500...600
        puts "ZOMG ERROR #{response.code}"
    end
    Rails.logger.debug("[httparty] #{response.inspect}")
    puts response.body
  end

  def createDateObject(date, delivery_type, date_rates, honor_cutoff, sub_present)

    dateObj = {
      date: date,
      disabled: false,
      rates: date_rates.select do |rate|
        cutoff = honor_cutoff ? Time.now < DateTime.now.change({ hour: rate.cutoff_time }) : true

        Rails.logger.debug("[args] rate_id: #{rate.id}, date: #{date.inspect}, type: #{delivery_type.inspect}, cutoff?: #{honor_cutoff.inspect}, sub: #{sub_present.inspect}")
        if  sub_present
          if date == Date.today
            rate.delivery_type == 'subscription' && cutoff && rate.delivery_method == 'delivery'
          else
            rate.delivery_type == 'subscription' && rate.delivery_method == 'delivery'
          end
        else
          Rails.logger.debug("[return rate?] #{rate.title.inspect}??? #{rate.delivery_type == delivery_type && cutoff && rate.delivery_method == 'delivery'}")
          rate.delivery_type == delivery_type && cutoff && rate.delivery_method == 'delivery'
        end
      end
    }
  end

  def picker
    shop = Shop.find_by(shopify_domain: params[:shop])
    session = ShopifyApp::SessionRepository.retrieve(shop.id)
    ShopifyAPI::Base.activate_session(session)

    sub_present = params[:subscriptionPresent] == 'true'

    pickup_rate = shop.rates.where(delivery_method: "pickup")
    shipping_rates = shop.rates.where(delivery_method: "shipping")

    cook_schedules = shop.cook_schedules.all
    postal_codes = shop.postal_codes.all
    pickup_locations = shop.pickup_locations.all

    blackout_dates = shop.blackout_dates.all
    # TODO: black out days. This is still being handled on the front end, but we are passing it the dates.
    # bo = blackout_dates.map do |d|
    #   if Date.parse(d) == date
    #   Date.parse(d) == date ? "disable" : "clear"
    # end

    date_from  = Date.current
    Rails.logger.debug("[date] #{date_from.inspect}")
    date_to    = date_from + 6
    date_range = (date_from..date_to).map()

    # Sort by cook time
    schedules = cook_schedules.sort_by { |sched| sched[:cook_time] }

    # TODO: hour should be a variable maybe held in a config/settings from the admin.
    # We'll use last cook_schedule cook_time
    end_of_day = DateTime.now.change({ hour: cook_schedules.last.cook_time })

    # loop through dates:
    cal_data = date_range.map.with_index do |date, i|

      rate_dates = []
      # This logic accounts for when cooks are delivered.
      schedules.each_with_index do |sched, idx|
        # last cook schedule is delivered next day.
        if idx == (schedules.size - 1)
          rate_dates = rate_dates.concat(sched.cook_days[(date - 1.day).wday].rates)
        else
          # otherwise delivered same day as cook.
          rate_dates = rate_dates.concat(sched.cook_days[date.wday].rates)
        end
      end
      Rails.logger.debug("[rate_dates] #{rate_dates.inspect}")


      if Time.now < end_of_day # normal
        if date.today?
          # offer same_day
          createDateObject(date, 'same_day', rate_dates.uniq, true, sub_present)
        elsif !date.today?
          # offer next_day
          createDateObject(date, 'next_day', rate_dates.uniq, true, sub_present)
        else
          # blank day
          Rails.logger.debug("[blank] #{date.inspect}")
          {
            date: date,
            disabled: true,
            rates: []
          }
        end
      elsif Time.now > end_of_day # shift rates over one day
        if (date - 1).today?
          # offer same_day
          createDateObject(date, 'same_day', rate_dates.uniq, false, sub_present)
        elsif !date.today? && !(date - 1).today?
          # offer next_day
          Rails.logger.debug("[#{date.inspect}_rates:] #{rate_dates.uniq.inspect}")
          createDateObject(date, 'next_day', rate_dates.uniq, false, sub_present)
        else
          # blank day
          Rails.logger.debug("[blank] #{date.inspect}")
          {
            date: date,
            disabled: true,
            rates: []
          }
        end
      else
        # Should not run
        Rails.logger.debug("[err] #{date.inspect}")
      end

    end

    Rails.logger.debug("[cal_data] #{cal_data.inspect}")

    date_from  = Date.current + 1
    date_to    = date_from + 6
    pickup_range = (date_from..date_to).map()

    pickup_data = pickup_range.map do |date|
      dateObj = {
        date: date,
        disabled: false,
        locations: pickup_locations.select {|location| location.days_available.include?(date.wday.to_s)},
        rates: pickup_rate
      }
    end

    render json: {deliveryDates: cal_data, pickupDates: pickup_data, blackoutDates: blackout_dates, shippingRates: shipping_rates, postalCodes: postal_codes} , status: 200
  end

  def customerPortal
    shop = Shop.find_by(shopify_domain: params[:shop])
    session = ShopifyApp::SessionRepository.retrieve(shop.id)
    ShopifyAPI::Base.activate_session(session)

    blackout_dates = shop.blackout_dates.all
    render json: { blackoutDates: blackout_dates } , status: 200
  end

  def postal_codes
    shop = Shop.find_by(shopify_domain: params[:shop])
    session = ShopifyApp::SessionRepository.retrieve(shop.id)
    ShopifyAPI::Base.activate_session(session)

    postal_codes = shop.postal_codes.all
    render json: { postalCodes: postal_codes } , status: 200
  end

  def delivery_pickup
    shop = Shop.find_by(shopify_domain: params[:shop])
    session = ShopifyApp::SessionRepository.retrieve(shop.id)
    ShopifyAPI::Base.activate_session(session)

    postal_codes = shop.postal_codes.all
    pickup_locations = shop.pickup_locations.all
    render json: { postalCodes: postal_codes, pickupLocations: pickup_locations } , status: 200
  end
end
