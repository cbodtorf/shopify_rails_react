class CreateShops < ActiveRecord::Migration[5.0]
  def change
    create_table :shops do |t|
      t.string :shopify_domain, null: false
      t.string :shopify_token, null: false
      t.integer :shipping_carrier_id
      t.string :money_format
      t.string :currency
      t.string :locale, default: "en"

      t.timestamps null: false
    end

    add_index :shops, :shopify_domain, unique: true
  end
end
