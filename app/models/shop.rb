class Shop < ActiveRecord::Base
  include ShopifyApp::Shop
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
    api_token = '9ddfc399771643169db06e1b162a5b73'

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
end
