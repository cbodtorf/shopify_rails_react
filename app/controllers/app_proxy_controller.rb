class AppProxyController < ApplicationController
  include ShopifyApp::AppProxyVerification
  def index
    # render :layout => false, :content_type => 'application/liquid'

    @customer = CheckoutsUpdateJob.getCustomer() || {}

    render :json => {"shop": "shop"}
    Rails.logger.debug("sup sup proxy #{@customer.inspect}")
  end
end
