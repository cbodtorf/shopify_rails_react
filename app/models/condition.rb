class Condition < ActiveRecord::Base
  belongs_to :rate

  validates :field, inclusion: Matcher::FIELDS
  validates :verb, inclusion: Matcher::VERBS

  def valid_for?(input)
    Matcher.valid?(value: value, verb: verb, input: input)
  end
end
