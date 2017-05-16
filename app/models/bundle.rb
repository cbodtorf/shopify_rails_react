class Bundle < ApplicationRecord
  belongs_to :shop
  serialize :juice_ids, Array
  
end
