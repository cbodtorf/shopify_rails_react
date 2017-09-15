class CookSchedule < ApplicationRecord
  belongs_to :shop

  has_many :cook_days, dependent: :destroy

end
