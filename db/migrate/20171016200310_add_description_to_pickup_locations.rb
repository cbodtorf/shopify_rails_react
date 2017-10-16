class AddDescriptionToPickupLocations < ActiveRecord::Migration[5.0]
  def change
    add_column :pickup_locations, :description, :text
  end
end
