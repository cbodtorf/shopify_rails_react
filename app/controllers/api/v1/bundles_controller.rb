#bundles_controller.rb
class Api::V1::BundlesController < Api::V1::BaseController

  def index
    respond_with Bundle.all
  end

  def show
  respond_with Bundle.find(params[:id])
  end

  def create
    # respond_with :api, :v1, Bundle.create(bundle_params)
    Rails.logger.debug("My bundle: #{bundle_params.inspect}")
  end

  def destroy
    respond_with Bundle.destroy(params[:id])
  end

  def update
    bundle = ShopifyAPI::Metafield.find(:first ,:params=>{:resource => "products", :resource_id => params[:id], :namespace => "bundle", :key => "items"})
    # bundle.
    # bundle.save
      # Rails.logger.debug("My bundle: #{bundle.inspect}")
      Rails.logger.debug("My params: #{ShopifyAPI::Metafield.inspect}")
  end

  private

  def bundle_params
    # params.require(:bundle).permit(:id, :name, :description, :price)
    params
  end
end
