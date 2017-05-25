# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
  Rate.create!(name: "Same Day", description: "Order before 3pm EST", price: 100, shop_id: 1)
  Rate.create!(name: "Next Day", description: "free shipping.", price: 100, shop_id: 1)
  Rate.create!(name: "Next Morning Early", description: "Delivered before 9am", price: 1500, shop_id: 1)
  Rate.create!(name: "In Store Pickup", description: "Free to Pickup.", price: 100, shop_id: 1)

  # Need to figure out the rate ids
  # Condition.create!(rate_id: 1, field: "postal_code", verb: "equal", value: "30076")
  # Condition.create!(rate_id: 2, field: "postal_code", verb: "equal", value: "30076")
  # Condition.create!(rate_id: 3, field: "postal_code", verb: "equal", value: "30076")
