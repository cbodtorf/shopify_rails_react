class CreateConditions < ActiveRecord::Migration[5.0]
  def change
    create_table :conditions do |t|
      t.references :rate, index: true, foreign_key: true

      t.string :field, null: false
      t.string :verb, null: false
      t.text :value, null: false
      t.boolean  "all_items_must_match", default: true

      t.timestamps null: false
    end
  end
end
