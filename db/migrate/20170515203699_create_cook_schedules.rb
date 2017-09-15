class CreateCookSchedules < ActiveRecord::Migration[5.0]
  def change
    create_table :cook_schedules do |t|
      t.references :shop, index: true, foreign_key: true
      t.text :title
      t.integer :cook_time, null: false

      t.timestamps null: false
    end
  end
end
