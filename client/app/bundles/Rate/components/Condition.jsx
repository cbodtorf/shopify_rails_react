import React, {Component} from 'react';
import {
  Card,
  Icon,
  FormLayout,
  Select,
  TextField,
} from '@shopify/polaris';


class Condition extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let newCondition = ''
    if (this.props.condition.newCondition !== true) {
      newCondition = <input style={{'display': 'none'}} value={this.props.condition.id} type="hidden" name={`rate[conditions_attributes][${this.props.id}][id]`}/>
    }

    const fields = [
      'Address line 1',
      'Address line 2',
      'City',
      'State / Province 2-letter code',
      'Country 2-letter code',
      'Zip / Postal code',
      'Company name',
      'Product name',
      'Product SKU',
      'Vendor name'
    ]
    const verbs = [
      'Regular expression',
      'Include',
      'Exclude',
      'Equal',
      'Start with',
      'End with'
    ]
    return (
      <Card
        sectioned
        title={`Condition ${this.props.condition.index}`}
        actions={[{
            icon: 'delete',
            onAction: () => this.props.deleteCondition(this.props.condition.id),
        }]}
        >
        <div data-condition>
        <input style={{'display': 'none'}} value={this.props.condition.newCondition ? 0 : false} type="hidden" name={`rate[conditions_attributes][${this.props.id}][_destroy]`}/>
        { newCondition }
        <FormLayout>
          <FormLayout.Group condensed>
            <Select
              value={this.props.condition.field}
              label="Field"
              name={`rate[conditions_attributes][${this.props.id}][field]`}
              options={this.props.matcher.fields}
              onChange={this.props.updateCondition('field', this.props.condition.id)}
            />
            <Select
              value={this.props.condition.verb}
              label="Verb"
              name={`rate[conditions_attributes][${this.props.id}][verb]`}
              options={this.props.matcher.verbs}
              onChange={this.props.updateCondition('verb', this.props.condition.id)}
            />
            <TextField
              value={this.props.condition.value}
              label="Value"
              name={`rate[conditions_attributes][${this.props.id}][value]`}
              placeholder=""
              onChange={this.props.updateCondition('value', this.props.condition.id)}
            />
          </FormLayout.Group>
        </FormLayout>
        </div>
      </Card>
    );
  }

}

export default Condition
