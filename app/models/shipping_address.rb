class ShippingAddress < ActiveRecord::Base
  belongs_to :order_note

end
