class MetafieldController < ShopifyApp::AuthenticatedController

  def index
    # remove subscriptions for a list of products non-subscription-items
    collection = ShopifyAPI::SmartCollection.find(:first, params: { handle: 'non-subscription-items', fields: 'id,handle' })
    @products = ShopifyAPI::Product.find(:all, params: { collection_id: collection.attributes[:id], limit: 50, fields: 'id,title,image' })

    @products.each do |product|
      product.metafield = []
      health_benefits = nil
      ingredients = nil
    end

    # If id select bundle else show welcome
    # if params[:id]
    #   @bundle = @bundles.select do |bundle|
    #     bundle.id.to_i == params[:id].to_i
    #   end.first
    # else
    #   @bundle = nil
    # end

    # Rails.logger.debug("My res: #{@bundle.inspect}")
  end

  def update
    # metafield = ShopifyAPI::Metafield.find(:first, :params=>{:resource => "products", :resource_id => params[:id], :namespace => "bundle", :key => "items"})
    #
    # #  Delete the metafield, it is not needed if there are no associated products.
    # if params[:metafield] == ''
    #   metafield.destroy
    # else
    #   metafield.update_attributes(:value => params[:metafield])
    # end
    #
    # redirect_to('/bundle')
  end

  def create
    # add/save metafield
    # product = ShopifyAPI::Product.find(params[:id])
    # product.add_metafield(ShopifyAPI::Metafield.new({
    #    :namespace => 'bundle',
    #    :key => 'items',
    #    :value => params[:metafield],
    #    :value_type => 'string'
    # }))
    #
    # redirect_to('/bundle')
  end

  def get_product_metafield
    product = ShopifyAPI::Product.find(params[:id], params: { fields: 'id,title,image' })
    product.metafield = []
    health_benefits = nil
    ingredients = nil

    product.metafields.each do |meta|
      if meta.attributes[:namespace] == "product_details"
        if meta.attributes[:key] == "health_benefits"
          health_benefits = meta.attributes[:value]
          product.metafield.health_benefits = health_benefits.value.split(',').map.with_index do |item, index|
            {title: item, id: index}
          end
        elsif meta.attributes[:key] == "ingredients"
          ingredients = meta.attributes[:value]
          product.metafield.ingredients = ingredients.value.split(',').map.with_index do |item, index|
            {title: item, id: index}
          end
        end
      end
    end

    render json: {product: product} , status: 200
  end

end
