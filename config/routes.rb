Rails.application.routes.draw do
  mount ShopifyApp::Engine, at: '/'

  namespace :app_proxy do
    root action: 'index'
    # simple routes without a specified controller will go to AppProxyController

    # more complex routes will go to controllers in the AppProxy namespace
    # 	resources :reviews
    # GET /app_proxy/reviews will now be routed to
    # AppProxy::ReviewsController#index, for example
  end

  post 'callback/:id', to: 'callback#search'

  root :to => 'home#index'

  get 'app_proxy', to: 'app_proxy#index'
  get 'app_proxy/picker', to: 'app_proxy#picker'
  get 'app_proxy/customerPortal', to: 'app_proxy#customerPortal'
  get 'app_proxy/postal_codes', to: 'app_proxy#postal_codes'
  get 'app_proxy/delivery_pickup', to: 'app_proxy#delivery_pickup'
  post 'app_proxy', to: 'app_proxy#index'
  put 'app_proxy', to: 'app_proxy#index'

  get 'home', to: 'home#home'
  get 'retry', to: 'home#retry'

  get 'error', to: 'home#error'
  get 'onboarding', to: 'home#onboarding'

  get 'dashboard', to: 'dashboard#index'
  get 'generateCSV', to: 'dashboard#generateCSV'
  get 'showOrders', to: 'dashboard#showOrders'

  get 'subscription', to: 'subscription#index'

  get 'blackout_dates', to: 'settings#blackout_dates'
  get 'pickup_locations', to: 'settings#pickup_locations'
  get 'postal_codes', to: 'settings#postal_codes'

  post 'create_blackout_date', to: 'settings#create_blackout_date'
  patch 'update_blackout_date/:id', to: 'settings#update_blackout_date'
  delete 'destroy_blackout_date', to: 'settings#destroy_blackout_date'

  post 'create_pickup_location', to: 'settings#create_pickup_location'
  patch 'update_pickup_location/:id', to: 'settings#update_pickup_location'
  delete 'destroy_pickup_location', to: 'settings#destroy_pickup_location'

  post 'create_postal_code', to: 'settings#create_postal_code'
  delete 'destroy_postal_code', to: 'settings#destroy_postal_code'

  get 'metafield_product_bundle', to: 'metafield#metafield_product_bundle'
  resources :bundle, only: [:index, :update, :create]
  resources :metafield, only: [:index, :update, :create]
  get 'product_metafield/:id', to: 'metafield#get_product_metafield'

  resources :rates, only: [:index, :update, :create, :destroy]
  resources :orders, only: [:index, :update]
  get 'orders/redirect_to_recharge_address', to: 'orders#redirect_to_recharge_address'
  get 'bulk_fulfill', to: 'dashboard#bulk_fulfill'


  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
