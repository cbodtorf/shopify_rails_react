class CreatePostalCodes < ActiveRecord::Migration[5.0]
  def change
    create_table :postal_codes do |t|
      t.references :shop, index: true, foreign_key: true
      t.text :title

      t.timestamps null: false
    end
  end
end
