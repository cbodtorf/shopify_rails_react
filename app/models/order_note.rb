class OrderNote
  attr_accessor :checkout_method, :postal_code, :delivery_date, :delivery_time

  def initialize(order_notes)
    @checkout_method = order_notes.find {|note| note['name'] == 'checkout_method'}['value']
    @postal_code = order_notes.find {|note| note['name'] == 'postal_code'}['value']
    @delivery_date = order_notes.find {|note| note['name'] == 'delivery_date'}['value']
    @delivery_time = order_notes.find {|note| note['name'] == 'delivery_time'}['value']
  end
end
