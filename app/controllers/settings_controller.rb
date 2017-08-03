class SettingsController < ShopifyApp::AuthenticatedController

  def blackout_dates
    # TODO: handle if there are no dates
    @blackout_dates = shop.blackout_dates.all
  end

  def pickup_locations
    # TODO: handle if there are no locations
    @pickup_locations = shop.pickup_locations.all
  end

  def postal_codes
    # TODO: handle if there are no postal_codes
    @postal_codes = shop.postal_codes.all
  end

  def create_postal_code
    Rails.logger.debug("My code params: #{postal_code_params.inspect}")
    postal_code_params[:title].split(',').uniq.each do |code|
      Rails.logger.debug("My loc params: #{code.inspect}")
        postal_code = shop.postal_codes.build({:title => code.strip})
      if postal_code.save
        # Success
      else
        Rails.logger.debug("hmmm #{postal_code.errors.full_messages}")
        redirect_to action: 'postal_codes'
      end
    end

    redirect_to action: 'postal_codes'
  end

  def create_pickup_location
    Rails.logger.debug("My loc params: #{location_params.inspect}")
    @pickup_location = shop.pickup_locations.build(location_params)

    if @pickup_location.save
      redirect_to action: 'pickup_locations'
    else
      Rails.logger.debug("hmmm #{@pickup_location.errors.full_messages}")
      redirect_to action: 'pickup_locations'
    end
  end

  def create_blackout_date
    Rails.logger.debug("My loc params: #{blackout_date_params.inspect}")
    @blackout_date = shop.blackout_dates.build(blackout_date_params)

    if @blackout_date.save
      redirect_to action: 'blackout_dates'
    else
      Rails.logger.debug("hmmm #{@blackout_date.errors.full_messages}")
      redirect_to action: 'blackout_dates'
    end
  end

  def update

    redirect_to(root_path)
  end

  def destroy_pickup_location
    # TODO: there is an issue where sometimes Can't verify CSRF token authenticity.
    pickup_location = shop.pickup_locations.find(params[:id])

    if pickup_location.destroy
      redirect_to action: 'pickup_locations'
    else
      Rails.logger.debug("hmmm #{pickup_location.errors.full_messages}")
      redirect_to action: 'pickup_locations'
    end
  end

  def destroy_blackout_date
    # TODO: there is an issue where sometimes Can't verify CSRF token authenticity.
    blackout_date = shop.blackout_dates.find(params[:id])

    if blackout_date.destroy
      redirect_to action: 'blackout_dates'
    else
      Rails.logger.debug("hmmm #{blackout_date.errors.full_messages}")
      redirect_to action: 'blackout_dates'
    end
  end

  def destroy_postal_code
    # TODO: there is an issue where sometimes Can't verify CSRF token authenticity.
    postal_code = shop.postal_codes.find(params[:id])

    if postal_code.destroy
      redirect_to action: 'postal_codes'
    else
      Rails.logger.debug("hmmm #{postal_code.errors.full_messages}")
      redirect_to action: 'postal_codes'
    end
  end

  def location_params
    params.require(:pickup_location).permit(
      :title,
      :address,
      :days_available => [],
    )
  end

  def blackout_date_params
    params.require(:blackout_date).permit(
      :title,
      :blackout_date,
    )
  end

  def postal_code_params
    params.require(:postal_code).permit(
      :title,
    )
  end
end
