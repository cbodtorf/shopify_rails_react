class HomeController < ShopifyApp::AuthenticatedController
  include Haltable

  def index
    @products = ShopifyAPI::Product.find(:all, params: { limit: 10 })
    @rates = shop.rates.order(:name)
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
    shop.update_attributes(
      shipping_carrier_id: nil,
      currency: nil,
      money_format: nil
    )
  end

  def ensure_shipping_carrier_created
    return if shop.shipping_carrier_created?
    CreateShippingCarrierJob.perform_later(shop_domain: shop.shopify_domain)
    onboarding!
  end

  def ensure_shop_updated
    return if shop.has_details?
    ShopUpdateJob.perform_later(shop_domain: shop.shopify_domain)
    onboarding!
  end

  def handle_onboarding_if_required
    return unless onboarding?
    render('onboarding')
    halt
  end

  def handle_unsuccessful_onboarding
    return unless shop.shipping_carrier_error?
    render('error')
    halt
  end

  def handle_successful_onboarding
    render('home')
    halt
  end

  def onboarding!
    @onboarding = true
  end

  def onboarding?
    @onboarding
  end

end
