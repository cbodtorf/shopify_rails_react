import React, {Component} from 'react';
import {
  Card,
  Icon,
  FormLayout,
  Select,
  Stack,
  TextField,
  DatePicker,
  Label
} from '@shopify/polaris';


class NoteForm extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let checkoutMethod = {name: "", value: ""},
          rateId = {name: "", value: ""},
          deliveryDate = {name: "", value: ""},
          locationId = {name: "", value: ""},
          locationName = {name: "", value: ""},
          postalCode = {name: "", value: ""};

    let noteElement = ''

    const rateOptions = this.props.rates.map(rate => {
      return {
        label: `${rate.title}: $${rate.price / 100}`,
        value: rate.id
      }
    })

    let locationOptions = this.props.pickupLocations.map(location => {
      return {
        label: location.title,
        value: location.id
      }
    })
    locationOptions.unshift({label: 'N/A', value: ''})

    this.props.noteAttributes.forEach((note) => {
      console.log("note: ", note);
      if (note.name === "checkout_method") {
        checkoutMethod = note
      } else if (note.name === "rate_id") {
        rateId = note
      } else if (note.name === "delivery_date") {
        deliveryDate = note
      } else if (note.name === "location_id") {
        locationId = note
      } else if (note.name === "location_name") {
        locationName = note
      } else if (note.name === "postal_code") {
        postalCode = note
      } else {
        console.log('random note: ', note);
      }
    })

    return (
      <div>
        <form
          action={ this.props.formUrl }
          acceptCharset="UTF-8" method="post"
          ref={ this.props.orderFormRef }
          >
          <FormLayout>
            <input name="utf8" type="hidden" value="✓" />
            <input type="hidden" name="_method" value={ this.props.method } />
            <input type="hidden" name="authenticity_token" value={ this.props.authenticity_token } />

            <Stack vertical>
              <Stack vertical>
                <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ "checkout_method" } />
                <Select
                  label="Checkout Method"
                  name="order[note_attributes][][value]"
                  options={[
                    { label: 'Pickup', value: 'pickup' },
                    { label: 'Delivery', value: 'delivery' },
                    { label: 'Shipping', value: 'shipping' }
                  ]}
                  value={ this.props.checkout || checkoutMethod.value }
                  onChange={ (value) => { this.props.onCheckoutChange(value) } }
                  placeholder="Select"
                />
              </Stack>
              <Stack vertical>
                <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ "rate_id" } />
                <Select
                  label="Rate"
                  name="order[note_attributes][][value]"
                  options={ rateOptions }
                  value={ this.props.rate || rateId.value }
                  onChange={ (value) => { this.props.onRateChange(value) } }
                  placeholder="Select"
                />
              </Stack>
              <Stack vertical>
                <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ "location_id" } />
                <Select
                  label="Location"
                  name="order[note_attributes][][value]"
                  options={ locationOptions }
                  value={ this.props.location || locationId.value }
                  onChange={ (value) => { this.props.onLocationChange(value) } }
                  placeholder="Select"
                />
              </Stack>
              <Stack vertical>

                <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ "delivery_date" } />
                <input type="hidden" name="order[note_attributes][][value]" id="order_note_attributes__value" value={ this.props.datePickerSelected ? `${this.props.deliveryDate.month}-${this.props.deliveryDate.day}-${this.props.deliveryDate.year}` : deliveryDate.value } />
              </Stack>
            </Stack>

          </FormLayout>
        </form>
        <Label>Delivery Date</Label><br />

        <DatePicker
          month={ this.props.datePickerMonth }
          year={ this.props.datePickerYear }
          selected={ this.props.datePickerSelected }
          disableDatesBefore={ new Date() }
          onChange={ (selected) => { this.props.onDateChange(selected) } }
          onMonthChange={ (month,year) => { this.props.onMonthChange(month,year) } }
        />
      </div>
    );
  }

}

export default NoteForm
