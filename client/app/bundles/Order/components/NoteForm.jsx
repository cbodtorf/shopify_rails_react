import React, {Component} from 'react';
import {
  FormLayout,
  Select,
  Stack,
  TextField,
  DatePicker,
  Label,
  Banner
} from '@shopify/polaris';

const monthNames = ["January","February","March","April","May","June","July",
"August","September","October","November","December"]


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

    let datePickerInputs = null
    let datePicker = null

    if ((this.props.checkout || checkoutMethod.value) !== "shipping") {
      datePicker = (
            <div>
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
      )
      datePickerInputs = (
            <div>
              <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ "delivery_date" } />
              <input type="hidden" name="order[note_attributes][][value]" id="order_note_attributes__value" value={ this.props.datePickerSelected ? `${this.props.deliveryDate.wday}, ${monthNames[this.props.deliveryDate.month - 1]} ${this.props.deliveryDate.day}, ${this.props.deliveryDate.year}` : deliveryDate.value } />
            </div>
      )
    }

    let pickupLocations = null
    let pickupLocationsInput = null

    if ((this.props.checkout || checkoutMethod.value) === "pickup") {
      pickupLocations = (
          <Select
            label="Location"
            name="order[note_attributes][][value]"
            options={ locationOptions }
            value={ this.props.location || locationId.value }
            onChange={ (value) => { this.props.onLocationChange(value) } }
            placeholder="Select"
          />
      )
      pickupLocationsInput = <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ "location_id" } />
    }

    const rateOptions = this.props.rates.filter((rate) => {return rate.delivery_method === (this.props.checkout || checkoutMethod.value)}).map(rate => {
      return {
        label: `${rate.title}: $${rate.price / 100}`,
        value: rate.id
      }
    })
    console.log("rateOptions", rateOptions);

    return (
      <div className="modal-form-container">
        <Banner
          icon="notes"
          title="Note about editing delivery attributes."
          status="default"
        >
          <p>This process will move the order into the correct delivery or pickup bucket and appropriate juicing and address CSV.  It will not charge or refund the customer.</p>
        </Banner>
        <form
          action={ this.props.formUrl }
          acceptCharset="UTF-8" method="post"
          ref={ this.props.orderFormRef }
          >
          <FormLayout>
            <input name="utf8" type="hidden" value="✓" />
            <input type="hidden" name="_method" value={ this.props.method } />
            <input type="hidden" name="authenticity_token" value={ this.props.authenticity_token } />
            <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ "checkout_method" } />
            <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ "rate_id" } />
            { datePickerInputs }
            { pickupLocationsInput }


                <FormLayout.Group>
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

                  <Select
                    label="Rate"
                    name="order[note_attributes][][value]"
                    options={ rateOptions }
                    value={ this.props.rate || rateId.value }
                    onChange={ (value) => { this.props.onRateChange(value) } }
                    placeholder="Select"
                  />

                  { pickupLocations }
                </FormLayout.Group>

          </FormLayout>
        </form>
        <br /><br />

        { datePicker }

      </div>
    );
  }

}

export default NoteForm
