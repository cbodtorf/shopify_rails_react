class OrdersController < ShopifyApp::AuthenticatedController

  def index
    @rates = shop.rates.pluck_to_hash(:id, :title, :description, :delivery_method, :price, :cutoff_time, :receive_window, :delivery_type, :notes)
    @pickup_locations = shop.pickup_locations.pluck_to_hash(:id, :title, :address, :description, :days_available)

    @order = ShopifyAPI::Order.find(params[:id])
    @products = ShopifyAPI::Product.find(:all, :params=>{:ids => @order.line_items.map{|item| item.product_id.to_i}.join(','), :fields => "image,id"})

    if @products.size > 0
      @order.attributes[:line_items].map{|item| item.attributes[:image] = @products.select{|product| product.attributes[:id] == item.attributes[:product_id]}.first.attributes[:image]}
    end

  end

  def update
    order = ShopifyAPI::Order.find(params[:id])

    Rails.logger.debug("order: #{params[:order][:note_attributes].inspect}")

    if order.update_attributes(order_params)
      redirect_to("/orders?id=#{params[:id]}&shop=#{shop.shopify_domain}")
    else
      redirect_to("/orders?id=#{params[:id]}&shop=#{shop.shopify_domain}")
    end
  end

  def destroy
    # TODO: there is an issue where sometimes Can't verify CSRF token authenticity.
    rate = shop.rates.find(params[:id])

    if rate.destroy
      redirect_to action: 'index'
    else
      redirect_to action: 'index', id: rate.id
    end
  end

  def order_params
    params.require(:order).tap do |whitelisted|
      whitelisted[:note_attributes] = params[:order][:note_attributes]
    end
  end

  def redirect_to_recharge_address
    shop = Shop.find_by(shopify_domain: params[:shop])
    session = ShopifyApp::SessionRepository.retrieve(shop.id)
    ShopifyAPI::Base.activate_session(session)

    order = shop.getRechargeData("https://api.rechargeapps.com/orders/?status=SUCCESS&shopify_order_id=#{params[:id]}")['orders'].first
    Rails.logger.debug("order: #{order.inspect}")

    if order != nil
      @redirect_text = "Redirecting to Recharge..."
      @redirect_url = "https://#{params[:shop]}/admin/apps/shopify-recurring-payments/addresses/#{order["address_id"]}"
    else
      @redirect_text = "Not a Subscription. Redirecting to back to Shopify..."
      @redirect_url = "https://#{params[:shop]}/admin/orders/#{params[:id]}"
    end

  end

end
