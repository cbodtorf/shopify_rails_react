class CheckoutsUpdateJob < ApplicationJob
  alias_attribute :token, :checkout_token
  accepts_nested_attribute_for

  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      # create our OrderNote record w/ cart & checkout tokens & destination shipping_address
      @order_note = OrderNote.create(order_note_params)

      if @order_note.save
        Rails.logger.info("[Order Note] - Saving: #{@order_note.inspect}")
      else
        Rails.logger.error("[Order Note] - Error: #{@order_note.inspect}")
      end
    end
  end

  def order_note_params
    hash = {}
    hash[:checkout_token] = webhook[:token]
    hash[:cart_token] = webhook[:cart_token]
    webhook[:note_attributes].map do |note|
      if note.name === 'postal_code' || note.name === 'delivery_time' || note.name === 'delivery_date' || note.name === 'checkout_method'
        hash[note.name.to_sym] = note.value
      end
    end
    hash[:shipping_address] = webhooks[:shipping_address]
    return hash
  end
end
