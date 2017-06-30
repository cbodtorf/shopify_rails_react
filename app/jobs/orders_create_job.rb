class OrdersCreateJob < ApplicationJob

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)
    Rails.logger.info("[Order Create - params]: #{params.inspect}")

    shop.with_shopify_session do
      delivery_date = webhook[:note_attributes].select do |note|
        note.attributes[:name] === "delivery_date"
      end
    end
  end

end
