import React, {Component} from 'react';
import {
  FormLayout,
  Card,
  Select,
  Stack,
  TextField,
  DatePicker,
  Label,
  Banner
} from '@shopify/polaris';

const monthNames = ["January","February","March","April","May","June","July",
"August","September","October","November","December"]

const humanize_ = function(property) {
  return property.replace(/_/g, ' ')
      .replace(/(\w+)/g, function(match) {
        return match.charAt(0).toUpperCase() + match.slice(1);
      });
};

class NoteForm extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let checkoutMethod = {name: "", value: ""},
          deliveryRate = {name: "", value: ""},
          receiveWindow = {name: "", value: ""},
          deliveryDate = {name: "", value: ""},
          pickupLocation = {name: "", value: ""};

    let noteElement = ''

    let locationOptions = this.props.pickupLocations.map(location => {
      return {
        label: location.title,
        value: `[${location.id}] ${location.title}`
      }
    })

    locationOptions.unshift({label: 'N/A', value: ''})

    this.props.noteAttributes.forEach((note) => {
      console.log("note: ", note);
      let noteName = humanize_(note.name)
      if (noteName === "Checkout Method") {
        checkoutMethod = note
      } else if (noteName === "Delivery Rate") {
        deliveryRate = note
      } else if (noteName === "Receive Window") {
        receiveWindow = note
      } else if (noteName === "Delivery Date") {
        deliveryDate = note
      } else if (noteName === "Pickup Location") {
        pickupLocation = note
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
                disableDatesBefore={ new Date(new Date().setDate(new Date().getDate()-1)) }
                onChange={ (selected) => { this.props.onDateChange(selected) } }
                onMonthChange={ (month,year) => { this.props.onMonthChange(month,year) } }
              />
            </div>
      )

      datePickerInputs = (
            <div>
              <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ "Delivery Date" } />
              <input type="hidden" name="order[note_attributes][][value]" id="order_note_attributes__value" value={ this.props.datePickerSelected ? `${this.props.deliveryDate.wday}, ${monthNames[this.props.deliveryDate.month - 1]} ${this.props.deliveryDate.day}, ${this.props.deliveryDate.year}` : deliveryDate.value } />
            </div>
      )
    }

    let pickupLocations = null
    let pickupLocationsInputs = null

    if ((this.props.checkout || checkoutMethod.value) === "pickup") {
      pickupLocations = (
          <Select
            label="Location"
            name="order[note_attributes][][value]"
            options={ locationOptions }
            value={ this.props.location || pickupLocation.value }
            onChange={ (value) => { this.props.onLocationChange(value) } }
            placeholder="Select"
          />
      )

      pickupLocationsInputs = (
        <div>
          <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ "Pickup Location" } />
          <input type="hidden" name="order[note_attributes][][value]" id="order_note_attributes__value" value={ this.props.location || pickupLocation.value } />
        </div>
      )
    }

    const receiveWindowOptions = this.props.rates.filter((rate) => {return `[${rate.id}] ${rate.title}` === (this.props.rate || deliveryRate.value)}).map(rate => {
      return {
        label: `${rate.receive_window}`,
        value: `${rate.receive_window}`
      }
    })
    receiveWindowOptions.unshift({label: 'N/A', value: ''})

    let receiveWindows = null
    let receiveWindowInputs = null

    if ((this.props.checkout || checkoutMethod.value) === "delivery") {
      receiveWindows = (
          <Select
            label="Receive Window"
            name="order[note_attributes][][value]"
            options={ receiveWindowOptions }
            value={ this.props.receiveWindow || receiveWindow.value }
            onChange={ (value) => { this.props.onReceiveWindowChange(value) } }
            placeholder="Select"
          />
      )
      receiveWindowInputs = (
        <div>
          <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ "Receive Window" } />
          <input type="hidden" name="order[note_attributes][][value]" id="order_note_attributes__value" value={ this.props.receiveWindow || receiveWindow.value } />
        </div>
      )
    }



    const rateOptions = this.props.rates.filter((rate) => {return rate.delivery_method === (this.props.checkout || checkoutMethod.value)}).map(rate => {
      return {
        label: `${rate.title}: $${rate.price / 100}`,
        value: `[${rate.id}] ${rate.title}`
      }
    })
    console.log("rateOptions", rateOptions);
    rateOptions.unshift({label: 'N/A', value: ''})

    return (
      <div className="modal-form-container">
        <Card.Section>
        <Banner
          icon="notes"
          title="Note about editing delivery attributes."
          status="default"
        >
          <p>This process will move the order into the correct delivery or pickup bucket and appropriate juicing and address CSV.  It will not charge or refund the customer.</p>
        </Banner>
        <FormLayout>
          <form
            action={ this.props.formUrl }
            acceptCharset="UTF-8" method="post"
            ref={ this.props.orderFormRef }
            >
              <input name="utf8" type="hidden" value="✓" />
              <input type="hidden" name="_method" value={ this.props.method } />
              <input type="hidden" name="authenticity_token" value={ this.props.authenticity_token } />

              { datePickerInputs }

              <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ "Checkout Method" } />
              <input type="hidden" name="order[note_attributes][][value]" id="order_note_attributes__value" value={ this.props.checkout || checkoutMethod.value } />

              <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ "Delivery Rate" } />
              <input type="hidden" name="order[note_attributes][][value]" id="order_note_attributes__value" value={ this.props.rate || deliveryRate.value } />

              { receiveWindowInputs }

              { pickupLocationsInputs }

          </form>
        </FormLayout>
        <br />
        <FormLayout>
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
              onChange={ (value) => {
                this.props.onCheckoutChange(value)
                this.props.onRateChange(this.props.rate || deliveryRate.value)
                this.props.onReceiveWindowChange(this.props.receiveWindow || receiveWindow.value)
              } }
              placeholder="Select"
            />

            <Select
              label="Rate"
              name="order[note_attributes][][value]"
              options={ rateOptions }
              value={ this.props.rate || deliveryRate.value }
              onChange={ (value) => {
                this.props.onRateChange(value)
                this.props.onReceiveWindowChange(this.props.receiveWindow || receiveWindow.value)
              } }
              placeholder="Select"
            />

            { pickupLocations }

            { receiveWindows }
          </FormLayout.Group>
        </FormLayout>
        <br /><br />

        { datePicker }
        </Card.Section>
      </div>
    );
  }

}

export default NoteForm
