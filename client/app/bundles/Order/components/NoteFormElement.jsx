import React, {Component} from 'react';
import {
  Card,
  Icon,
  FormLayout,
  Select,
  Stack,
  TextField,
  DatePicker
} from '@shopify/polaris';


class NoteFormElement extends Component {
  constructor(props) {
    super(props)
  }

  render() {

    let noteElement = ''

    const rateOptions = this.props.rates.map(rate => {
      return {
        label: rate.title,
        value: rate.id
      }
    })

    const locationOptions = [
      { label: 'Bamboo Juice', value: '1' },
    ]

    switch (this.props.noteAttribute.name) {
        case 'checkout_method':
            noteElement = (
              <Stack vertical>
                <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ this.props.noteAttribute.name } />
                <Select
                  label="Checkout Method"
                  name="order[note_attributes][][value]"
                  options={[
                    { label: 'Pickup', value: 'pickup' },
                    { label: 'Delivery', value: 'delivery' },
                    { label: 'Shipping', value: 'shipping' }
                  ]}
                  value={ this.props.checkout || this.props.noteAttribute.value }
                  onChange={ (value) => { this.props.onCheckoutChange(value) } }
                  placeholder="Select"
                />
              </Stack>
            )
            break;
        case 'rate_id':
            noteElement = (
              <Stack vertical>
                <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ this.props.noteAttribute.name } />
                <Select
                  label="Rate"
                  name="order[note_attributes][][value]"
                  options={ rateOptions }
                  value={ this.props.rate || this.props.noteAttribute.value }
                  onChange={ (value) => { this.props.onRateChange(value) } }
                  placeholder="Select"
                />
              </Stack>
            )
            break;
        case 'delivery_date':
            noteElement = (
              <Stack vertical>
                <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ this.props.noteAttribute.name } />
                <TextField
                  label="Delivery Date"
                  value={ this.props.datePickerSelected ? `${this.props.deliveryDate.month}-${this.props.deliveryDate.day}-${this.props.deliveryDate.year}` : this.props.noteAttribute.value }
                  readOnly={true}
                  placeholder='mm-dd-yyyy'
                />
                <DatePicker
                  month={ this.props.datePickerMonth }
                  year={ this.props.datePickerYear }
                  selected={ this.props.datePickerSelected }
                  disableDatesBefore={ new Date() }
                  onChange={ (selected) => { this.props.onDateChange(selected) } }
                  onMonthChange={ (month,year) => { this.props.onMonthChange(month,year) } }
                />
              </Stack>
            )
            break;
        case 'location_id':
            noteElement = (
              <Stack vertical>
                <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ this.props.noteAttribute.name } />
                <Select
                  label="Location"
                  name="order[note_attributes][][value]"
                  options={ locationOptions }
                  value={ this.props.location || this.props.noteAttribute.value }
                  onChange={ (value) => { this.props.onLocationChange(value) } }
                  placeholder="Select"
                />
              </Stack>
            )
            break;
        case 'location_title':

            break;
        case 'postal_code':

            break;
        default:
        noteElement = (
          <Stack vertical>
            <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ this.props.noteAttribute.name } />
            <TextField
              label={ this.props.noteAttribute.name }
              value={ this.props.noteAttribute.value }
            />
          </Stack>
        )
    }


    return (
      <Stack vertical>
        { noteElement }
      </Stack>
    );
  }

}

export default NoteFormElement
