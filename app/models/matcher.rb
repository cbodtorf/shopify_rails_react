class Matcher
  PRODUCT_FIELDS = %w(
    name
    sku
    vendor
  )

  ADDRESS_FIELDS = %w(
    address1
    address2
    city
    province
    country
    postal_code
    company_name
  )

  FIELDS = ADDRESS_FIELDS + PRODUCT_FIELDS

  VERBS = %w(
    regex
    include
    exclude
    equal
    start_with
    end_with
  )

  def self.valid?(verb:, value:, input:)
    return false if input.nil?

    case verb
    when 'regex', 'include'
      input.match(/#{value}/i)
    when 'exclude'
      input !~ /#{value}/i
    when 'equal'
      input.match(/\A(#{value})\z/i)
    when 'start_with'
      input.match(/\A(#{value})/i)
    when 'end_with'
      input.match(/(#{value})\z/i)
    end
  end
end
