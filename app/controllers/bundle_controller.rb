class BundleController < ShopifyApp::AuthenticatedController

  def index
    # TODO: Need to have conditional if product is not a bundle right now is handled on Client

    @collection = ShopifyAPI::SmartCollection.find(:first, params: { handle: 'bundle' })
    products = ShopifyAPI::Product.find(:all, params: { collection_id: @collection.attributes[:id], fields: 'id,title,image,product_type,tags' })

    # remove bundles, cleanses, subscriptions for a list of bundle worthy products
    @products = ShopifyAPI::Product.find(:all, params: { limit: 250, fields: 'id,title,image,product_type,tags' }).select do |product|
      !product.attributes[:title].downcase.include?("auto") ?
        !product.attributes[:tags].downcase.include?("bundle") :
        false
    end

    # bundles are designated by 'bundle' tag
    @bundles = products.select do |product|
      product.attributes[:tags].include?("bundle")
    end

    @bundles.each do |bundle|
      bundle.metafield = ShopifyAPI::Metafield.find(:first ,:params=>{:resource => "products", :resource_id => bundle.id, :namespace => "bundle", :key => "items"})
      if bundle.metafield != nil
        bundle.metafield = bundle.metafield.value.split(',').map.with_index do |item, index|
          item = item.split(' x')
          {title: item.first, quantity: item.last.to_i, id: index}
        end
      else
        bundle.metafield = []
      end
    end

    # If id select bundle else show welcome
    if params[:id]
      @bundle = @bundles.select do |bundle|
        bundle.id.to_i == params[:id].to_i
      end.first
    else
      @bundle = nil
    end

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

    redirect_to action: :index
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

    redirect_to action: :index
  end
end
