class BundleController < ShopifyApp::AuthenticatedController
  respond_to :json
  skip_before_filter :verify_authenticity_token

  before_filter :cors_preflight_check
  after_filter :cors_set_access_control_headers

  def cors_set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, Token'
    headers['Access-Control-Max-Age'] = "1728000"
  end

  def cors_preflight_check
    if request.method == 'OPTIONS'
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
      headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-Prototype-Version, Token'
      headers['Access-Control-Max-Age'] = '1728000'

      render :text => '', :content_type => 'text/plain'
    end
  end

  def index

    # TODO: Need to have conditional if product is not a bundle

    @products = ShopifyAPI::Product.find(:all, params: { limit: 50 })
    @bundle = ShopifyAPI::Product.find(params[:id])
    Rails.logger.debug("Index My bundle: #{@bundle.inspect}")

    @bundle.metafields = ShopifyAPI::Metafield.find(:first ,:params=>{:resource => "products", :resource_id => @bundle.id, :namespace => "bundle", :key => "items"})
  end

  def update
    puts 'what the heck'
    bundle = ShopifyAPI::Metafield.find(:first ,:params=>{:resource => "products", :resource_id => params[:id], :namespace => "bundle", :key => "items"})
    # bundle.metafields = params.metafields
    # bundle.save
    Rails.logger.debug("My params: #{params.inspect}")
    Rails.logger.debug("My bundle: #{bundle.inspect}")
    redirect_to(root_path)

  end
end
