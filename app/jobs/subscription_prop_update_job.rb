class SubscriptionPropUpdateJob < ApplicationJob
  def perform(shop_domain:, variant_id:, product_id:, address_id:)
    shop = Shop.find_by(shopify_domain: shop_domain)
    Rails.logger.debug("variant_id #{variant_id}")
    Rails.logger.debug("product_id #{product_id}")
    Rails.logger.debug("address_id #{address_id}")

    shop.with_shopify_session do
      shopify_shop = ShopifyAPI::Shop.current
      # Update Subscription

      # get product and metafields
      product = ShopifyAPI::Product.find(product_id, params: { fields: 'id,variants'})
      # Rails.logger.debug("product #{product.attributes[:id]}")
      product.metafield = ShopifyAPI::Metafield.find(:first ,:params=>{:resource => "products", :resource_id => product.id, :namespace => "bundle", :key => "items"})
      if product.metafield != nil
        product.metafield = product.metafield.value.split(',').map.with_index do |item, index|
          {name: "item #{index + 1}", value: item}
        end
      else
        product.metafield = []
      end
      # Rails.logger.debug("product.metafield #{product.metafield.inspect}")

      unless product.metafield.empty?
        # Rails.logger.debug("product.metafield.empty? #{product.metafield.empty?}")
        # Rails.logger.debug("product.attributes[:variants] #{product.attributes[:variants].count}")
        product_variant = product.attributes[:variants].find {|variant| variant.attributes[:id].to_i == variant_id.to_i}
        # Rails.logger.debug("product_variant #{product_variant.inspect}")

        sub_to_update = nil
        poll_status = false
        # Poll Recharge a max of 5 times (or 10seconds).
        5.times do |i|
          address_subs = shop.getRechargeData("https://api.rechargeapps.com/subscriptions/?status=ACTIVE&address_id=#{address_id}&created_at_min=#{(Date.today - 1.day).strftime("%Y/%m/%d")}")['subscriptions']
          Rails.logger.debug("address_subs #{address_subs.inspect}")
          Rails.logger.debug("address_subs #{address_subs.to_a.any?{|sub| sub["shopify_variant_id"].to_i == variant_id.to_i}}")
          Rails.logger.debug("sub #{address_subs.to_a.find {|sub| sub["shopify_variant_id"].to_i == variant_id.to_i}}")
          if address_subs.to_a.any?{|sub| sub["shopify_variant_id"].to_i == variant_id.to_i}
            sub_to_update = address_subs.to_a.find {|sub| sub["shopify_variant_id"].to_i == variant_id.to_i}
            poll_status = true
            break
          else
            sleep 2
          end
        end
        Rails.logger.debug("sub_to_update #{sub_to_update.inspect}")
        Rails.logger.debug("poll_status #{poll_status}")

        if sub_to_update
          # Update meta based on variant
          if product_variant.attributes[:title] != "Default Title" && product_variant.attributes[:title].include?("Day")
            qty = product_variant.attributes[:title].split(" Day").first
            product.metafield.each do |m|
              m["value"] = m["value"].split(' x').first + " x" + qty
            end
          end

          # Send Recharge new subscription property data.
          data = {
            properties: product.metafield
          }
          api_token = ENV['RECHARGE_API_KEY']
          response = HTTParty.put("https://api.rechargeapps.com/subscriptions/#{sub_to_update["id"]}",
                                   :body => data.to_json,
                                   :headers => { "Content-Type" => 'application/json', "X-Recharge-Access-Token" => api_token})
         case response.code
            when 200
              puts "All good! Subscription #{sub_to_update["id"]} updated."
            when 404
              puts "O noes not found!"
            when 500...600
              puts "ZOMG ERROR #{response.code}"
          end
          response.parsed_response
        else
          Rails.logger.debug("No subs to update.")
        end
      end

      Rails.logger.debug("SubscriptionPropUpdate Job Complete")
    end
  end
end
