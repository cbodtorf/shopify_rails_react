class PickupLocation < ActiveRecord::Base
  belongs_to :shop

  validates :title, presence: true
  validates :address, presence: true
  validates :days_available, presence: true

end
