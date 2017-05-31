class AppProxyController < ApplicationController
  include ShopifyApp::AppProxyVerification
  # I'm able to clear cache using POSTMAN, but I'm getting redirected when I save the rate here. Need to figure that out.
  # TODO: update order notes

  def index
    shop = Shop.find_by(shopify_domain: params[:shop])
    shop = ShopifyApp::SessionRepository.retrieve(shop.id)
    Rails.logger.debug("[Shop] #{shop}")
    ShopifyAPI::Base.activate_session(shop)
    # shop.with_shopify_session do

      #need to get checkout token

      @checkout = ShopifyAPI::Checkout.find('c916cb35b4076796ae07692405f0277d')
      Rails.logger.debug("[Checkout] #{@checkout.attributes[:shipping_address].attributes.inspect}")
      if @checkout.attributes[:shipping_address].attributes[:company] == nil
        @checkout.attributes[:shipping_address].attributes[:company] = ' '
      else
          @checkout.attributes[:shipping_address].attributes[:company] = @checkout.attributes[:shipping_address].attributes[:company] + ' '
      end
      # @checkout.save

      if @checkout.update_attributes(@checkout.attributes)
        Rails.logger.debug("[Checkout save-success] #{@checkout.inspect}")
      else
        Rails.logger.debug("[Checkout save-error] #{@checkout.inspect}")
      end


      # product variant weight and grams don't seem to have any effect
      # Rails.logger.debug("[Cart] #{params[:cart].inspect}")
      # @product = ShopifyAPI::Variant.find(:first, params: {id: params[:cart][:items]["0"][:variant_id]})
      #
      # if ((@product.weight >= 0) and (@product.weight < 1.0))
      #   @product.weight = @product.weight + 1.0
      # elsif ((@product.weight > 0) and (@product.weight <= 1.0))
      #   @product.weight = @product.weight - 0.9
      # else
      #   @product.weight = @product.weight + 1.0
      # end
      #
      # if @product.save
      #   Rails.logger.debug("[Product save-success] #{@product.inspect}")
      # else
      #   Rails.logger.debug("[Product save-error] #{@product.inspect}")
      # end
      render :json => {"checkout": @checkout}
      Rails.logger.debug("[Cart Token] #{params[:cartToken].inspect}")
    # end

  end

end
