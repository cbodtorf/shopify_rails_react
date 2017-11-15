import React, {Component} from 'react';
import {
  Select,
  Stack,
  TextField
} from '@shopify/polaris';

const humanize_ = function(property) {
  return property.replace(/_/g, ' ')
      .replace(/(\w+)/g, function(match) {
        return match.charAt(0).toUpperCase() + match.slice(1);
      });
};

class NoteFormElement extends Component {
  constructor(props) {
    super(props)
  }

  render() {

    let noteElement = ''

    const rateOptions = this.props.rates.map(rate => {
      return {
        label: rate.title,
        value: `[${rate.id}] ${rate.title}`
      }
    })

    let locationOptions = this.props.pickupLocations.map(location => {
      return {
        label: location.title,
        value: `[${location.id}] ${location.title}`
      }
    })

    switch (humanize_(this.props.noteAttribute.name)) {
        case 'Checkout Method':
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
        case 'Delivery Rate':
            noteElement = (
              <Stack vertical>
                <Select
                  label="Delivery Rate"
                  disabled
                  options={ rateOptions }
                  value={ this.props.noteAttribute.value }
                  placeholder="Select"
                />
              </Stack>
            )
            break;
        case 'Delivery Date':
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
        case 'Pickup Location':
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
        case 'Location Title':

            break;
        case 'Postal Code':

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
