class CallbackController < ApplicationController
  skip_before_action :verify_authenticity_token

  #TODO: need to figure out how to reset the server side caching so that this method
  # runs if the cart info is the same, but just the order notes change.

  def search
    # TODO: need to have destination address in order note rather than a class variable

    # old way of getting order notes
    # @order_notes = CheckoutsUpdateJob.getOrderNotes()

    value = params.fetch('rate', {})
    addrs = value.fetch('destination', {})
    items = value.fetch('items', [])

    Rails.logger.info("[CALLBACK addrs] #{addrs[:address1].inspect}")
    Rails.logger.info("[CALLBACK addrs] #{addrs[:phone].inspect}")
    Rails.logger.info("[CALLBACK addrs] #{addrs[:city].inspect}")
    Rails.logger.info("[CALLBACK addrs] #{addrs[:postal_code].inspect}")
    Rails.logger.info("[CALLBACK addrs] #{addrs[:province].inspect}")
    Rails.logger.info("[CALLBACK addrs] #{addrs[:country].inspect}")
    Rails.logger.info("[CALLBACK addrs] #{addrs[:address2].inspect}")
    Rails.logger.info("[CALLBACK shipping addy first] #{ShippingAddress.first.inspect}")
    # byebug
    shipping_address = ShippingAddress.where({
      address1: addrs[:address1],
      phone: addrs[:phone],
      city: addrs[:city],
      zip: addrs[:postal_code],
      province_code: addrs[:province],
      country_code: addrs[:country],
      address2: addrs[:address2]
      })
      #       company: addrs[:company_name]
    Rails.logger.info("[shipping addrs] #{shipping_address.empty?}")
    Rails.logger.info("[shipping addrs] #{shipping_address.inspect}")
    @order_note = OrderNote.find(shipping_address.first[:order_note_id])

    Rails.logger.info("[ORDER NOTES] #{@order_note.inspect}")

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
