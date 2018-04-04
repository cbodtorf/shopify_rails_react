PostalCode.create!([
  {shop_id: 1, title: "30002"},
  {shop_id: 1, title: "30021"},
  {shop_id: 1, title: "30030"},
  {shop_id: 1, title: "30032"},
  {shop_id: 1, title: "30033"},
  {shop_id: 1, title: "30034"},
  {shop_id: 1, title: "30067"},
  {shop_id: 1, title: "30068"},
  {shop_id: 1, title: "30079"},
  {shop_id: 1, title: "30080"},
  {shop_id: 1, title: "30213"},
  {shop_id: 1, title: "30214"},
  {shop_id: 1, title: "30215"},
  {shop_id: 1, title: "30263"},
  {shop_id: 1, title: "30264"},
  {shop_id: 1, title: "30265"},
  {shop_id: 1, title: "30268"},
  {shop_id: 1, title: "30269"},
  {shop_id: 1, title: "30270"},
  {shop_id: 1, title: "30271"},
  {shop_id: 1, title: "30277"},
  {shop_id: 1, title: "30288"},
  {shop_id: 1, title: "30290"},
  {shop_id: 1, title: "30291"},
  {shop_id: 1, title: "30303"},
  {shop_id: 1, title: "30305"},
  {shop_id: 1, title: "30306"},
  {shop_id: 1, title: "30307"},
  {shop_id: 1, title: "30308"},
  {shop_id: 1, title: "30309"},
  {shop_id: 1, title: "30310"},
  {shop_id: 1, title: "30311"},
  {shop_id: 1, title: "30312"},
  {shop_id: 1, title: "30313"},
  {shop_id: 1, title: "30314"},
  {shop_id: 1, title: "30315"},
  {shop_id: 1, title: "30316"},
  {shop_id: 1, title: "30317"},
  {shop_id: 1, title: "30318"},
  {shop_id: 1, title: "30319"},
  {shop_id: 1, title: "30322"},
  {shop_id: 1, title: "30324"},
  {shop_id: 1, title: "30326"},
  {shop_id: 1, title: "30327"},
  {shop_id: 1, title: "30328"},
  {shop_id: 1, title: "30329"},
  {shop_id: 1, title: "30334"},
  {shop_id: 1, title: "30337"},
  {shop_id: 1, title: "30338"},
  {shop_id: 1, title: "30339"},
  {shop_id: 1, title: "30341"},
  {shop_id: 1, title: "30342"},
  {shop_id: 1, title: "30344"},
  {shop_id: 1, title: "30345"},
  {shop_id: 1, title: "30346"},
  {shop_id: 1, title: "30349"},
  {shop_id: 1, title: "30354"},
  {shop_id: 1, title: "30360"},
  {shop_id: 1, title: "30361"},
  {shop_id: 1, title: "30363"},
  {shop_id: 1, title: "30369"},
  {shop_id: 1, title: "31169"}
])
PickupLocation.create!([
  {id: 1, shop_id: 1, title: "Bamboo Juices", address: "502 Toombs St.", description: "Pickup Time: 2pm to 4pm", days_available: ["2", "3", "4"]}
])
BlackoutDate.create!([
  {id: 1, shop_id: 1, title: "Christmas", blackout_date: "2017-12-25 00:00:00"},
  {id: 2, shop_id: 1, title: "Labor Day", blackout_date: "2017-09-04 00:00:00"},
  {id: 3, shop_id: 1, title: "Work Retreat", blackout_date: "2017-07-31 00:00:00"}
])
CookSchedule.create!([
  {id: 1, shop_id: 1, title: "Morning Cook", cook_time: 11},
  {id: 2, shop_id: 1, title: "Afternoon Cook", cook_time: 15}
])
Rate.create!([
  {id: 1, shop_id: 1, title: "Free Local Delivery", description: "Delivered 10am - 4pm.", delivery_method: "delivery", price: 0, cutoff_time: 15, receive_window: "10am - 4pm", delivery_type: "next_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: nil, notes: nil, price_weight_modifier_starter: 0},
  {id: 2, shop_id: 1, title: "Same Day Delivery", description: "Delivered 4pm - 8pm.", delivery_method: "delivery", price: 500, cutoff_time: 11, receive_window: "4pm - 8pm", delivery_type: "same_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: nil, notes: nil, price_weight_modifier_starter: 0},
  {id: 3, shop_id: 1, title: "Store Pickup", description: "Pickup availability only during store hours.", delivery_method: "pickup", price: 0, cutoff_time: 15, receive_window: "N/A", delivery_type: "next_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: nil, notes: nil, price_weight_modifier_starter: 0},
  {id: 4, shop_id: 1, title: "Super Fast Delivery", description: "Delivered before 9am.", delivery_method: "delivery", price: 1500, cutoff_time: 15, receive_window: "before 9am", delivery_type: "next_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: nil, notes: nil, price_weight_modifier_starter: 0},
  {id: 5, shop_id: 1, title: "Free Delivery for Subscribers", description: "Next Day Delivered 10am - 4pm", delivery_method: "delivery", price: 0, cutoff_time: 15, receive_window: "10am - 4pm", delivery_type: "next_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: "subscription", notes: "show after blackout", price_weight_modifier_starter: 0},
  {id: 6, shop_id: 1, title: "Shipping", description: "Packed in an insulated box with dry ice.", delivery_method: "shipping", price: 0, cutoff_time: 15, receive_window: "N/A", delivery_type: "next_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: nil, notes: nil, price_weight_modifier_starter: 0},
  {id: 7, shop_id: 1, title: "Free Local Delivery", description: "Delivered 4 - 8pm.", delivery_method: "delivery", price: 0, cutoff_time: 15, receive_window: "4pm - 8pm", delivery_type: "next_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: nil, notes: "only offer after day with no cooks", price_weight_modifier_starter: 0},
  {id: 8, shop_id: 1, title: "Same Day Delivery", description: "Delivered 4 - 8pm.", delivery_method: "delivery", price: 0, cutoff_time: 11, receive_window: "4pm - 8pm", delivery_type: "same_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: nil, notes: "admin", price_weight_modifier_starter: 0},
])
Rate.create!([
  {id: 11, shop_id: 1, title: "Free Delivery for Subscribers", description: "Next Day Delivered 4pm - 8pm", delivery_method: "delivery", price: 0, cutoff_time: 15, receive_window: "4pm - 8pm", delivery_type: "next_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: "subscription", notes: "only offer after day with no cooks", price_weight_modifier_starter: 0},
])
Rate.create!([
  {id: 12, shop_id: 1, title: "Free Delivery for Subscribers", description: "Same Day Delivered 4pm - 8pm", delivery_method: "delivery", price: 0, cutoff_time: 11, receive_window: "10am - 4pm", delivery_type: "same_day", min_grams: nil, max_grams: nil, min_price: nil, max_price: nil, price_weight_modifier: 0.0, code: "subscription", notes: nil, price_weight_modifier_starter: 0},
])

CookDay.create!([
  {id: 1, cook_schedule_id: 1, rate_ids: [2,3,5,11,12,7,8], title: "Monday"},
  {id: 2, cook_schedule_id: 1, rate_ids: [2,3,5,11,12,7,8], title: "Tuesday"},
  {id: 3, cook_schedule_id: 1, rate_ids: [2,3,5,11,12,7,8], title: "Wednesday"},
  {id: 4, cook_schedule_id: 1, rate_ids: [2,3,5,11,12,7,8], title: "Thursday"},
  {id: 5, cook_schedule_id: 1, rate_ids: [2,3,5,11,12,7,8], title: "Friday"},
  {id: 6, cook_schedule_id: 1, rate_ids: [], title: "Saturday"},
  {id: 7, cook_schedule_id: 1, rate_ids: [2,3,5,11,12,7,8], title: "Sunday"},
  {id: 8, cook_schedule_id: 2, rate_ids: [1,4,5,12], title: "Monday"},
  {id: 9, cook_schedule_id: 2, rate_ids: [1,4,5,12], title: "Tuesday"},
  {id: 10, cook_schedule_id: 2, rate_ids: [1,4,5,12], title: "Wednesday"},
  {id: 11, cook_schedule_id: 2, rate_ids: [1,4,5,12], title: "Thursday"},
  {id: 12, cook_schedule_id: 2, rate_ids: [1,4,5,12], title: "Friday"},
  {id: 13, cook_schedule_id: 2, rate_ids: [], title: "Saturday"},
  {id: 14, cook_schedule_id: 2, rate_ids: [1,4,5,12], title: "Sunday"}
])

# easily update cookdays
#
# CookDay.all.each do |cd|
#   if [1,2,3,4,5,7].include? cd[:id]
#     cd.rate_ids = [2,3,5,11,12,7,8]
#     cd.save
#   elsif [8,9,10,11,12,14].include? cd[:id]
#     cd.rate_ids = [1,4,5,12]
#     cd.save
#   end
# end
