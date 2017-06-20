class CreateOrderNotes < ActiveRecord::Migration[5.0]
  def change
    create_table :order_notes do |t|

      t.string :checkout_token, null: false
      t.string :cart_token, null: false
      t.string :rate_id, null: false
      t.string :checkout_method, null: false
      t.string :postal_code, null: false
      t.datetime :delivery_date, null: false
    end
  end
end
