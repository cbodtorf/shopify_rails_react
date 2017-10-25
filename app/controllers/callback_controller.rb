class CallbackController < ApplicationController
  skip_before_action :verify_authenticity_token

  def search
    value = params.fetch('rate', {})
    addrs = value.fetch('destination', {})
    items = value.fetch('items', [])
    postal_codes = shop.postal_codes.all

    rates = shop.rates.includes(:conditions, :product_specific_prices).map do |rate|
      ContextualRate.new(rate, items, addrs, postal_codes)
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
    @shop ||= Shop.find(params[:id])
    Rails.logger.info("[@shop] #{@shop.inspect}")
  end

end
