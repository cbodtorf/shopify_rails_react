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
  post 'app_proxy', to: 'app_proxy#index'
  put 'app_proxy', to: 'app_proxy#index'

  get 'home', to: 'home#home'
  get 'retry', to: 'home#retry'

  get 'error', to: 'home#error'
  get 'onboarding', to: 'home#onboarding'

  get 'dashboard', to: 'dashboard#index'
  get 'generateCSV', to: 'dashboard#generateCSV'
  get 'showOrders', to: 'dashboard#showOrders'

  get 'settings', to: 'settings#index'
  post 'create_pickup_location', to: 'settings#create_pickup_location'
  delete 'destroy_pickup_location', to: 'settings#destroy_pickup_location'

  resources :bundle, only: [:index, :update, :create]
  resources :rates, only: [:index, :update, :create, :destroy]


  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
