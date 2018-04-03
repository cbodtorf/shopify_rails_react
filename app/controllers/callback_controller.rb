class CallbackController < ApplicationController
  skip_before_action :verify_authenticity_token

  def search
    value = params.fetch('rate', {})
    addrs = value.fetch('destination', {})
    items = value.fetch('items', [])

    postal_codes_match = shop.postal_codes.pluck(:title).include?(addrs[:postal_code].slice(0..4))

    if items.first['properties'].present?
      rate_id = items.first['properties']['_Delivery rate id']
      if rate_id != nil
        rates = shop.rates.where(:id => rate_id.to_i)
        unless postal_codes_match
          unless rates.first.delivery_method == 'pickup'
            rates = shop.rates.where(:delivery_method => 'shipping')
          end
        end
      else
        rates = []
      end
    elsif items.map{|item| item["name"].include?('Auto renew')}.include?(true)
      # return subscription rate
      if postal_codes_match
        rates = shop.rates.where(:code => 'subscription')
      else
        rates = shop.rates.where(:delivery_method => 'shipping')
      end
    else
      rates = []
    end

    rates = rates.map do |rate|
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
    @shop ||= Shop.find(params[:id])
  end

end
