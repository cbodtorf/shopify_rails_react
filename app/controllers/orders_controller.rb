class OrdersController < ShopifyApp::AuthenticatedController

  def index
    @rates = shop.rates.all
    @pickup_locations = shop.pickup_locations.all

    @order = ShopifyAPI::Order.find(params[:id])
    @products = ShopifyAPI::Product.find(:all, :params=>{:ids => @order.line_items.map{|item| item.product_id.to_i}.join(','), :fields => "image,id"})

    @order.attributes[:line_items].map{|item| item.attributes[:image] = @products.select{|product| product.attributes[:id] == item.attributes[:product_id]}.first.attributes[:image]}

  end

  def update
    metafield = ShopifyAPI::Metafield.find(:first, :params=>{:resource => "products", :resource_id => params[:id], :namespace => "bundle", :key => "items"})

    #  Delete the metafield, it is not needed if there are no associated products.
    if params[:metafield] == ''
      metafield.destroy
    else
      metafield.update_attributes(:value => params[:metafield])
    end

    redirect_to('/success')
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

end
