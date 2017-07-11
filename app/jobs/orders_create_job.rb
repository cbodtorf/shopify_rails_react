class OrdersCreateJob < ApplicationJob

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)
    Rails.logger.info("[Order Create - params]: #{shop.inspect}")

    shop.with_shopify_session do
      # delivery_date = webhook[:note_attributes].select do |note|
      #   note.attributes[:name] === "delivery_date"
      # end

      order_note = OrderNote.where(checkout_token: webhook[:checkout_token]).first
      Rails.logger.info("[Order Create - note]: #{order_note.inspect}")
      Rails.logger.info("[Order Create - sa]: #{order_note.shipping_address.inspect}")
      # order has been created, we can do clear these unneeded records.
      order_note.shipping_address.destroy
      order_note.destroy
    end
  end

end
