class CreateCookDay < ActiveRecord::Migration[5.0]
  def change
    create_table :cook_days do |t|
      t.references :cook_schedule, index: true, foreign_key: true
      t.text :title, null: false
    end
  end
end
