class CreateShippingAddress < ActiveRecord::Migration[5.0]
  def change
    create_table :shipping_addresses do |t|
      t.references :order_note, index: true, foreign_key: true

      t.string :first_name
      t.text :address1
      t.text :phone
      t.text :city
      t.text :zip
      t.text :province
      t.string :country
      t.text :last_name
      t.text :address2
      t.text :company
      t.decimal :latitude, precision: 10, scale: 6
      t.decimal :longitude, precision: 10, scale: 6
      t.text :name
      t.string :country_code
      t.string :province_code

      t.timestamps null: false
    end
  end
end
