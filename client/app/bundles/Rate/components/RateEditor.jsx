import React from 'react';
import {Page, Card, Banner, FormLayout, Select, Layout, Button, Icon, ResourceList, TextStyle, TextField} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';

class RateEditor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      rate: {},
      method: '',
      url: ''
    }
  }

  componentWillMount() {
    console.log("props", this.props);
    let method = 'post'
    let url = `/rate/${this.props.rate.id}`

    this.setState({
      rate: this.props.rate,
      method: method,
      url: url
    })
  }

  render() {

    let rates = this.props.rates.map(rate => {
      return (
        {
          media: <Icon
            source={'notes'}
          />,
          attributeOne: `${rate.name} - ${rate.price / 100.0} ${this.props.shop.currency}`,
          attributeTwo: <TextStyle variation="subdued">{rate.description}</TextStyle>,
          actions: [{content: 'Edit rate', onAction: () => { this.handleEdit(rate) }}],
          persistActions: true,
        }
      )
    })

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
                  title={this.state.rate.name}
                  primaryFooterAction={{content: 'Save', onAction: () => { this.handleSave() } }}
                  secondaryFooterAction={{content: 'Cancel', onAction: () => { this.handleCancel() } }}
                  >
                  <form
                    action={this.state.url}
                    acceptCharset="UTF-8" method="post"
                    ref={(form) => {this.rateForm = form}}
                    >
                    <FormLayout>
                        <input name="utf8" type="hidden" value="✓" />
                        <input type="hidden" name="_method" value={this.state.method} />
                        <input type="hidden" name="authenticity_token" value={this.props.authenticity_token} />
                        <TextField
                          label="Rate name"
                          type="text"
                          connectedRight={
                            <TextField type="number" prefix="Price" suffix={` ${this.props.shop.currency}`}/>
                          }
                          />
                          <TextField
                            label="Description"
                            type="text"
                            multiline
                          />
                    </FormLayout>
                  </form>
                </Card>
                <Card
                  title="Other Rates"
                >
                  <ResourceList
                    items={rates}
                    renderItem={(item, index) => {
                      return <ResourceList.Item key={index} {...item} />;
                    }}
                  />
                </Card>
            </Layout.Section>
          </Layout>
        </Page>
      </EmbeddedApp>
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

  formUpdater(field) {
    return (value) => this.setState({[field]: value});
  }

  handleSave() {
    // let dataString = this.state.formFields.map(field => {
    //   return field.title
    // }).join(',')
    //
    // this.metaInput.value = dataString
    // console.log('data', dataString, this.metaForm, this.metaInput.value);
    this.rateForm.submit()
  }

  handleCancel() {
    window.location = '/'
  }

  handleEdit(rate) {
    // let method = 'post'
    // let url = `/bundle?id=${bundle.id}`
    //
    // if (bundle.metafield.length !== 0) {
    //   method = 'put'
    //   url = `/bundle/${bundle.id}`
    // }
    //
    // this.setState({
    //   bundle: bundle,
    //   formFields: bundle.metafield,
    //   method: method,
    //   url: url
    // })
    //
    // if (history.pushState) {
    //   history.pushState('', bundle.title, `${window.location.origin}?id=${bundle.id}`);
    // }
  }



}
export default RateEditor
