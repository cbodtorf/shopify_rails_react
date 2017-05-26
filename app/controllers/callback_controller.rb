class CallbackController < ApplicationController
  skip_before_action :verify_authenticity_token

  #TODO: need to figure out how to reset the server side caching so that this method
  # runs if the cart info is the same, but just the order notes change.

  def search
    @order_notes = CheckoutsUpdateJob.getOrderNotes()

    value = params.fetch('rate', {})
    addrs = value.fetch('destination', {})
    items = value.fetch('items', [])

    Rails.logger.info("[ORDER NOTES] #{@order_notes.inspect}")

    rates = shop.rates.includes(:conditions, :product_specific_prices).map do |rate|
      ContextualRate.new(rate, items, addrs)
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
