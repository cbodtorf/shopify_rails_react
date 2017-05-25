class RatesController < ShopifyApp::AuthenticatedController
  def index
    @rates = shop.rates.includes(:conditions, :product_specific_prices).order(:name)

    # TODO: need to make sure this works with complicated condition scenarios
    # @conditions = []
    # @rates.each do |rate|
    #   Rails.logger.debug("My res: #{rate.conditions.inspect}")
    #   if rate.conditions.present?
    #     @conditions.concat(rate.conditions.each {|c| c})
    #   end
    # end
    # Rails.logger.debug("My conditions: #{@conditions}")

    if params[:id]
      @rate = shop.rates.find(params[:id])
    else
      @rate = {}
    end
  end

  def new
    # TODO: need to figure out how new rates work!
    @rate = shop.rates.build
  end

  def update
    rate = shop.rates.find(params[:id])
    rate.update_attributes(rate_params)
    redirect_to action: 'index', id: params[:id]
  end

  def destroy
    rate = shop.rates.find(params[:id])

    if rate.destroy
      redirect_to action: 'index'
    else
      redirect_to action: 'index', id: rate.id
    end
  end

  def create
    @rate = shop.rates.build(rate_params)

    if @rate.save
      redirect_to action: 'index', id: @rate.id
    else
      redirect_to action: 'index'
    end
  end

  private

  def rate_params
    params.require(:rate).permit(
      :name,
      :price,
      :price_weight_modifier,
      :price_weight_modifier_starter,
      :description,
      :min_price,
      :max_price,
      :min_grams,
      :max_grams,
      :code,
      :notes,
      conditions_attributes: condition_params,
      product_specific_prices_attributes: product_specific_price_params
    )
  end

  def condition_params
    [:id, :field, :verb, :value, :all_items_must_match, :_destroy]
  end

  def product_specific_price_params
    [:id, :field, :verb, :value, :price, :_destroy]
  end
end
