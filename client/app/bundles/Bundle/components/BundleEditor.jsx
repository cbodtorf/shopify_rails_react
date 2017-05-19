import React from 'react';
import {Page, Card, Banner, FormLayout, Select, Layout, Button, Icon} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';

class BundleEditor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      formFields: [],
      hiddenFormInput: ''
    }
  }

  componentWillMount() {
    console.log("props", this.props);
    let metafields = []
    if (this.props.bundle.metafields !== null) {
      metafields = this.props.bundle.metafields.value.split(',').map((item, i) => {
        return {'title': item, 'id': i}
      })
    }

    this.setState({formFields: metafields})
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
            labelAction={{content: 'remove', onAction: () => { console.log('meh', item.id )}}}
          />
        )
      })
    } else {
      existingMetafields = (
        <Select
          label="Bundle Item"
          options={productOptions}
          placeholder="Select"
          labelAction={{content: 'remove', onAction: () => { console.log('meh', 0)}}}
          onChange={this.valueUpdater(0)}
        />
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
                  >
                <FormLayout>
                  <FormLayout.Group>
                    { existingMetafields }
                    <form action={`/bundle/${this.props.bundle.id}`} acceptCharset="UTF-8" method="post" >
                      <input name="utf8" type="hidden" value="✓" />
                      <input type="hidden" name="_method" value="put" />
                      <input type="hidden" name="authenticity_token" value={this.props.authenticity_token} />
                      <label htmlFor="metafield">Search for:</label>
                      <input type="text" name="metafield" id="metafield" value={this.state.hiddenFormInput} onChange={this.formUpdater('hiddenFormInput')}/>
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

  handleSave(id) {
    console.log('this', this);

    let dataString = this.state.formFields.map(field => {
      return field.title
    }).join(',')
    let url = `https://bamboojuices.myshopify.com/admin/products/${this.props.bundle.id}/metafields/28750988869.json`


    let form = document.querySelector('form')
    let input = $('input#metafield')
    input.value = `{"metafield": {"value": ${dataString}}})`
    form.submit()
    console.log('data', dataString, form, input);

    // fetch(`/bundle/${this.props.bundle.id}`, {
    //   method: 'PUT',
    //   mode: 'cors',
    //   body: JSON.stringify({
    //     "utf8": "✓",
    //     "authenticity_token": this.props.form_authenticity_token,
    //     "data": {"metafield": {"value": dataString}},
    //     "commit": "submit"
    //   }),
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json'
    //   }
    // }).then(response => {
    //   if (response.ok) {
    //     // return response.json()
    //   } else {
    //     // error
    //     console.error('err', response);
    //   }
    // }).then(response => {
    //   console.log('yay!');
    // })

  }



}
export default BundleEditor
