# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
10.times {Rate.create!(name: "Rate", description: "free shipping.", price: 100, shop_id: 1)}

Bundle.create!([
  {name: "The Beginner - 3 Day Cleanse", description: "Good for the soul", price: 500, shop_id: 1, juice_ids: ['1','2','3','4','5','6','7']},
  {name: "The Organ Cleanse - 1 Day Cleanse", description: "Good for the soul", price: 500, shop_id: 1, juice_ids: ['8','2','9','10','6','11']},
  {name: "The Feel Better", description: "Good for the soul", price: 500, shop_id: 1, juice_ids: ['12','3','13','4']},
  {name: "Energy", description: "Good for the soul", price: 500, shop_id: 1, juice_ids: ['14','15','13','12']}
  ])
