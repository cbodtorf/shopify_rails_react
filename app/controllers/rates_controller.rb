class RatesController < ShopifyApp::AuthenticatedController
  def index
    respond_with Rate.all
  end

  def show
  respond_with Rate.find(params[:id])
  end

  def create
    respond_with :api, :v1, Rate.create(rate_params)
  end

  def destroy
    respond_with Rate.destroy(params[:id])
  end

  def update
    rate = Rate.find(params["id"])
    rate.update_attributes(rate_params)
    respond_with rate, json: rate
  end

  private

  def rate_params
    params.require(:rate).permit(:id, :name, :description, :price)
  end
end
