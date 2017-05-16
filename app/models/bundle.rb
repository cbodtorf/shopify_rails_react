class Bundle < ApplicationRecord
  belongs_to :shop
  has_many :juices, dependent: :destroy
end
