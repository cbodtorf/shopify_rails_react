class SettingsController < ShopifyApp::AuthenticatedController

  def index
    # TODO: handle if there are no locations
    @pickup_locations = shop.pickup_locations.all
    Rails.logger.debug("My res: #{@pickup_locations.inspect}")
  end

  def create_pickup_location
    Rails.logger.debug("My loc params: #{location_params.inspect}")
    @pickup_location = shop.pickup_locations.build(location_params)

    if @pickup_location.save
      redirect_to action: 'index'
    else
      Rails.logger.debug("hmmm #{@pickup_location.errors.full_messages}")
      redirect_to action: 'index'
    end
  end

  def update

    redirect_to(root_path)
  end

  def destroy_pickup_location
    # TODO: there is an issue where sometimes Can't verify CSRF token authenticity.
    pickup_location = shop.pickup_locations.find(params[:id])

    if pickup_location.destroy
      redirect_to action: 'index'
    else
      Rails.logger.debug("hmmm #{pickup_location.errors.full_messages}")
      redirect_to action: 'index'
    end
  end

  def location_params
    params.require(:pickup_location).permit(
      :title,
      :address,
      :days_available => [],
    )
  end
end
