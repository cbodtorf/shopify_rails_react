class RepurposeCookTimeForReceiveWindow < ActiveRecord::Migration[5.0]
  def change
    rename_column :rates, :cook_time, :receive_window
  end
end
