class DraftOrdersUpdateJob < ApplicationJob

  def perform(shop_domain:, webhook:)
    unless webhook[:status] == "completed"
      shop = Shop.find_by(shopify_domain: shop_domain)

      shop.with_shopify_session do
        Rails.logger.info("[Draft]: #{webhook[:name].inspect}")
        order = ShopifyAPI::DraftOrder.find(webhook[:id])

        if webhook[:line_items].size > 0

          # If order contains line_items that are tagged with bundle
          # find metafields and add properties to these items

          updated_line_items = []

          product_ids = webhook[:line_items].each do |item|
            # Rails.logger.info("[item]: #{item.inspect}")
            metafield = ShopifyAPI::Metafield.find(:first ,:params=>{:resource => "products", :resource_id => item[:product_id].to_i, :namespace => "bundle", :key => "items"})
            Rails.logger.info("[metafield]: #{metafield.inspect}")

            if metafield != nil
              if item[:variant_title] != ""
                multiplier = item[:variant_title].split(' Days').first.to_i
                properties = metafield.value.split(',').map.with_index do |meta, index|
                  {name: "item: #{index + 1}", value: "#{meta.split(' x').first} x#{meta.split(' x').last.to_i * multiplier}"}
                end

                item[:properties] = properties
                updated_line_items.push(item)
              else
                properties = metafield.value.split(',').map.with_index do |meta, index|
                  {name: "item: #{index + 1}", value: meta}
                end
                line_item[:properties] = properties
                updated_line_items.push(item)
              end

            else
              updated_line_items.push(item)
            end
          end

          Rails.logger.info("[updated_line_items]: #{updated_line_items.inspect}")

          order.attributes[:line_items] = order.attributes[:line_items].map.with_index do |item, index|
            item.attributes = updated_line_items[index]
          end
          # Rails.logger.debug("[line items update] #{order.inspect}")

          if order.save
            Rails.logger.debug("[success] #{order.inspect}")
          else
            Rails.logger.debug("error #{order.errors.full_messages}")
          end
        end
      end
    end
  end

end
