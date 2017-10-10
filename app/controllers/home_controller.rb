class HomeController < ShopifyApp::AuthenticatedController
  include Haltable

  def index
    Rails.logger.debug("shop index: #{Shop.all.inspect}")
    @shop = Shop.find_by(shopify_domain: params[:shop])

    haltable do
      handle_unsuccessful_onboarding
      ensure_shipping_carrier_created
      ensure_shop_updated
      handle_onboarding_if_required
      handle_successful_onboarding
    end
  end

  def retry
    haltable do
      undo_onboarding
      redirect_to_home
    end
  end

  private

  def redirect_to_home
    redirect_to(root_path)
  end

  def undo_onboarding
    Rails.logger.debug("undo_onboarding")
    @shop.update_attributes(
      shipping_carrier_id: nil,
      currency: nil,
      money_format: nil
    )
  end

  def ensure_shipping_carrier_created
    Rails.logger.debug("ensure_shipping_carrier_created")
    return if @shop.shipping_carrier_created?
    CreateShippingCarrierJob.perform_later(shop_domain: shop.shopify_domain)
    onboarding!
  end

  def ensure_shop_updated
    Rails.logger.debug("ensure_shop_updated")
    return if @shop.has_details?
    ShopUpdateJob.perform_later(shop_domain: shop.shopify_domain)
    onboarding!
  end

  def handle_onboarding_if_required
    Rails.logger.debug("handle_onboarding_if_required")
    return unless onboarding?
    render('onboarding')
    halt
    redirect_to(dashboard_path)
  end

  def handle_unsuccessful_onboarding
    Rails.logger.debug("handle_unsuccessful_onboarding")
    return unless @shop.shipping_carrier_error?
    render('error')
    halt
  end

  def handle_successful_onboarding
    Rails.logger.debug("handle_successful_onboarding")
    redirect_to(dashboard_path)
    halt
  end

  def onboarding!
    Rails.logger.debug("onboarding")
    @onboarding = true
  end

  def onboarding?
    Rails.logger.debug("onboarding")
    @onboarding
  end

end
