class OrderNote < ActiveRecord::Base
  has_one :shipping_address, dependent: :destroy
  # TODO: need to have destination address in order note

  accepts_nested_attributes_for :shipping_address, allow_destroy: true, reject_if: :all_blank

  # Remove Duplicates
  def self.get_duplicates(*columns)
    self.order('created_at ASC').select("#{columns.join(',')}, COUNT(*)").group(columns).having("COUNT(*) > 1")
  end

  def self.dedupe(*columns)
    # find all models and group them on keys which should be common
    self.group_by{|x| columns.map{|col| x.send(col)}}.each do |duplicates|
      first_one = duplicates.shift # or pop to keep last one instead

      # if there are any more left, they are duplicates then delete all of them
      duplicates.each{|x| x.destroy}
    end
  end
end
