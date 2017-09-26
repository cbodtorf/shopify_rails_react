# lib/tasks/scheduler.rake

namespace :scheduler do
    desc "Skip subscriptions that contain out of stock product"
    task skip_subs: :environment do

      # TODO: bamboo specific code, should figure out a way to make this work for all shops with subscriptions.
      shop = Shop.find_by(shopify_domain: "bamboojuices.myshopify.com")
      session = ShopifyApp::SessionRepository.retrieve(shop.id)
      ShopifyAPI::Base.activate_session(session)
      puts "[1.] Find stores with recharge subscriptions: #{shop.attributes[:name]}"

      # array of out of stock variant ids
      out_variants = []
      out_variants_name = []

      # bundles
      bundles = []
      out_bundle_variants = []

      products = ShopifyAPI::Product.find(:all, params: { limit: 250 }).each do |product|
        # remove subscriptions to reduce count
        if !product.attributes[:title].downcase.include?("auto")
          # find bundles
          if product.attributes[:tags].downcase.include?("bundle")
            bundles.push(product)
          end

          # find out of stock
          variants_out = product.attributes[:variants].select do |variant|
            if variant.attributes[:inventory_management] == "shopify" && variant.attributes[:inventory_quantity] < 1
              out_variants.push(variant.attributes[:id])
              out_variants_name.push(product.attributes[:title])
              true
            else
              false
            end
          end
        end
      end
      puts "[2.] Find All Products that are out of stock #{out_variants}"

      # find bundles that contain out of stock items
      bundles.each do |bundle|
        bundle.metafield = ShopifyAPI::Metafield.find(:first ,:params=>{:resource => "products", :resource_id => bundle.id, :namespace => "bundle", :key => "items"})
        if bundle.metafield != nil
          bundle.metafield = bundle.metafield.value.split(',').map.with_index do |item, index|
            item = item.split(' x')
            if out_variants_name.include? item.first
              bundle.attributes[:variants].each do |var|
                out_bundle_variants.push(var.attributes[:id])
              end
            end
          end
        else
          bundle.metafield = []
        end
      end
      puts "[3.] Find All Bundles that are out of stock #{out_bundle_variants}"

      # grab queued charges that will be charged tomorrow
      today = Date.current
      rechargeSubscriptions = shop.getRechargeData("https://api.rechargeapps.com/charges/?status=QUEUED&limit=250&date=#{today + 1.day}")['charges']
      puts "[4.] Find Recharge Charges that are queued #{rechargeSubscriptions.count}"

      subs_to_skip = []
      rechargeSubscriptions.select do |charge|
        puts "charge_id: #{charge['id']}"
        charge['line_items'].select do |item|
          puts "title: #{item['title']}, id: #{item['shopify_variant_id']}"
          if out_variants.concat(out_bundle_variants).include? item['shopify_variant_id'].to_i
            subs_to_skip.push({:subscription_id => item['subscription_id'], :charge_id => charge['id']})
            true
          end
        end
      end
      puts "[5.] Find Charge/Subscriptions to be skipped #{subs_to_skip.inspect}"

      # skip charge
      subs_to_skip.each do |sub|
        response = HTTParty.get("https://shopifysubscriptions.com/charge/#{sub[:charge_id]}/skip_existing_queued_charge?date=#{today + 1.day}&charge_id=#{sub[:charge_id]}&item_ids[0]=#{sub[:subscription_id]}",
                                 :headers => { "Content-Type" => 'application/json' })
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
