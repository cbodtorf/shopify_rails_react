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


  Bundle.create!({id: 13, name: "The Beginner - 3 Day Cleanse", description: "Good for the soul", price: 500, shop_id: 1})
  Bundle.create!({id: 14, name: "The Organ Cleanse - 1 Day Cleanse", description: "Good for the soul", price: 500, shop_id: 1})
  Bundle.create!({id: 15, name: "The Feel Better", description: "Good for the soul", price: 500, shop_id: 1})
  Bundle.create!({id: 16, name: "Energy", description: "Good for the soul", price: 500, shop_id: 1})


  Juice.create!(name: 'Coconut Almond Milk', bundle_id: 13)
  Juice.create!(name: 'Spinach Apple', bundle_id: 13)
  Juice.create!(name: 'Lemon Ginger', bundle_id: 13)
  Juice.create!(name: 'Beet Cucumber', bundle_id: 13)
  Juice.create!(name: 'Cinnamon Yam', bundle_id: 14)
  Juice.create!(name: 'Carrot Coconut', bundle_id: 14)
  Juice.create!(name: 'Sweet Celery', bundle_id: 14)
  Juice.create!(name: 'Psyllium Husk Apple', bundle_id: 15)
  Juice.create!(name: 'Seasonal Greens', bundle_id: 15)
  Juice.create!(name: 'Spiced Yam', bundle_id: 15)
  Juice.create!(name: 'Vanilla Mint Almond Milk', bundle_id: 15)
  Juice.create!(name: 'Feel Better Elixir', bundle_id: 14)
  Juice.create!(name: 'Dandelion', bundle_id: 16)
  Juice.create!(name: 'Deep Chocolate', bundle_id: 16)
  Juice.create!(name: 'Coffee Almond', bundle_id: 16)
