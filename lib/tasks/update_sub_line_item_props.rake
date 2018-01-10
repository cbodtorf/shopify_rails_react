# lib/tasks/update_sub_line_item_props.rake

namespace :scheduler do
    desc "Update subscriptions that have bundles without line item properties."
    task update_sub_line_item_props: :environment do

      # TODO: bamboo specific code, should figure out a way to make this work for all shops with subscriptions.
      shop = Shop.find_by(shopify_domain: "bamboojuices-dev.myshopify.com")
      session = ShopifyApp::SessionRepository.retrieve(shop.id)
      ShopifyAPI::Base.activate_session(session)
      puts "[1.] Find stores with recharge subscriptions: #{shop.attributes[:name]}"

      # grab queued charges that will be charged tomorrow
      today = Date.current
      rechargeSubscriptions = shop.getRechargeData("https://api.rechargeapps.com/charges/?status=QUEUED&limit=250&date=#{today + 1.day}")['charges']
      puts "[2.] Find Recharge Charges that are queued #{rechargeSubscriptions.count}"

      # bundles are designated by 'bundle' collection, which is requires 'bundle' tag.
      bundle_collection = ShopifyAPI::SmartCollection.find(:first, params: { handle: 'bundle', fields: 'id' })
      bundles = ShopifyAPI::Product.find(:all, params: { collection_id: bundle_collection.attributes[:id], fields: 'id,variants' })
      bundle_variant_ids = []

      bundles.each do |bundle|
        bundle.attributes[:variants].each do |variant|
          bundle_variant_ids.push(variant.attributes[:id])
        end

        bundle.metafield = ShopifyAPI::Metafield.find(:first ,:params=>{:resource => "products", :resource_id => bundle.id, :namespace => "bundle", :key => "items"})

        if bundle.metafield != nil
          bundle.metafield = bundle.metafield.value.split(',').map.with_index do |item, index|
            {name: "item #{index + 1}", value: item}
          end
        else
          bundle.metafield = []
        end
      end

      puts "[3.] Find Bundle variants #{bundle_variant_ids.count}"

      subs_to_update = []
      bundles_to_get_meta = []
      rechargeSubscriptions.select do |charge|
        puts "charge_id: #{charge['id']}"
        charge['line_items'].select do |item|
          puts "title: #{item['title']}, id: #{item['shopify_variant_id']}"
          puts "sub: #{item['subscription_id']}"
          puts "properties: #{item['properties']} #{item['properties'].blank?}"
          if bundle_variant_ids.include? item['shopify_variant_id'].to_i
            subs_to_update.push({:subscription_id => item['subscription_id'], :variant_id => item['shopify_variant_id']})
            bundles_to_get_meta.push(item['shopify_variant_id'])
            true
          end
        end
      end

      puts "[5.] Find Charge/Subscriptions with bundles #{subs_to_update.inspect}"

      # skip charge
      subs_to_update.each do |sub|

        # meta = bundles.find{|b| b.attributes[:variants].any? {|v| v.attributes[:id] == sub[:variant_id]} }
        multiply_meta = false
        meta = bundles.find do |b|
          puts "Product: #{b.attributes[:id]}"
          b.attributes[:variants].any? do |v|
            puts "title: #{v.attributes[:title]}"
            puts "#{v.attributes[:id]} == #{sub[:variant_id]} #{v.attributes[:id] == sub[:variant_id]}"
            if v.attributes[:title] != "Default Title" && v.attributes[:title].include?("Day")
              qty = v.attributes[:title].split(" Day").first
              puts "qty: #{qty}"
              b.metafield.each do |m|
                m["value"] = m["value"].split(' x').first + " x" + qty
                puts "m: #{m}"
              end
            end

            v.attributes[:id].to_i == sub[:variant_id].to_i
          end
        end

        puts "meta: #{meta.inspect}"
        data = {
          properties: meta.metafield
        }

        api_token = ENV['RECHARGE_API_KEY']

        response = HTTParty.put("https://api.rechargeapps.com/subscriptions/#{sub[:subscription_id]}",
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

    end
end
