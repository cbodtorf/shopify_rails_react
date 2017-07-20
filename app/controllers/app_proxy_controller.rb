class AppProxyController < ApplicationController
   include ShopifyApp::AppProxyVerification

  def index

    shop = Shop.find_by(shopify_domain: params[:shop])
    shop = ShopifyApp::SessionRepository.retrieve(shop.id)
    ShopifyAPI::Base.activate_session(shop)

    # iterate over order notes
    # Choose the one that was created most recently or double check checkout_token and delete if completed
    order_note = OrderNote.where(cart_token: params[:cart_token])
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
    # order_note = OrderNote.where(cart_token: params[:cart_token]).first

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
      render json: @order_note, status: 200
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
    api_token = '04d6df28f940fada763b693b89c71d9e'
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
          "id": 6757311429,
          "first_name": "Caleb",
          "last_name": "Bodtorf",
          "phone": nil,
          "company": @checkout.attributes[:shipping_address].attributes[:company] += "_",
          "address1": "1234 test",
          "address2": "",
          "city": "Atlanta",
          "province": "Georgia",
          "province_code": "GA",
          "country": "United States",
          "country_code": "US",
          "zip": "30076"
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

  def picker
    shop = Shop.find_by(shopify_domain: params[:shop])
    session = ShopifyApp::SessionRepository.retrieve(shop.id)
    ShopifyAPI::Base.activate_session(session)

    rates = shop.rates.where(delivery_method: "delivery")
    pickupRate = shop.rates.where(delivery_method: "pickup")

    pickup_locations = shop.pickup_locations.all

    # hour should be a variable maybe held in a config/settings from the admin.
    end_of_day = DateTime.now.change({ hour: 15 })

    # black out days = []
    # TODO: Once the db and client are set up to input Settings.
    # blackout_dates = BlackOutDates.all
    blackout_dates = [Date.parse("Mon, 19 Jun 2017")]
    # no sundays
    blackout_sunday = 0

    date_from  = Date.current
    Rails.logger.debug("[date] #{date_from.inspect}")
    date_to    = date_from + 6
    date_range = (date_from..date_to).map()

    # TODO: black out days. This is still being handled on the front end, but we are passing it the dates.
    # bo = blackout_dates.map do |d|
    #   if Date.parse(d) == date
    #   Date.parse(d) == date ? "disable" : "clear"
    # end

    # TODO: add Subscription logic

    if Time.now < end_of_day # normal
      pickerData = date_range.map.with_index do |date, i|
        # black out sundays
        if date.wday != 0
          if date.today?
            # allow same_day for today
            dateObj = {
              date: date,
              disabled: false,
              rates: rates.select do |rate|
                if  params[:subscriptionPresent] == 'true'
                  rate.delivery_type == 'subscription' && Time.now < DateTime.now.change({ hour: rate.cutoff_time })
                else
                  rate.delivery_type == 'same_day' && Time.now < DateTime.now.change({ hour: rate.cutoff_time })
                end
              end
            }
          elsif !date.today?
            # no next day rates today
            dateObj = {
              date: date,
              disabled: false,
              rates: rates.select do |rate|
                if params[:subscriptionPresent] == 'true'
                  rate.delivery_type == 'subscription'
                else
                  rate.delivery_type == 'next_day' && Time.now < DateTime.now.change({ hour: rate.cutoff_time })
                end
              end
            }
          end
        else
          dateObj = {
            date: date,
            disabled: true,
            rates: []
          }
        end
      end
    elsif Time.now > end_of_day # shift rates over one day
      pickerData = date_range.map.with_index do |date, i|
        # black out sundays
        if date.wday != 0
          if i == 0
            # disable
            dateObj = {
              date: date,
              disabled: true,
              rates: []
            }
          elsif (date - 1).today?
            # allow same_day for tomorrow
            dateObj = {
              date: date,
              disabled: false,
              rates: rates.select {|rate| rate.delivery_type == 'same_day'}
            }
          elsif !date.today? && !(date - 1).today?
            # no next day rates today or tomorrow
            dateObj = {
              date: date,
              disabled: false,
              rates: rates.select {|rate| rate.delivery_type == 'next_day'}
            }
          end
        else
          dateObj = {
            date: date,
            disabled: true,
            rates: []
          }
        end
      end
    end

    date_from  = Date.current + 1
    date_to    = date_from + 6
    pickup_range = (date_from..date_to).map()

    pickupData = pickup_range.map do |date|
      dateObj = {
        date: date,
        disabled: false,
        locations: pickup_locations.select {|location| location.days_available.include?(date.wday.to_s)},
        rates: pickupRate
      }
    end

    render json: {deliveryDates: pickerData, pickupDates: pickupData, blackout_dates: blackout_dates} , status: 200
  end
end
