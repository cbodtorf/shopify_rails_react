class HomeController < ShopifyApp::AuthenticatedController
  include Haltable

  def index
    @products = ShopifyAPI::Product.find(:all, params: { limit: 10 })
    @juices = [
      {name: 'Coconut Almond Milk', id: 1},
      {name: 'Spinach Apple', id: 2},
      {name: 'Lemon Ginger', id: 3},
      {name: 'Beet Cucumber', id: 4},
      {name: 'Cinnamon Yam', id: 5},
      {name: 'Carrot Coconut', id: 6},
      {name: 'Sweet Celery', id: 7},
      {name: 'Psyllium Husk Apple', id: 8},
      {name: 'Seasonal Greens', id: 9},
      {name: 'Spiced Yam', id: 10},
      {name: 'Vanilla Mint Almond Milk', id: 11},
      {name: 'Feel Better Elixir', id: 12},
      {name: 'Dandelion', id: 13},
      {name: 'Deep Chocolate', id: 14},
      {name: 'Coffee Almond', id: 15}
    ]
    @rates = shop.rates.order(:name)
    @bundles = shop.bundles.order(:name)

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
    render('home')
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
