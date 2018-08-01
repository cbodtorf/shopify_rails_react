class CreateExtendedDeliveryZones < ActiveRecord::Migration[5.0]
  def change
    create_table :extended_delivery_zones do |t|
      t.references :shop, index: true, foreign_key: true
      t.text :title, null: false
      t.date :date, null: false
      t.string :postal_codes, array: true, default: []
      t.boolean "enabled", default: true, null: false

      t.timestamps null: false
    end
  end
end
