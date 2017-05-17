#bundles_controller.rb
class Api::V1::BundlesController < Api::V1::BaseController
  def index
    respond_with Bundle.all
  end

  def show
  respond_with Bundle.find(params[:id])
  end

  def create
    respond_with :api, :v1, Bundle.create(bundle_params)
  end

  def destroy
    respond_with Bundle.destroy(params[:id])
  end

  def update
    bundle = Bundle.find(params["id"])
    bundle.update_attributes(bundle_params)
    respond_with bundle, json: bundle
  end

  private

  def bundle_params
    params.require(:bundle).permit(:id, :name, :description, :price, :juice_ids)
  end
end
