Rails.application.routes.draw do
  mount ShopifyApp::Engine, at: '/'
  root :to => 'home#index'
  get 'home', to: 'home#home'
  get 'retry', to: 'home#retry'
  get 'error', to: 'home#error'
  get 'onboarding', to: 'home#onboarding'

  get 'dashboard', to: 'dashboard#index'

  resources :bundle, only: [:index, :update, :create]
  resources :rates, only: [:index, :update]


  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
