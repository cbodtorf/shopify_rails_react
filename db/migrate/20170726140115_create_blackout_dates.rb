class CreateBlackoutDates < ActiveRecord::Migration[5.0]
  def change
    create_table :blackout_dates do |t|
      t.references :shop, index: true, foreign_key: true
      t.text :title
      t.datetime :blackout_date, null: false

      t.timestamps null: false
    end
  end
end
