class CreateRates < ActiveRecord::Migration[5.0]
  def change
    create_table :rates do |t|
      t.references :shop, index: true, foreign_key: true

      t.string :title
      t.text :description
      t.string :delivery_method
      t.integer :price
      t.integer :cutoff_time
      t.string :cook_time
      t.string :delivery_type
      t.integer  "min_grams"
      t.integer  "max_grams"
      t.integer  "min_price"
      t.integer  "max_price"
      t.float    "price_weight_modifier",         default: 0.0, null: false
      t.string   "code"
      t.text     "notes"
      t.integer  "price_weight_modifier_starter", default: 0,   null: false

      t.timestamps null: false
    end
  end
end
