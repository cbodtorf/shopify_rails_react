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


  Bundle.create!({id: 13, name: "The Beginner - 3 Day Cleanse", description: "Good for the soul", price: 500, shop_id: 1, product_ids: ["6839188037", "7005287237", "7005280389", "7005268101"]})
  Bundle.create!({id: 14, name: "The Organ Cleanse - 1 Day Cleanse", description: "Good for the soul", price: 500, shop_id: 1, product_ids: ["7005268101", "7005319557", "7005273285"]})
  Bundle.create!({id: 15, name: "The Feel Better", description: "Good for the soul", price: 500, shop_id: 1, product_ids: ["7005319557", "6839183621"]})
  Bundle.create!({id: 16, name: "Energy", description: "Good for the soul", price: 500, shop_id: 1, product_ids: ["7005273285", "7005294853"]})
