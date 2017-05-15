class CreateShippingCarrierJob < ApplicationJob
  def perform(shop_domain:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      ShopifyAPI::CarrierService.find(:all).each do |carrier_service|
        begin
          carrier_service.destroy
        rescue
          # Failed to delete carrier. Should we care?
        end
      end

      carrier_service = ShopifyAPI::CarrierService.create(
        name: "Bamboo",
        callback_url: "#{Rails.configuration.application_url}/callback/#{shop.id}.json",
        format: "json",
        service_discovery: true
      )

      shop.update_attribute(:shipping_carrier_id, carrier_service.id)
    end
  ensure
    unless shop.shipping_carrier_created?
      shop.update_attribute(:shipping_carrier_id, 0)
    end
  end
end
