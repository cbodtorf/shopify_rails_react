class CreateProductSpecificPrices < ActiveRecord::Migration[5.0]
  def change
    create_table :product_specific_prices do |t|
      t.belongs_to :rate, index: true, foreign_key: true

      t.string :field, null: false
      t.string :verb, null: false
      t.text :value, null: false

      t.integer :price

      t.timestamps null: false
    end
  end
end
