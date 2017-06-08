class HomeController < ShopifyApp::AuthenticatedController
  include Haltable

  def index
    Rails.logger.debug("shop index: #{Shop.all}")
    @rates = shop.rates.order(:title)
    @bundles = ShopifyAPI::Product.find(:all, params: { product_type: 'bundle' })


    @bundles.each do |bundle|
      bundle.metafields = ShopifyAPI::Metafield.find(:first ,:params=>{:resource => "products", :resource_id => bundle.id, :namespace => "bundle", :key => "items"})
    end

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
    shop.update_attributes(
      shipping_carrier_id: nil,
      currency: nil,
      money_format: nil
    )
  end

  def ensure_shipping_carrier_created
    Rails.logger.debug("ensure_shipping_carrier_created")
    return if shop.shipping_carrier_created?
    CreateShippingCarrierJob.perform_later(shop_domain: shop.shopify_domain)
    onboarding!
  end

  def ensure_shop_updated
    Rails.logger.debug("ensure_shop_updated")
    return if shop.has_details?
    ShopUpdateJob.perform_later(shop_domain: shop.shopify_domain)
    onboarding!
  end

  def handle_onboarding_if_required
    Rails.logger.debug("handle_onboarding_if_required")
    return unless onboarding?
    render('onboarding')
    halt
    render('home')
  end

  def handle_unsuccessful_onboarding
    Rails.logger.debug("handle_unsuccessful_onboarding")
    return unless shop.shipping_carrier_error?
    render('error')
    halt
  end

  def handle_successful_onboarding
    Rails.logger.debug("handle_successful_onboarding")
    render('home')
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
