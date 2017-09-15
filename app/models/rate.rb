class Rate < ApplicationRecord
  belongs_to :shop
  has_and_belongs_to_many :cook_day, dependent: :destroy

  has_many :conditions, dependent: :destroy
  has_many :product_specific_prices, dependent: :destroy

  validates :title, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0, less_than: 999_999_999 }
  validates :price_weight_modifier, presence: true, numericality: { greater_than_or_equal_to: 0, less_than: 999_999_999 }
  validates :price_weight_modifier_starter, presence: true, numericality: { greater_than_or_equal_to: 0, less_than: 999_999_999 }
  validates :min_price, numericality: { greater_than_or_equal_to: 0, less_than: 999_999_999 }, allow_nil: true
  validates :max_price, numericality: { greater_than_or_equal_to: 0, less_than: 999_999_999 }, allow_nil: true
  validates :min_grams, numericality: { greater_than_or_equal_to: 0, less_than: 999_999_999 }, allow_nil: true
  validates :max_grams, numericality: { greater_than_or_equal_to: 0, less_than: 999_999_999 }, allow_nil: true

  accepts_nested_attributes_for :conditions, allow_destroy: true, reject_if: :all_blank
  accepts_nested_attributes_for :product_specific_prices, allow_destroy: true, reject_if: :all_blank

  def limits
    {
      min_price: min_price,
      max_price: max_price,
      min_grams: min_grams,
      max_grams: max_grams,
    }.select { |_, v| v }
  end
end
