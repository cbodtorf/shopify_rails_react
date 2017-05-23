class CheckoutsUpdateJob < ApplicationJob
  @@order_notes = nil

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      @@order_notes = OrderNote.new(webhook[:note_attributes])
      Rails.logger.info("[Order Notes] #{@@order_notes.inspect}")
    end
  end

  def self.getOrderNotes
    return @@order_notes
  end

end
