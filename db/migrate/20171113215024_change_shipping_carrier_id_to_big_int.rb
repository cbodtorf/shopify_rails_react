class ChangeShippingCarrierIdToBigInt < ActiveRecord::Migration[5.0]
  def change
    change_column :shops, :shipping_carrier_id, :integer, limit: 8
  end
end
