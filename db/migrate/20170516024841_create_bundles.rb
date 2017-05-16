class CreateBundles < ActiveRecord::Migration[5.0]
  def change
    create_table :bundles do |t|
      t.references :shop, index: true, foreign_key: true
      t.string :name
      t.text :description
      t.integer :price

      t.timestamps null: false
    end

  end
end
