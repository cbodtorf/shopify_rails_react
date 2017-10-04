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

    let locationOptions = this.props.pickupLocations.map(location => {
      return {
        label: location.title,
        value: location.id
      }
    })

    switch (this.props.noteAttribute.name) {
        case 'checkout_method':
            noteElement = (
              <Stack vertical>
                <input type="hidden" name="order[note_attributes][][name]" id="order_note_attributes__name" value={ this.props.noteAttribute.name } />
                <Select
                  label="Checkout Method"
                  disabled
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
                  disabled
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
                  disabled
                  placeholder='mm-dd-yyyy'
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
                  disabled
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
              disabled
              readOnly={true}
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
