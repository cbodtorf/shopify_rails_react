import React from 'react';
import {Page, Card, Banner, FormLayout, Select, Layout, Button, Icon, ResourceList, TextStyle, TextField} from '@shopify/polaris';
import {EmbeddedApp, Alert, Bar} from '@shopify/polaris/embedded';

class RateEditor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      rate: {},
      method: '',
      url: '',
      newRate: false,
      deleteAlertOpen: false
    }
  }

  componentWillMount() {
    console.log("this", this);
    let method = 'post'
    let url = `/rates`
    let rate = {}
    let newRate = true

    if (this.props.rate.id) {
      console.log('meh');
      method = 'put'
      url = `/rates/${this.props.rate.id}`
      rate = this.props.rate
      newRate = false
    } else {
      rate = {}
    }

    this.setState({
      rate: rate,
      method: method,
      url: url,
      newRate: newRate
    })
  }

  render() {
    console.log("render", this.state);

    let rates = this.props.rates.map(rate => {
      return (
        {
          media: <Icon
            source={'notes'}
          />,
          attributeOne: `${rate.name} - ${rate.price / 100.0} ${this.props.shop.currency}`,
          attributeTwo: <TextStyle variation="subdued">{rate.description}</TextStyle>,
          actions: [
            {content: 'Edit rate', onAction: () => { this.handleEdit(rate) }},
            {content: <Icon source="delete" color="red" />, onAction: () => { this.setState({deleteAlertOpen: true, rateToDelete: rate}) }},
          ],
          persistActions: true,
        }
      )
    })

    return (
      <EmbeddedApp
        apiKey={this.props.apiKey}
        shopOrigin={this.props.shopOrigin}
      >
        <Page title={`Edit Rate`}>
          <Layout>
            <Layout.Section>
                <Card
                  sectioned
                  title="Rate"
                  actions={[{content: <TextStyle variation="subdued">{this.state.newRate ? 'New Rate' : this.state.rate.name}</TextStyle>}]}
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
                          label="Name"
                          name="name"
                          type="text"
                          value={this.state.rate.name}
                          onChange={this.valueUpdater('name')}
                          connectedRight={
                            <TextField
                              label="Price"
                              name="price"
                              type="number"
                              labelHidden
                              prefix={<TextStyle variation="strong">Price: </TextStyle>}
                              value={this.state.rate.price}
                              onChange={this.valueUpdater('price')}
                              suffix={<TextStyle variation="strong">{this.props.shop.currency}</TextStyle>}
                              />
                          }
                          />
                          <TextField
                            label="Description"
                            name="description"
                            type="text"
                            value={this.state.rate.description}
                            onChange={this.valueUpdater('description')}
                            multiline
                          />
                    </FormLayout>
                  </form>
                </Card>
                <Card
                  title="Other Rates"
                  sectioned
                  actions={ [{
                    content: (
                    <Button icon='add'>
                      New rate
                    </Button>),
                    onAction: () => { this.handleEdit() }
                  }] }
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
          <Alert
            title="Delete Delivery Rate?"
            open={this.state.deleteAlertOpen}
            confirmContent="Delete"
            onConfirm={() => {
              this.handleDelete(this.state.rateToDelete)
              this.setState({deleteAlertOpen: false, rateToDelete: null})
              }}
            cancelContent="Continue editing"
            onCancel={() => this.setState({deleteAlertOpen: false})}
          >
            Are you sure you want to delete this rate?
          </Alert>
        </Page>
      </EmbeddedApp>
    );
  }

  valueUpdater(field) {
    return (value) => this.setState({ rate: { ...this.state.rate, [field]: value } });
  }

  handleSave() {

    this.rateForm.submit()
  }

  handleCancel() {
    window.location = '/'
  }

  handleEdit(rate) {
    console.log('picker', rate);
    let method = 'post'
    let url = `/rates/`
    let title = 'new'
    let newRate = true

    if (rate) {
      console.log('what?', rate);
      method = 'put'
      url = `/rates/${rate.id}`
      title = rate.title
      newRate = false
    } else {
      rate = {}
    }

    this.setState({
      rate: rate,
      method: method,
      url: url,
      newRate: newRate
    })

    if (history.pushState) {
      history.pushState('', title, url);
    }
  }

  handleDelete(rate) {
    $.ajax({
       type: "DELETE",
       url: `/rates/${rate.id}`,
       success: function (result) {
         this.setState({
           rate: {},
           method: 'post',
           url: '/rates/',
           newRate: true
         })
       },
       error: function (){
         window.alert("something wrong!");
       }
    });
  }



}
export default RateEditor
