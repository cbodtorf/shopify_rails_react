class BundleController < ShopifyApp::AuthenticatedController

  def index
    # TODO: Need to have conditional if product is not a bundle right now is handled on Client
    @products = ShopifyAPI::Product.find(:all, params: { limit: 50 })

    @bundles = ShopifyAPI::Product.find(:all, params: { product_type: 'bundle' })
    @bundles.each do |bundle|
      bundle.metafield = ShopifyAPI::Metafield.find(:first ,:params=>{:resource => "products", :resource_id => bundle.id, :namespace => "bundle", :key => "items"})
      if bundle.metafield != nil
        bundle.metafield = bundle.metafield.value.split(',').map.with_index do |item, index|
          {title: item, id: index}
        end
      else
        bundle.metafield = []
      end
    end

    @bundle = @bundles.select do |bundle|
      bundle.id.to_i == params[:id].to_i
    end
    # Gotta get it out of the array
    @bundle = @bundle[0]

    # Rails.logger.debug("My res: #{@bundle.inspect}")
  end

  def update
    metafield = ShopifyAPI::Metafield.find(:first, :params=>{:resource => "products", :resource_id => params[:id], :namespace => "bundle", :key => "items"})

    #  Delete the metafield, it is not needed if there are no associated products.
    if params[:metafield] == ''
      metafield.destroy
    else
      metafield.update_attributes(:value => params[:metafield])
    end

    redirect_to(root_path)
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

    redirect_to(root_path)
  end
end
