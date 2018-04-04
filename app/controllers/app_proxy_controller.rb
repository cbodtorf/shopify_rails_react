class AppProxyController < ApplicationController
   include ShopifyApp::AppProxyVerification

  def index
    Rails.logger.debug("[signature?] #{params[:signature].inspect}")
    Rails.logger.debug("[checkout_token?] #{params[:checkout_token].inspect}")

    shop = Shop.find_by(shopify_domain: params[:shop])
    session = ShopifyApp::SessionRepository.retrieve(shop.id)
    ShopifyAPI::Base.activate_session(session)

    shopify_checkout_token = nil
    shopify_checkout = nil
    recharge_checkout = false

    if params[:checkout_token].present?
      shopify_checkout_token = params[:checkout_token]
      Rails.logger.debug("[shopify_checkout_token?] #{shopify_checkout_token.inspect}")
      shopify_checkout = ShopifyAPI::Checkout.find(shopify_checkout_token)
      Rails.logger.debug("[shopify_checkout?] #{shopify_checkout.inspect}")

      recharge_items = shopify_checkout.attributes[:line_items].select{|item| item.attributes[:title].include?("Auto renew")}
      recharge_items.empty? ? recharge_checkout = false : recharge_checkout = true

      # Rails.logger.debug("[rate match] #{shopify_checkout.attributes[:note_attributes].attributes["Delivery Rate"]} #{params[:rate_id]}")
      # Rails.logger.debug("[rate match] #{shopify_checkout.attributes[:note_attributes].attributes["Delivery Rate"] == params[:rate_id]}")

      # Clear Cache, unless no shipping address or rate mismatch
      unless shopify_checkout.attributes[:shipping_address] == nil || shopify_checkout.attributes[:note_attributes].attributes["Delivery Rate"] == params[:rate_id]
        # breakCarrierCache(shopify_checkout)
        breakCarrierCacheWeight(shopify_checkout)
      end

      if recharge_checkout
        Rails.logger.debug("Recharge Checkout")
      else
        Rails.logger.debug("Shopify Checkout")
      end

      render json: { breakCache: "success" }, status: 200
    else
      # error
      render json: { errors: "No Cart Token or Checkout Token" }, status: 200
    end
  end


  def breakCarrierCache(checkout)
    Rails.logger.debug("shop: #{params[:shop]}")
    Rails.logger.debug("checkout: #{checkout.inspect}")
    api_token = ENV['SHOPIFY_PRIVATE_API_KEY']
    checkout_token = checkout.attributes[:token]
    endpoint = "https://#{params[:shop]}/admin/checkouts/#{checkout_token}.json"
    # TODO: need to encode Base64.encode64('username:password')
    # Should also look into whether or not I can use the App's credentials and not the private app.
    # ** note on editing company: Must use a character, just a space does not register as a change, probably trimming space at some point.
    # Need to decide if I should revert changes.
    token_string="Basic #{ENV['SHOPIFY_PRIVATE_AUTH']}"
    Rails.logger.debug("token_string: #{token_string}")

    data = {
      "checkout": {
        "token": checkout_token,
        "shipping_address": {
          "id": checkout.attributes[:shipping_address].attributes[:id],
          "company": checkout.attributes[:shipping_address].attributes[:company] += "_",
          "fax": params[:rate_id],
        }
      }
    }
    Rails.logger.debug("data: #{data.to_json}")

    response = HTTParty.put(endpoint,
                             :body => data.to_json,
                             :headers => { "Content-Type" => 'application/json', "Authorization" => token_string})
   case response.code
      when 200
        puts "All good!"
      when 404
        puts "O noes not found!"
      when 403
        # api not allowing access break with product weight
        breakCarrierCacheWeight(checkout)
        puts "api not allowing access break with product weight #{response.code}"
      when 500...600
        puts "ZOMG ERROR #{response.code}"
    end
    Rails.logger.debug("[httparty] #{response.inspect}")
    puts response.body
  end

  def breakCarrierCacheWeight(checkout)
    Rails.logger.debug("shop: #{params[:shop]}")

    variant = checkout.attributes[:line_items].first
    variant_id = variant.attributes[:variant_id]
    w = variant.attributes[:grams].to_i
    break_weight = w > 1000 ? 0 : w + 100

    Rails.logger.debug("variant: #{variant.attributes.inspect}")
    Rails.logger.debug("break_weight: #{break_weight.inspect}")
    Rails.logger.debug("break_weight: #{w.inspect}")

    api_token = ENV['SHOPIFY_PRIVATE_API_KEY']
    endpoint = "https://#{params[:shop]}/admin/variants/#{variant_id}.json"
    # TODO: need to encode Base64.encode64('username:password')
    # Should also look into whether or not I can use the App's credentials and not the private app.
    # ** note on editing company: Must use a character, just a space does not register as a change, probably trimming space at some point.
    # Need to decide if I should revert changes.
    token_string="Basic #{ENV['SHOPIFY_PRIVATE_AUTH']}"
    Rails.logger.debug("token_string: #{token_string}")

    data = {
      "variant": {
        "id": variant_id,
        "weight": break_weight,
        "weight_unit": "g"
      }
    }

    Rails.logger.debug("data: #{data.to_json}")

    response = HTTParty.put(endpoint,
                             :body => data.to_json,
                             :headers => { "Content-Type" => 'application/json', "Authorization" => token_string})
   case response.code
      when 200
        puts "All good!"
      when 404
        puts "O noes not found!"
      when 403

        puts "api not allowing access #{response.code}"
      when 500...600
        puts "ZOMG ERROR #{response.code}"
    end
    Rails.logger.debug("[httparty weight] #{response.inspect}")
    puts response.body
  end

  def createDateObject(date, delivery_type, date_rates, honor_cutoff, day_before_blackout, day_before_no_cooks = false)

    dateObj = {
      date: date,
      disabled: false,
      rates: date_rates.select do |rate|
        cutoff = honor_cutoff ? Time.now < DateTime.now.change({ hour: rate[:cutoff_time] }) : true
        Rails.logger.debug("[args] rate_id: #{rate[:id]}, date: #{date.inspect}, type: #{delivery_type.inspect}, cutoff?: #{honor_cutoff.inspect}, day_before_blackout?: #{day_before_blackout}, day_before_no_cooks: #{day_before_no_cooks}")
        Rails.logger.debug("notes: #{rate[:notes]}")
        if rate[:notes] == "admin" && @admin == false
          next
        end

        if day_before_blackout
          if date == Date.today || (cutoff && date == Date.tomorrow)
            Rails.logger.debug("[ db tort return rate?] #{rate[:title].inspect}??? #{rate[:delivery_type] == delivery_type && cutoff && rate[:delivery_method] == 'delivery'}")
            delivery_type.include?(rate[:delivery_type]) && cutoff && rate[:delivery_method] == 'delivery'
          else
            Rails.logger.debug("[return rate?] #{rate[:title].inspect}??? #{rate[:notes] == "only offer after day with no cooks" && rate[:delivery_method] == 'delivery'}")
            rate[:description] = "Next Day Delivered 4pm - 8pm"
            (rate[:notes] == "show after blackout" && rate[:code] == 'subscription') || (rate[:notes] == "only offer after day with no cooks" && rate[:code] != 'subscription')
          end
        else
          if day_before_no_cooks && rate[:delivery_type] != "same_day"
            Rails.logger.debug("[return rate?] #{rate[:title].inspect}??? #{rate[:delivery_type] == delivery_type && rate[:delivery_method] == 'delivery' && rate[:notes] == 'only offer after day with no cooks'}")
            delivery_type.include?(rate[:delivery_type]) && rate[:delivery_method] == 'delivery' && rate[:notes] == "only offer after day with no cooks"
          else
            Rails.logger.debug("[return rate?] #{rate[:title].inspect}??? #{rate[:delivery_type] == delivery_type && cutoff && rate[:delivery_method] == 'delivery' && rate[:notes] != 'only offer after day with no cooks'}")
            delivery_type.include?(rate[:delivery_type]) && cutoff && rate[:delivery_method] == 'delivery' && rate[:notes] != "only offer after day with no cooks"
          end
        end

      end
    }
  end

  def picker
    shop = Shop.find_by(shopify_domain: params[:shop])
    session = ShopifyApp::SessionRepository.retrieve(shop.id)
    ShopifyAPI::Base.activate_session(session)

    @admin = ActiveModel::Type::Boolean.new.cast(params[:admin])

    Rails.logger.debug("[admin +] #{@admin.inspect}")

    sub_present = params[:subscriptionPresent] == 'true'

    pickup_rate = shop.rates.where(delivery_method: "pickup").pluck_to_hash(:id, :title, :description, :delivery_method, :price, :cutoff_time, :receive_window, :delivery_type, :notes)
    shipping_rates = shop.rates.where(delivery_method: "shipping").pluck_to_hash(:id, :title, :description, :delivery_method, :price, :cutoff_time, :receive_window, :delivery_type, :notes)

    cook_schedules = shop.cook_schedules.all
    postal_codes = shop.postal_codes.pluck_to_hash(:title)
    pickup_locations = shop.pickup_locations.pluck_to_hash(:id, :title, :address, :description, :days_available)

    blackout_dates = shop.blackout_dates.pluck(:blackout_date)

    date_from  = Date.current
    Rails.logger.debug("[date] #{date_from.inspect}")
    date_to    = date_from + 6
    date_range = (date_from..date_to).map()

    # Sort by cook time
    schedules = cook_schedules.sort_by { |sched| sched[:cook_time] }

    # We'll use last cook_schedule cook_time as end of day
    end_of_day = DateTime.now.change({ hour: cook_schedules.last.cook_time })
    end_of_first_cook = DateTime.now.change({ hour: cook_schedules.first.cook_time })

    # loop through dates:
    cal_data = date_range.map.with_index do |date, i|
      day_before_blackout = blackout_dates.any? {|blackout| (date - 1.day) == blackout.to_date}

      day_before_no_cooks = schedules.last.cook_days.any? {|cook_day| Date.parse(cook_day.title).wday == (date - 1.day).wday && cook_day.rate_ids == []}

      blackout = blackout_dates.any? {|blackout| (date) == blackout.to_date}
      Rails.logger.debug("++++++++++++++++++++++++++++")
      Rails.logger.debug("day_before_blackout: #{day_before_blackout}")
      Rails.logger.debug("[DATE]: #{date}")
      Rails.logger.debug("day_before_no_cooks: #{day_before_no_cooks}")

      rate_dates = []
      # This logic accounts for when cooks are delivered.
      schedules.each_with_index do |sched, idx|
        # last cook schedule is delivered next day.
        if idx == (schedules.size - 1) && date != Date.today
          if day_before_blackout || Time.now > end_of_day && date == Date.tomorrow
            if @admin && !day_before_blackout
              rate_dates = rate_dates.concat(sched.cook_days[(date - 2.day).wday].rates.pluck_to_hash(:id, :title, :description, :delivery_method, :price, :cutoff_time, :receive_window, :delivery_type, :notes, :code) )
            end
            if day_before_blackout && sub_present
              rate_dates = rate_dates.concat(sched.cook_days[(date - 2.day).wday].rates.pluck_to_hash(:id, :title, :description, :delivery_method, :price, :cutoff_time, :receive_window, :delivery_type, :notes, :code) )
            end
            # Rails.logger.debug("[last no rates] #{rate_dates}")
          else
            rate_dates = rate_dates.concat(sched.cook_days[(date - 2.day).wday].rates.pluck_to_hash(:id, :title, :description, :delivery_method, :price, :cutoff_time, :receive_window, :delivery_type, :notes, :code) )
            # Rails.logger.debug("[last rates selected] #{rate_dates}")
          end
        else
          # otherwise delivered same day as cook.
          rate_dates = rate_dates.concat(sched.cook_days[date.wday - 1].rates.pluck_to_hash(:id, :title, :description, :delivery_method, :price, :cutoff_time, :receive_window, :delivery_type, :notes, :code) )
          # Rails.logger.debug("[same rates selecte] #{rate_dates}")
        end
      end

      rate_dates = rate_dates.uniq

      # filter subscription rates.
      if sub_present
        rate_dates = rate_dates.select do |r|
          r[:code] == 'subscription'
        end
      else
        rate_dates = rate_dates.select do |r|
          r[:code] != 'subscription'
        end
      end

      Rails.logger.debug("[admin true] #{@admin.inspect}")
      tomorrow = Date.tomorrow

      if blackout
        # blank day
        Rails.logger.debug("[blank] #{date.inspect}")
        {
          date: date,
          disabled: true,
          rates: []
        }
      else
        if Time.now < end_of_day # normal
          # Rails.logger.debug("[normal day] #{Time.now < end_of_day}")
          # offer same_day
          if date.today?
            if @admin
              createDateObject(date, 'same_day', rate_dates, false, day_before_blackout, day_before_no_cooks)
            else
              createDateObject(date, 'same_day', rate_dates, true, day_before_blackout, day_before_no_cooks)
            end
          elsif !date.today?
            # offer next_day
            createDateObject(date, 'next_day', rate_dates, true, day_before_blackout, day_before_no_cooks)
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

          # Rails.logger.debug("[end of day] #{Time.now > end_of_day}")
          # Rails.logger.debug("[tomorrow] #{date == tomorrow} d: #{date} t: #{tomorrow}")
          # Rails.logger.debug("[#{date.inspect}_rates:] #{rate_dates.inspect}")
          # ALLOWS all possible/legitimate rates; does not honor cutoffs

          if date.today? && @admin
            createDateObject(date, 'same_day', rate_dates, false, day_before_blackout, day_before_no_cooks)
          elsif date == tomorrow
            # offer same_day
            if @admin
              createDateObject(date, ['same_day','next_day'], rate_dates, false, day_before_blackout, day_before_no_cooks)
            else
              createDateObject(date, 'same_day', rate_dates, false, day_before_blackout, day_before_no_cooks)
            end
          elsif !date.today? && !(date == tomorrow)
            # offer next_day
            createDateObject(date, 'next_day', rate_dates, false, day_before_blackout, day_before_no_cooks)
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

    end

    Rails.logger.debug("[cal_data] #{cal_data.inspect}")

    pickup_data = date_range.map do |date|
      # PICKUP RATES
      pickupEnabled = {
        date: date,
        disabled: false,
        locations: pickup_locations.select {|location| location[:days_available].include?(date.wday.to_s)},
        rates: pickup_rate
      }
      pickupDisabled = {
        date: date,
        disabled: true,
        rates: []
      }

      blackout = blackout_dates.any? {|blackout| (date) == blackout.to_date}
      if @admin
        # ALLOWS all possible/legitimate rates; does not honor cutoffs
        pickupEnabled
      else # NOT ADMIN
        if blackout
          pickupDisabled
        else
          if Time.now < end_of_first_cook # normal
            pickupEnabled
          elsif Time.now > end_of_first_cook # end of first cook (ie. 11am)
            if date.today?
              pickupDisabled
            elsif !date.today?
              pickupEnabled
            end
          else
            # Should not run
            Rails.logger.debug("[err] #{date.inspect}")
          end
        end
      end
    end # END OF PICKUP DATES

    render json: {deliveryDates: cal_data, pickupDates: pickup_data, blackoutDates: blackout_dates, shippingRates: shipping_rates.sort_by {|a| a[:price]}, postalCodes: postal_codes} , status: 200
  end

  def customerPortal
    shop = Shop.find_by(shopify_domain: params[:shop])
    session = ShopifyApp::SessionRepository.retrieve(shop.id)
    ShopifyAPI::Base.activate_session(session)
    subscriptions = []
    params[:address_ids].split(',').each do |id|
      address_id = id
      address_1 = shop.getRechargeData("https://api.rechargeapps.com/addresses/#{id}")["address"]["address1"]
      # min_by will grab to earliest upcoming charge to avoid dates
      next_charge_scheduled_at = shop.getRechargeData("https://api.rechargeapps.com/subscriptions?address_id=#{id}&status=ACTIVE")["subscriptions"]
      Rails.logger.debug("[charge all #{next_charge_scheduled_at.inspect}")
      Rails.logger.debug("[charge size #{next_charge_scheduled_at.size}")

      if next_charge_scheduled_at.size >= 1
        next_charge_scheduled_at = next_charge_scheduled_at.min_by do |sub|
          Rails.logger.debug("[charge****] #{sub.inspect}")
          Date.parse(sub["next_charge_scheduled_at"])
        end["next_charge_scheduled_at"]
      else
        Rails.logger.debug("[next charge none] #{next_charge_scheduled_at.inspect}")
        next_charge_scheduled_at = "Click to select and then choose date."
      end

      subscriptions.push({ address_id: address_id, address_1: address_1, next_charge_scheduled_at: next_charge_scheduled_at })
    end
    Rails.logger.debug("[subscriptions] #{subscriptions.inspect}")

    blackout_dates = shop.blackout_dates.pluck_to_hash(:title, :blackout_date)
    render json: { blackoutDates: blackout_dates, subscriptions: subscriptions } , status: 200
  end

  def update_subscription_bundle_props
    Rails.logger.debug("Update Subscription Line Item Properties (for bundles)")
    SubscriptionPropUpdateJob.perform_later(shop_domain: params[:shop], variant_id: params[:variant_id], product_id: params[:product_id], address_id: params[:address_id])

    render json: { update: "success" } , status: 200
  end

  def postal_codes
    shop = Shop.find_by(shopify_domain: params[:shop])
    session = ShopifyApp::SessionRepository.retrieve(shop.id)
    ShopifyAPI::Base.activate_session(session)

    postal_codes = shop.postal_codes.pluck_to_hash(:title)
    render json: { postalCodes: postal_codes } , status: 200
  end

  def delivery_pickup
    shop = Shop.find_by(shopify_domain: params[:shop])
    session = ShopifyApp::SessionRepository.retrieve(shop.id)
    ShopifyAPI::Base.activate_session(session)

    postal_codes = shop.postal_codes.pluck_to_hash(:title)
    pickup_locations = shop.pickup_locations.pluck_to_hash(:id, :title, :address, :description, :days_available)
    render json: { postalCodes: postal_codes, pickupLocations: pickup_locations } , status: 200
  end
end
