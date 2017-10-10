class Shop < ActiveRecord::Base
  include ShopifyApp::SessionStorage

  has_many :rates, dependent: :destroy
  has_many :cook_schedules, dependent: :destroy
  has_many :order_notes, dependent: :destroy
  has_many :pickup_locations, dependent: :destroy
  has_many :blackout_dates, dependent: :destroy
  has_many :postal_codes, dependent: :destroy

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
end
