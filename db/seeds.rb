# Shop.create!([
#   {shopify_domain: "bamboojuices.myshopify.com", shopify_token: "5625d1ec196ec34d35dd95876a4f76ad", money_format: "${{amount}}", currency: "USD", locale: "en"}
# ])
Rate.create!([
  {shop_id: 1, title: "Free Local Delivery", description: "free range freedom", delivery_method: "delivery", price: 0, cutoff_time: 15, cook_time: "morning", delivery_type: "next_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: nil, notes: nil, price_weight_modifier_starter: 0},
  {shop_id: 1, title: "FedEx Ground", description: "get your juice anywhere!", delivery_method: "shipping", price: 1953, cutoff_time: 15, cook_time: "afternoon", delivery_type: "next_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: nil, notes: nil, price_weight_modifier_starter: 0},
  {shop_id: 1, title: "FedEx Priority Overnight", description: "get your juice anywhere, and FAST!", delivery_method: "shipping", price: 7000, cutoff_time: 15, cook_time: "afternoon", delivery_type: "next_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: nil, notes: nil, price_weight_modifier_starter: 0},
  {shop_id: 1, title: "Same Day Delivery", description: "today junior", delivery_method: "delivery", price: 500, cutoff_time: 11, cook_time: "morning", delivery_type: "same_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: nil, notes: nil, price_weight_modifier_starter: 0},
  {shop_id: 1, title: "Store Pickup", description: "come and get it", delivery_method: "pickup", price: 0, cutoff_time: 15, cook_time: "morning", delivery_type: "next_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: nil, notes: nil, price_weight_modifier_starter: 0},
  {shop_id: 1, title: "Super Fast Delivery", description: "speedy gonzales", delivery_method: "delivery", price: 1500, cutoff_time: 15, cook_time: "afternoon", delivery_type: "next_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: nil, notes: nil, price_weight_modifier_starter: 0},
  {shop_id: 1, title: "Free Delivery for Subscribers", description: "Get that steady fix!", delivery_method: "delivery", price: 0, cutoff_time: 11, cook_time: "afternoon", delivery_type: "subscription", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: nil, notes: nil, price_weight_modifier_starter: 0}
])
