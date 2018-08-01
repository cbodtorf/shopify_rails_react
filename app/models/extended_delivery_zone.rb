class ExtendedDeliveryZone < ActiveRecord::Base
  belongs_to :shop
  has_and_belongs_to_many :rates, dependent: :destroy

  validates :title, presence: true
  validates :date, presence: true
  validates :postal_codes, presence: true

  def self.disabled
    where(enabled: false)
  end

  def self.enabled
    where(enabled: true)
  end

end
