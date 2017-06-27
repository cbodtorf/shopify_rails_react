class CreatePickupLocations < ActiveRecord::Migration[5.0]
  def change
    create_table :pickup_locations do |t|
      t.references :shop, index: true, foreign_key: true
      t.string :title
      t.text :address
      t.string :days_available, array: true, default: []

      t.timestamps null: false
    end
  end
end
