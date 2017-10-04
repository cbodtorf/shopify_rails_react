class OrdersController < ShopifyApp::AuthenticatedController

  def index
    @rates = shop.rates.all
    @pickup_locations = shop.pickup_locations.all

    @order = ShopifyAPI::Order.find(params[:id])
    @products = ShopifyAPI::Product.find(:all, :params=>{:ids => @order.line_items.map{|item| item.product_id.to_i}.join(','), :fields => "image,id"})

    if @products.size > 0
      @order.attributes[:line_items].map{|item| item.attributes[:image] = @products.select{|product| product.attributes[:id] == item.attributes[:product_id]}.first.attributes[:image]}
    end

  end

  def update
    order = ShopifyAPI::Order.find(params[:id])

    Rails.logger.debug("shop: #{shop.inspect}")
    Rails.logger.debug("order: #{params[:order][:note_attributes].inspect}")

    if order.update_attributes(order_params)
      redirect_to("/orders?id=#{params[:id]}&shop=#{shop.shopify_domain}")
    else
      redirect_to("/orders?id=#{params[:id]}&shop=#{shop.shopify_domain}")
    end
  end

  def create
    # add/save metafield
    product = ShopifyAPI::Product.find(params[:id])
    product.add_metafield(ShopifyAPI::Metafield.new({
       :namespace => 'bundle',
       :key => 'items',
       :value => params[:metafield],
       :value_type => 'string'
    }))

    redirect_to('/success')
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

end
