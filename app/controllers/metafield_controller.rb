class MetafieldController < ShopifyApp::AuthenticatedController

  def index
    # remove subscriptions for a list of products non-subscription-items
    collection = ShopifyAPI::SmartCollection.find(:first, params: { handle: 'non-subscription-items', fields: 'id,handle' })
    @products = ShopifyAPI::Product.find(:all, params: { collection_id: collection.attributes[:id], limit: 250, fields: 'id,title,image,product_type,tags' })

    @products.select!{|p| p.attributes[:product_type] != "cleanse" && p.attributes[:product_type] != "juice kits"}.each do |product|
      product.metafield = []
    end

    # If id select bundle else show welcome
    # if params[:id]
    #   @bundle = @bundles.select do |bundle|
    #     bundle.id.to_i == params[:id].to_i
    #   end.first
    # else
    #   @bundle = nil
    # end

    # Rails.logger.debug("My res: #{@products.inspect}")
  end

  def update
    benefits_metafield = ShopifyAPI::Metafield.find(:first, :params=>{:resource => "products", :resource_id => params[:id], :namespace => "product_details", :key => "health_benefits"})
    ingredients_metafield = ShopifyAPI::Metafield.find(:first, :params=>{:resource => "products", :resource_id => params[:id], :namespace => "product_details", :key => "ingredients"})

    #  Delete the metafield, it is not needed if there are no associated products.
    if params[:metafield][:health_benefits] == ''
      benefits_metafield.destroy
    else
      benefits_metafield.update_attributes(:value => params[:metafield][:health_benefits])
    end

    if params[:metafield][:ingredients] == ''
      ingredients_metafield.destroy
    else
      ingredients_metafield.update_attributes(:value => params[:metafield][:ingredients])
    end

    redirect_to action: :index
  end

  def create
    # add/save metafield
    product = ShopifyAPI::Product.find(params[:id])
    # tags = product.attributes[:tags].split(', ').select{|t| !t.match(/^\d benefits$|^\d ingredients$/)}

    if params[:metafield][:health_benefits] != ''
      product.add_metafield(ShopifyAPI::Metafield.new({
         :namespace => 'product_details',
         :key => 'health_benefits',
         :value => params[:metafield][:health_benefits],
         :value_type => 'string'
      }))
    end

    if params[:metafield][:ingredients] != ''
      product.add_metafield(ShopifyAPI::Metafield.new({
         :namespace => 'product_details',
         :key => 'ingredients',
         :value => params[:metafield][:ingredients],
         :value_type => 'string'
      }))
    end

    redirect_to action: :index
  end

  def get_product_metafield
    product = ShopifyAPI::Product.find(params[:id], params: { fields: 'id,title,image' })
    product.metafield = {}
    health_benefits = nil
    ingredients = nil

    product.metafields.each do |meta|
      if meta.attributes[:namespace] == "product_details"
        if meta.attributes[:key] == "health_benefits"
          health_benefits = meta.attributes[:value]
          Rails.logger.debug("My health_benefits: #{health_benefits.inspect}")
          product.metafield[:health_benefits] = health_benefits.split(',').map.with_index do |item, index|
            {title: item, id: index}
          end
        elsif meta.attributes[:key] == "ingredients"
          ingredients = meta.attributes[:value]
          Rails.logger.debug("My ingredients: #{ingredients.inspect}")
          product.metafield[:ingredients] = ingredients.split(',').map.with_index do |item, index|
            {title: item, id: index}
          end
        end
      end
    end

    render json: {product: product} , status: 200
  end

  def metafield_product_bundle
    # Redirect to index or bundle depending on product
    product = ShopifyAPI::Product.find(params[:id], params: { fields: 'id,product_type' })

    if product.attributes[:product_type] == "bundle" || product.attributes[:product_type] == "juice kits" || product.attributes[:product_type] == "cleanse"
      redirect_to :controller => 'bundle', :action => 'index'
    else
      redirect_to action: :index
    end
  end
end
