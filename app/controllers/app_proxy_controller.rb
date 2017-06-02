class AppProxyController < ApplicationController
   include ShopifyApp::AppProxyVerification

  def index

    shop = Shop.find_by(shopify_domain: params[:shop])
    shop = ShopifyApp::SessionRepository.retrieve(shop.id)
    Rails.logger.debug("[Shop] #{shop.inspect}")
    ShopifyAPI::Base.activate_session(shop)

    # Need to figure out if I should iterate over this or if my Order Notes woudl be better
    # It might be resource intensive iterating over a ton of checkouts.
    @checkout = ShopifyAPI::Checkout.find(:all)
    @checkout = @checkout.select {|c| c.attributes[:cart_token] == params[:cart_token]}.first
    Rails.logger.debug("[Checkout] #{@checkout.inspect}")

    if OrderNote.exists?(checkout_token: @checkout.attributes[:token])
      @order_notes = OrderNote.where(checkout_token: @checkout.attributes[:token]).first
      Rails.logger.debug("[Order Note Exists] #{@order_notes.inspect}")

      if @order_notes.update_attributes(order_note_params)
        breakCarrierCache()
        render json: @order_notes, status: 200
      else
        render json: { errors: @order_notes.errors }, status: 422
      end
    else
      @order_notes = OrderNote.create(order_note_params)

      if @order_notes.save
        breakCarrierCache()
        render json: @order_notes, status: 200
      else
        # This just for reference if I wanted to render a page
        # render layout: false, content_type: 'application/liquid'
        render json: { errors: @order_notes.errors }, status: 422
      end
    end



    Rails.logger.debug("[Checkout edit] #{@checkout.inspect}")
  end

  def order_note_params
    params.permit(
      :checkout_token,
      :checkout_method,
      :postal_code,
      :delivery_time,
      :delivery_date
    )
  end

  def breakCarrierCache
    api_token='04d6df28f940fada763b693b89c71d9e'
    id=params[:checkout_token]
    endpoint="https://bamboojuices.myshopify.com/admin/checkouts/#{id}.json"
    # TODO: need to encode Base64.encode64('username:password')
    # Should also look into whether or not I can use the App's credentials and not the private app.
    token_string="Basic MDRkNmRmMjhmOTQwZmFkYTc2M2I2OTNiODljNzFkOWU6MTViZjdjNzZiMWQ3YmUyNmQwOTJmZjA4ZjA2MWVhNWQ="

    data = {
      "checkout": {
        "token": params[:checkout_token],
        "shipping_address": {
          "id": 6757311429,
          "first_name": "Caleb",
          "last_name": "Bodtorf",
          "phone": nil,
          "company": @checkout.attributes[:shipping_address].attributes[:company] += " !",
          "address1": "1234 test",
          "address2": "",
          "city": "Atlanta",
          "province": "Georgia",
          "province_code": "GA",
          "country": "United States",
          "country_code": "US",
          "zip": "30076"
        }
      }
    }

    response = HTTParty.put(endpoint,
                             :body => data.to_json,
                             :headers => { "Content-Type" => 'application/json', "Authorization" => token_string})
    puts response.body
  end
end
