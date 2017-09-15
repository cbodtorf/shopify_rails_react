class CreateCookDaysRates < ActiveRecord::Migration[5.0]
  def change
    create_table :cook_days_rates, :id => false do |t|
      t.integer :cook_day_id
      t.integer :rate_id
    end
  end
end
