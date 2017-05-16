class CreateJuices < ActiveRecord::Migration[5.0]
  def change
    create_table :juices do |t|
      t.string :name
      t.references :bundle, index: true, foreign_key: true

      t.timestamps
    end
  end
end
