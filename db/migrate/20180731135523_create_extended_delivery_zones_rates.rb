class CreateExtendedDeliveryZonesRates < ActiveRecord::Migration[5.0]
  def change
    create_table :extended_delivery_zones_rates, :id => false do |t|
      t.integer :extended_delivery_zone_id
      t.integer :rate_id
    end
  end
end
