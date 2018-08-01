class Shop < ActiveRecord::Base
  include ShopifyApp::Shop
  include ShopifyApp::SessionStorage

  has_many :rates, dependent: :destroy
  has_many :cook_schedules, dependent: :destroy
  has_many :order_notes, dependent: :destroy
  has_many :pickup_locations, dependent: :destroy
  has_many :blackout_dates, dependent: :destroy
  has_many :postal_codes, dependent: :destroy
  has_many :extended_delivery_zones, dependent: :destroy

  def shipping_carrier_created?
    shipping_carrier_id.present? && !shipping_carrier_error?
  end

  def shipping_carrier_error?
    shipping_carrier_id == 0
  end

  def has_details?
    currency.present? && money_format.present?
  end

  def getRechargeData(endpoint)
    # TODO: bamboo specific code,
    # Access Recharge API
    api_token = ENV['RECHARGE_API_KEY']

    response = HTTParty.get(endpoint,
                             :headers => { "Content-Type" => 'application/json', "X-Recharge-Access-Token" => api_token})
   case response.code
      when 200
        puts "All good!"
      when 404
        puts "O noes not found!"
      when 500...600
        puts "ZOMG ERROR #{response.code}"
    end

    response.parsed_response
  end

  def getOutOfStockProduct
    # array of out of stock variant ids
    out_variants = []
    out_variants_name = []

    products = ShopifyAPI::Product.find(:all, params: { limit: 250 }).each do |product|
      # remove subscriptions to reduce count
      if !product.attributes[:title].downcase.include?("auto")

        # find out of stock
        variants_out = product.attributes[:variants].select do |variant|
          if variant.attributes[:inventory_management] == "shopify" && variant.attributes[:inventory_quantity] < 1
            out_variants.push(variant.attributes[:id])
            out_variants_name.push(product.attributes[:title])
            true
          else
            false
          end
        end
      end
    end

    out_variants
  end

  def postal_codes_match?(postal_code_to_check)
    # original shop postal code list
    self.postal_codes.pluck(:title)
      .push(
        *self.extended_delivery_zones # asterik will concat original array and all zones' codes
          .enabled # only enabled zones
          .pluck(:postal_codes) # pluck only postal_code text
          .flatten # add extended codes to original list
      )
      .include?(
        postal_code_to_check # Does this code appear in the full postal code array
          .slice(0..4) # only check first 5 digits for hyphenated zips
      )
  end
end
