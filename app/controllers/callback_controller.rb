class CallbackController < ApplicationController
  skip_before_action :verify_authenticity_token

  def search
    value = params.fetch('rate', {})
    addrs = value.fetch('destination', {})
    items = value.fetch('items', [])

    Rails.logger.info("[Shipping?] #{ShippingAddress.all.inspect}")

    shipping_address = ShippingAddress.where({
      address1: addrs[:address1],
      phone: addrs[:phone],
      city: addrs[:city],
      zip: addrs[:postal_code],
      province_code: addrs[:province],
      country_code: addrs[:country],
      address2: addrs[:address2]
      })
    Rails.logger.info("[shipping addrs] #{shipping_address.empty?}")
    Rails.logger.info("[shipping addrs] #{shipping_address.inspect}")
    Rails.logger.info("[shipping addrs] #{addrs.inspect}")
    @order_note = OrderNote.find(shipping_address.first[:order_note_id])

    # Rails.logger.info("[ORDER NOTES] #{@order_note.inspect}")

    rates = shop.rates.includes(:conditions, :product_specific_prices).map do |rate|
      ContextualRate.new(rate, items, addrs, @order_note)
    end.select do |rate_instance|
      rate_instance.valid?
    end


    Rails.logger.info("[#{self.class.name}] #{rates.size} rates found")

    render json: { rates: rates.map { |rate| rate.to_hash } }
  rescue JSON::ParserError
    nil
  end

  private

  def shop
    # TODO: hacking cause i don't understand why this isn't working. Need to update shop object with proper shop_id
    # @shop ||= Shop.find(params[:id])
    @shop ||= Shop.first
  end

end
