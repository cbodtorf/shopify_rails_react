import React from 'react';
import {Page, Card, Banner, FormLayout, Select, Layout, Button, Icon} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';

class BundleEditor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      formFields: [],
      hiddenFormInput: '',
      method: '',
      url: ''
    }
  }

  componentWillMount() {
    console.log("props", this.props);
    let metafields = []
    let method = 'post'
    let url = `/bundle?id=${this.props.bundle.id}`

    if (this.props.bundle.metafields !== null) {
      metafields = this.props.bundle.metafields.value.split(',').map((item, i) => {
        return {'title': item, 'id': i}
      })
      method = 'put'
      url = `/bundle/${this.props.bundle.id}`
    }

    this.setState({
      formFields: metafields,
      method: method,
      url: url
    })
  }

  render() {
    const productOptions = this.props.products.filter(product => {
      return product.product_type !== 'bundle'
    }).map(product => {
      return product.title
    })

    let existingMetafields = []
    if (this.state.formFields.length !== 0 ) {
      existingMetafields = this.state.formFields.map((item, i) => {
        return (
          <Select
            key={i}
            label="Bundle Item"
            value={item.title}
            options={productOptions}
            placeholder="Select"
            onChange={this.valueUpdater(item.id)}
            labelAction={{content: 'remove', onAction: () => { this.removeFormField(item.id) }}}
          />
        )
      })
    } else {
      existingMetafields = (
        <p>No associated products yet.</p>
      )
    }


    return (
      <EmbeddedApp
        apiKey={this.props.apiKey}
        shopOrigin={this.props.shopOrigin}
      >
        <Page title={`Edit Bundle`}>
          <Layout>
            <Layout.Section>
                <Card
                  sectioned
                  title={this.props.bundle.title}
                  primaryFooterAction={{content: 'Save', onAction: () => { this.handleSave() }}}
                  actions={[{content: 'Add bundle item', onAction: () => { this.addFormField() }}]}
                  >
                <FormLayout>
                  <FormLayout.Group>
                    { existingMetafields }
                    <form
                      action={this.state.url}
                      acceptCharset="UTF-8" method="post"
                      ref={(form) => {this.metaForm = form}}
                      style={{'display': 'none'}}
                      >
                      <input name="utf8" type="hidden" value="✓" />
                      <input type="hidden" name="_method" value={this.state.method} />
                      <input type="hidden" name="authenticity_token" value={this.props.authenticity_token} />
                      <label htmlFor="metafield">Search for:</label>
                      <input type="text" name="metafield" id="metafield" value={this.state.hiddenFormInput} onChange={this.formUpdater('hiddenFormInput')} ref={(textInput) => {this.metaInput = textInput}}/>
                      <input type="submit" name="commit" value="submit" data-disable-with="submit" />
                    </form>
                  </FormLayout.Group>
                </FormLayout>
                </Card>
            </Layout.Section>
          </Layout>
        </Page>
      </EmbeddedApp>
    );
  }

  valueUpdater(id) {

    return (value) => {
      let metafields = this.state.formFields.map((field, i) => {
        if (field.id !== id) {
          return field
        } else {
          field.title = value
          return field
        }
        })
        this.setState({formFields: metafields})
      }

  }

  formUpdater(field) {
    return (value) => this.setState({[field]: value});
  }

  handleSave() {
    let dataString = this.state.formFields.map(field => {
      return field.title
    }).join(',')

    this.metaInput.value = dataString
    console.log('data', dataString, this.metaForm, this.metaInput.value);
    this.metaForm.submit()
  }

  addFormField() {
    console.log('formFields', this.state.formFields);
    let formFields = this.state.formFields
    formFields.push({title: this.props.products[0].title, id: this.state.formFields.length + 1})

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
export default BundleEditor
