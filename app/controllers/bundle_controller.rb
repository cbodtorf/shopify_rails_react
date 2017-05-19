class BundleController < ShopifyApp::AuthenticatedController

  def index
    # TODO: Need to have conditional if product is not a bundle
    @products = ShopifyAPI::Product.find(:all, params: { limit: 50 })
    @bundle = ShopifyAPI::Product.find(params[:id])
    @bundle.metafields = ShopifyAPI::Metafield.find(:first ,:params=>{:resource => "products", :resource_id => @bundle.id, :namespace => "bundle", :key => "items"})
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
