class CookDay < ApplicationRecord
  belongs_to :cook_schedule

  has_and_belongs_to_many :rates, dependent: :destroy

end
