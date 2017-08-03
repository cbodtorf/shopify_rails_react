class PostalCode < ActiveRecord::Base
  belongs_to :shop

  validates :title, presence: true

end
