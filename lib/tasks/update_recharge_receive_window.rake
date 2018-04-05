# rake recharge:update_recharge_receive_window

namespace :recharge do
    desc "Update "
    task update_recharge_receive_window: :environment do
      # Start Session

      # TODO: bamboo specific code, should figure out a way to make this work for all shops with subscriptions.
      if ENV["RAILS_ENV"] == "production"
        shop = Shop.find_by(shopify_domain: "bamboojuices.myshopify.com")
      else
        shop = Shop.find_by(shopify_domain: "bamboojuices-dev.myshopify.com")
      end
      session = ShopifyApp::SessionRepository.retrieve(shop.id)
      ShopifyAPI::Base.activate_session(session)


      # Initializing.
      limit = 250              # shopify/recharge limits max of 250 objects
      CYCLE = 0.5             # You can average 2 calls per second
      page = 1                # page counter starting at one
      start_time = Time.now   # start time for tracking api calls

      loop do
        puts "Doing page #{page}..."
        rechargeAddressUrl = "https://api.rechargeapps.com/addresses?limit=#{limit}&page=#{page}"
        addresses = shop.getRechargeData(rechargeAddressUrl)["addresses"]
        puts "addresses size: #{addresses.size}"
        addresses.each do |addy|
          updatedReceiveWindow = "10am - 4pm"

          if addy["cart_attributes"].blank?
            # handle if cart attributes are nil
            puts "err cart attributes blank for address: #{addy["id"].inspect}"
            addy["cart_attributes"] == nil ? addy["cart_attributes"] = [] : nil
          end

          # reduce attributes into hash
          cart_attributes = addy["cart_attributes"].map{|a| {a["name"].titleize => a["value"]} }.reduce Hash.new, :merge

          # filter out every but delivery
          unless cart_attributes["Checkout Method"].blank?
            next if cart_attributes["Checkout Method"].downcase != "delivery"
          else
            puts "err checkout method blank for address: #{addy["id"].inspect}"
            next
          end

          has_receive_window = false
          addy["cart_attributes"].map do |attr|
            if attr["name"] == "Receive Window"
              attr["value"] = updatedReceiveWindow
              has_receive_window = true
            end
          end

          unless has_receive_window
            addy["cart_attributes"].push({"name" => "Receive Window", "value" => updatedReceiveWindow})
          end
          data = addy
          puts "update data >>> #{data["id"].inspect}"
          saveRechargeData("https://api.rechargeapps.com/addresses/#{addy["id"]}", data)
        end

        if addresses.size != limit
          puts "Over and out."
          break
        else
          stop_time = Time.now
          puts "Last batch processing started at #{start_time.strftime('%I:%M%p')}"
          puts "The time is now #{stop_time.strftime('%I:%M%p')}"
          processing_duration = stop_time - start_time
          puts "The processing lasted #{processing_duration.to_i} seconds."
          wait_time = (CYCLE - processing_duration).ceil
          puts "We have to wait #{wait_time} seconds then we will resume."
          sleep wait_time if wait_time > 0
          start_time = Time.now

          # increment page number if object's size is equal to limit
          page = page + 1
          puts "Moving to page #{page}..."
        end
      end # end loop

    end ## end task
end


def saveRechargeData(endpoint, data)
  # TODO: bamboo specific code,
  # Access Recharge API
  api_token = ENV['RECHARGE_API_KEY']

  response = HTTParty.put(endpoint,
                           :body => data.to_json,
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
