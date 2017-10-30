import React, {Component} from 'react';
import {
  Select,
  Stack,
  TextField
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
                <Select
                  label="Checkout Method"
                  disabled
                  options={[
                    { label: 'Pickup', value: 'pickup' },
                    { label: 'Delivery', value: 'delivery' },
                    { label: 'Shipping', value: 'shipping' }
                  ]}
                  value={ this.props.noteAttribute.value }
                  placeholder="Select"
                />
              </Stack>
            )
            break;
        case 'rate_id':
            noteElement = (
              <Stack vertical>
                <Select
                  label="Rate"
                  disabled
                  options={ rateOptions }
                  value={ this.props.noteAttribute.value }
                  placeholder="Select"
                />
              </Stack>
            )
            break;
        case 'delivery_date':
            noteElement = (
              <Stack vertical>
                <TextField
                  label="Delivery Date"
                  value={ this.props.noteAttribute.value }
                  readOnly={true}
                  disabled
                />
              </Stack>
            )
            break;
        case 'location_id':
            noteElement = (
              <Stack vertical>
                <Select
                  label="Location"
                  disabled
                  options={ locationOptions }
                  value={ this.props.noteAttribute.value }
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
