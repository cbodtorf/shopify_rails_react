class ShopUpdateJob < ApplicationJob
  def perform(shop_domain:, webhook: nil)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do
      shopify_shop = ShopifyAPI::Shop.current

      shop.assign_attributes(
        currency: shopify_shop.currency,
        money_format: shopify_shop.money_in_emails_format,
        locale: shopify_shop.primary_locale,
      )

      shop.save!
    end
  rescue ActiveResource::ResourceNotFound, ActiveResource::ClientError
    Rails.logger.warn("[#{self.class.name}] Shop not found shop_id=#{shop.id} shop_domain=#{shop_domain}")
  end
end
