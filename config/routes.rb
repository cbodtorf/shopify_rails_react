Rails.application.routes.draw do
  mount ShopifyApp::Engine, at: '/'
  root :to => 'home#index'
  get 'home', to: 'home#home'
  get 'retry', to: 'home#retry'
  get 'error', to: 'home#error'
  get 'onboarding', to: 'home#onboarding'

  namespace :api do
    namespace :v1 do
      resources :rates, only: [:index, :create, :destroy, :update]
      resources :bundles, only: [:index, :create, :destroy, :update]
    end
  end
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
