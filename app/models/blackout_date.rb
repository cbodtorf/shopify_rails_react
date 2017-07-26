class BlackoutDate < ActiveRecord::Base
  belongs_to :shop

  validates :title, presence: true
  validates :blackout_date, presence: true

end
