# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180731135523) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "blackout_dates", force: :cascade do |t|
    t.integer  "shop_id"
    t.text     "title"
    t.datetime "blackout_date", null: false
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
    t.index ["shop_id"], name: "index_blackout_dates_on_shop_id", using: :btree
  end

  create_table "conditions", force: :cascade do |t|
    t.integer  "rate_id"
    t.string   "field",                               null: false
    t.string   "verb",                                null: false
    t.text     "value",                               null: false
    t.boolean  "all_items_must_match", default: true
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.index ["rate_id"], name: "index_conditions_on_rate_id", using: :btree
  end

  create_table "cook_days", force: :cascade do |t|
    t.integer "cook_schedule_id"
    t.text    "title",            null: false
    t.index ["cook_schedule_id"], name: "index_cook_days_on_cook_schedule_id", using: :btree
  end

  create_table "cook_days_rates", id: false, force: :cascade do |t|
    t.integer "cook_day_id"
    t.integer "rate_id"
  end

  create_table "cook_schedules", force: :cascade do |t|
    t.integer  "shop_id"
    t.text     "title"
    t.integer  "cook_time",  null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id"], name: "index_cook_schedules_on_shop_id", using: :btree
  end

  create_table "extended_delivery_zones", force: :cascade do |t|
    t.integer  "shop_id"
    t.text     "title",                       null: false
    t.date     "date",                        null: false
    t.string   "postal_codes", default: [],                array: true
    t.boolean  "enabled",      default: true, null: false
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.index ["shop_id"], name: "index_extended_delivery_zones_on_shop_id", using: :btree
  end

  create_table "extended_delivery_zones_rates", id: false, force: :cascade do |t|
    t.integer "extended_delivery_zone_id"
    t.integer "rate_id"
  end

  create_table "order_notes", force: :cascade do |t|
    t.integer  "shop_id"
    t.string   "checkout_token",  null: false
    t.string   "cart_token",      null: false
    t.string   "rate_id",         null: false
    t.string   "checkout_method", null: false
    t.string   "postal_code"
    t.datetime "delivery_date"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.index ["shop_id"], name: "index_order_notes_on_shop_id", using: :btree
  end

  create_table "pickup_locations", force: :cascade do |t|
    t.integer  "shop_id"
    t.string   "title"
    t.text     "address"
    t.string   "days_available", default: [],              array: true
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.text     "description"
    t.index ["shop_id"], name: "index_pickup_locations_on_shop_id", using: :btree
  end

  create_table "postal_codes", force: :cascade do |t|
    t.integer  "shop_id"
    t.text     "title"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id"], name: "index_postal_codes_on_shop_id", using: :btree
  end

  create_table "product_specific_prices", force: :cascade do |t|
    t.integer  "rate_id"
    t.string   "field",      null: false
    t.string   "verb",       null: false
    t.text     "value",      null: false
    t.integer  "price"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["rate_id"], name: "index_product_specific_prices_on_rate_id", using: :btree
  end

  create_table "rates", force: :cascade do |t|
    t.integer  "shop_id"
    t.string   "title"
    t.text     "description"
    t.string   "delivery_method"
    t.integer  "price"
    t.integer  "cutoff_time"
    t.string   "receive_window"
    t.string   "delivery_type"
    t.integer  "min_grams"
    t.integer  "max_grams"
    t.integer  "min_price"
    t.integer  "max_price"
    t.float    "price_weight_modifier",         default: 0.0, null: false
    t.string   "code"
    t.text     "notes"
    t.integer  "price_weight_modifier_starter", default: 0,   null: false
    t.datetime "created_at",                                  null: false
    t.datetime "updated_at",                                  null: false
    t.index ["shop_id"], name: "index_rates_on_shop_id", using: :btree
  end

  create_table "shipping_addresses", force: :cascade do |t|
    t.integer  "order_note_id"
    t.string   "first_name"
    t.text     "address1"
    t.text     "phone"
    t.text     "city"
    t.text     "zip"
    t.text     "province"
    t.string   "country"
    t.text     "last_name"
    t.text     "address2"
    t.text     "company"
    t.decimal  "latitude",      precision: 10, scale: 6
    t.decimal  "longitude",     precision: 10, scale: 6
    t.text     "name"
    t.string   "country_code"
    t.string   "province_code"
    t.datetime "created_at",                             null: false
    t.datetime "updated_at",                             null: false
    t.index ["order_note_id"], name: "index_shipping_addresses_on_order_note_id", using: :btree
  end

  create_table "shops", force: :cascade do |t|
    t.string   "shopify_domain",                     null: false
    t.string   "shopify_token",                      null: false
    t.bigint   "shipping_carrier_id"
    t.string   "money_format"
    t.string   "currency"
    t.string   "locale",              default: "en"
    t.datetime "created_at",                         null: false
    t.datetime "updated_at",                         null: false
    t.index ["shopify_domain"], name: "index_shops_on_shopify_domain", unique: true, using: :btree
  end

  add_foreign_key "blackout_dates", "shops"
  add_foreign_key "conditions", "rates"
  add_foreign_key "cook_days", "cook_schedules"
  add_foreign_key "cook_schedules", "shops"
  add_foreign_key "extended_delivery_zones", "shops"
  add_foreign_key "order_notes", "shops"
  add_foreign_key "pickup_locations", "shops"
  add_foreign_key "postal_codes", "shops"
  add_foreign_key "product_specific_prices", "rates"
  add_foreign_key "rates", "shops"
  add_foreign_key "shipping_addresses", "order_notes"
end
