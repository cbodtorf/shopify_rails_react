class CreateOrderNotes < ActiveRecord::Migration[5.0]
  def change
    create_table :order_notes do |t|
      t.references :shop, index: true, foreign_key: true
      
      t.string :checkout_token, null: false
      t.string :cart_token, null: false
      t.string :rate_id, null: false
      t.string :checkout_method, null: false
      t.string :postal_code
      t.datetime :delivery_date

      t.timestamps null: false
    end
  end
end
