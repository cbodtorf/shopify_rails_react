class ContextualRate
  attr_accessor :rate, :items, :addrs, :order_notes

  def initialize(rate, items, addrs, order_notes)
    @rate = rate
    @items = items
    @addrs = addrs
    @order_notes = order_notes
  end

  def to_hash
    {
      service_name: rate.title,
      service_code: rate.code.presence || rate.title.underscore,
      total_price: calculate_price,
      currency: rate.shop.currency,
      description: rate.description,
    }
  end

  def valid?
    return false unless valid_price?
    return false unless valid_grams?
    return false unless valid_conditions?
    return false unless valid_rate?

    true
  end

  private

  def calculate_price
    grams_price = [items_grams - rate.price_weight_modifier_starter, 0].max * rate.price_weight_modifier
    total_price = rate.price + grams_price

    rate.product_specific_prices.each do |product_specific_price|
      items.each do |item|
        if product_specific_price.valid_for?(item)
          total_price += product_specific_price.price * item['quantity']
        end
      end
    end

    total_price
  end

  def items_price
    @items_price ||= items.sum { |item| item['price'] * item['quantity'] }
  end

  def items_grams
    @items_grams ||= items.sum { |item| item['grams'] == nil ? 0 : item['grams'] * item['quantity'] }
  end

  def valid_price?
    if rate.min_price.present? && rate.max_price.present?
      items_price.between?(rate.min_price, rate.max_price)
    elsif rate.min_price.present?
      items_price >= rate.min_price
    elsif rate.max_price.present?
      items_price <= rate.max_price
    else
      true
    end
  end

  def valid_grams?
    if rate.min_grams.present? && rate.max_grams.present?
      items_grams.between?(rate.min_grams, rate.max_grams)
    elsif rate.min_grams.present?
      items_grams >= rate.min_grams
    elsif rate.max_grams.present?
      items_grams <= rate.max_grams
    else
      true
    end
  end

  def valid_conditions?
    rate.conditions.all? do |condition|
      if Matcher::PRODUCT_FIELDS.include?(condition.field)
        block = ->(item) { condition.valid_for?(item[condition.field]) }

        if condition.all_items_must_match?
          items.all?(&block)
        else
          items.any?(&block)
        end
     else
       condition.valid_for?(addrs[condition.field])
     end
   end
  end

  def valid_rate?
    if order_notes != nil
      Rails.logger.debug("checkout_method: #{order_notes.checkout_method.inspect}")
      Rails.logger.debug("delivery_method: #{rate.inspect}")
      Rails.logger.debug("rate_id: #{order_notes.rate_id.inspect}")
      rate.id == order_notes.rate_id.to_i
    elsif @items.map{|item| item["name"].include?('Auto renew')}.include?(true)
      # return subscription rate
      # TODO: recharge doesn't intiate checkout through Shopify so no webhook data.
      rate.delivery_type.downcase == 'subscription'
    else
      true
    end
  end
end
