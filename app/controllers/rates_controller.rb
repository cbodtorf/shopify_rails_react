class RatesController < ShopifyApp::AuthenticatedController
  def index
    @rates = shop.rates.includes(:conditions, :product_specific_prices).order(:name)
    @rate = shop.rates.find(params[:id])
  end

  def new
    @rate = shop.rates.build
  end

  def update
    rate = shop.rates.find(params[:id])
  end

  def destroy
    rate = shop.rates.find(params[:id])
  end

  def create
    @rate = shop.rates.build(rate_params)

    # if @rate.save
    #   redirect_to(rates_path)
    # else
    #   render('new')
    # end
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
