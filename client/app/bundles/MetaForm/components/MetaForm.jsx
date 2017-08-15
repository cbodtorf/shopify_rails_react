import React from 'react';
import {Card, Banner, FormLayout, Select, TextField, Layout, Button, Icon, ResourceList, Thumbnail, TextStyle, Tabs, Badge} from '@shopify/polaris';

class MetaForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      bundle: {},
      formFields: [],
      hiddenFormInput: '',
      method: '',
      url: '',
    }
  }

  componentWillMount() {
    console.log("props", this.props);
    let metafield = []
    let method = 'post'
    let url = this.props.bundle === null ? '/bundle' : `/bundle?id=${this.props.bundle.id}`

    if (this.props.bundle) {
      if (this.props.bundle.metafield.length !== 0) {
        method = 'put'
        url = `/bundle/${this.props.bundle.id}`
      }
    }

    this.setState({
      bundle: this.props.bundle,
      formFields: this.props.bundle === null ? '' : this.props.bundle.metafield,
      method: method,
      url: url,
      authenticity_token: this.props.authenticity_token
    })
  }

  render() {
    // console.log(" window.parent", window.parent.document.querySelector('body'))
    /**
    * Filtering out Bundles, Cleanses, and Subscriptions on the backend.
    */
    const productOptions = this.props.products.map(product => {
      return { label: product.title, value: product.title }
    })

    let existingMetafields = []
    console.log('state', this.state);
    if (this.state.formFields.length !== 0 ) {
      existingMetafields = this.state.formFields.map((item, i) => {
        return (
          <div key={item.id} className="bundle-input">
          <Select
            label="Bundle Item"
            value={item.title}
            options={productOptions}
            placeholder="Select"
            onChange={this.valueUpdater(item.id)}
            labelAction={{content: 'remove', onAction: () => { this.removeFormField(item.id) }}}
          />
          <TextField
            prefix="QTY: "
            value={item.quantity}
            type="number"
            name="quantity"
            onChange={this.quantityUpdater(item.id)}
          />
          </div>
        )
      })
    } else {
      existingMetafields = (
        <p>No associated products yet.</p>
      )
    }

    let mainContainer = (
      <Card
        sectioned
        title={this.state.bundle.title}
        primaryFooterAction={{content: 'Save', onAction: () => { this.handleSave() } }}
        secondaryFooterAction={{content: 'Cancel', onAction: () => { this.handleCancel() } }}
        actions={[{content: 'Add bundle item', onAction: () => { this.addFormField() } }]}
        >
      <FormLayout>
        <FormLayout.Group>
          { existingMetafields }
        </FormLayout.Group>
      </FormLayout>
      </Card>
    )


    return (
        <div className="bamboo-modalForm">
          <Layout>
            <Layout.Section>
              <form
                action={this.state.url}
                acceptCharset="UTF-8" method="post"

                ref={(form) => {this.metaForm = form}}
                style={{'display': 'none'}}
                >
                <input name="utf8" type="hidden" value="✓" />
                <input type="hidden" name="_method" value={this.state.method} />
                <input type="hidden" name="authenticity_token" value={this.state.authenticity_token} />
                <label htmlFor="metafield">Search for:</label>
                <input type="text" name="metafield" id="metafield" value={this.state.hiddenFormInput} onChange={this.formUpdater('hiddenFormInput')} ref={(textInput) => {this.metaInput = textInput}}/>
                <input type="submit" name="commit" value="submit" data-disable-with="submit" />
              </form>
              {mainContainer}
            </Layout.Section>
          </Layout>
        </div>
    );
  }

  valueUpdater(id) {

    return (value) => {
      let metafield = this.state.formFields.map((field, i) => {
        if (field.id !== id) {
          return field
        } else {
          field.title = value
          return field
        }
        })
        this.setState({formFields: metafield})
      }

  }
  quantityUpdater(id) {

    return (value) => {
      let metafield = this.state.formFields.map((field, i) => {
        if (field.id !== id) {
          return field
        } else {
          field.quantity = value
          return field
        }
        })
        this.setState({formFields: metafield})
      }

  }

  formUpdater(field) {
    return (value) => this.setState({[field]: value});
  }

  handleSave() {
    let dataString = this.state.formFields.map(field => {
      return field.title.split('_')[0] + ' x' + field.quantity
    }).join(',')

    this.metaInput.value = dataString
    console.log('data', dataString, this.metaForm, this.metaInput.value);
    this.metaForm.submit()
  }

  handleCancel() {
    window.location = '/'
  }

  handleEdit(bundle) {
    let method = 'post'
    let url = `/bundle?id=${bundle.id}`

    if (bundle.metafield.length !== 0) {
      method = 'put'
      url = `/bundle/${bundle.id}`
    }

    this.setState({
      bundle: bundle,
      formFields: bundle.metafield,
      method: method,
      url: url
    })

    if (history.pushState) {
      history.pushState('', bundle.title, `${window.location.origin}/bundle/?id=${bundle.id}`);
    }
  }

  addFormField() {
    console.log('formFields', this.state.formFields);
    let formFields = this.state.formFields
    formFields.push({title: this.props.products[0].title, id: this.state.bundle.id + "_" + (this.state.formFields.length + 1)})

    this.setState({formFields: formFields})
  }

  removeFormField(id) {
    console.log('formFields', this.state.formFields);
    let formFields = this.state.formFields.filter(item => {
      // Remove item
      return item.id !== id
    })

    this.setState({formFields: formFields})
  }



}
export default MetaForm
