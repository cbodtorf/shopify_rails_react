import React from 'react';
import {Page, Card, Banner, FormLayout, Select, Layout, Button, Icon, ResourceList, TextStyle, TextField, Subheading} from '@shopify/polaris';
import {EmbeddedApp, Alert, Bar} from '@shopify/polaris/embedded';
import Condition from './Condition'

import uuid from 'uuid'

class RateEditor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      rate: {},
      method: '',
      url: '',
      newRate: false,
      deleteAlertOpen: false,
      conditions: [],
      conditionsToDelete: []
    }
  }

  componentWillMount() {
    /**
    * @TODO: need to refactor componentWillMount & handleEdit. A little redundant.
    */
    console.log("this", this);
    let method = 'post'
    let url = `/rates`
    let rate = {}
    let newRate = true
    let conditions = []

    if (this.props.rate.id || this.props.rate !== null) {
      method = 'patch'
      url = `/rates/${this.props.rate.id}`
      rate = this.props.rate
      newRate = false
      conditions = this.props.rate.conditions
    } else {
      rate = {}
    }

    this.setState({
      rate: rate,
      method: method,
      url: url,
      newRate: newRate,
      conditions: conditions
    })
  }

  render() {
    console.log("render", this.state);

    const rates = this.props.rates.map(rate => {
      return (
        {
          media: <Icon
            source={'notes'}
            color={this.state.rate.id === rate.id ? 'blue' : 'black'}
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
    const self = this
    const conditions = this.state.conditions.map((data, i) => {
      data['index'] = i + 1
      return (
        <Condition
          key={i}
          id={data.newCondition ? data.id : i + 1}
          updateCondition={(field, id) => self.handleConditionUpdate(field, id)}
          deleteCondition={(id) => self.handleConditionDelete(id)}
          condition={data} matcher={self.props.matcher}
          />
      );
    })

    const conditionsToDelete = this.state.conditionsToDelete.map((data, i) => {
      if (data.created_at) {
        return (
          <div key={i} style={{'display': 'none'}}>
            <input value={1} type="hidden" name={`rate[conditions_attributes][${data.index}][_destroy]`}/>
            <input value={data.id} type="hidden" name={`rate[conditions_attributes][${data.index}][id]`}/>
          </div>
        )
      }
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
                          name="rate[name]"
                          type="text"
                          value={this.state.rate.name}
                          onChange={this.valueUpdater('name')}
                          connectedRight={
                            <TextField
                              label="Price"
                              name="rate[price]"
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
                            name="rate[description]"
                            type="text"
                            value={this.state.rate.description}
                            onChange={this.valueUpdater('description')}
                            multiline
                          />
                          <Subheading>Conditions </Subheading>
                          <Button size="slim" icon="add" onClick={ this.addCondition() }>New Condition</Button>
                          <div data-condition-list>
                            { conditions }
                            { conditionsToDelete }
                          </div>
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
              this.handleDelete(this.state.rateToDelete).bind(this)
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
    let method = 'post'
    let url = `/rates/`
    let windowUrl = '/rates/'
    let title = 'new'
    let newRate = true
    let conditions = []

    if (rate) {
      console.log('what?', rate);
      method = 'patch'
      url = `/rates/${rate.id}`
      windowUrl = `/rates?id=${rate.id}`
      title = rate.title
      newRate = false
      conditions = rate.conditions
      rate = rate
    } else {
      rate = {}
    }

    this.setState({
      rate: rate,
      method: method,
      url: url,
      newRate: newRate,
      conditions: conditions
    })

    if (history.pushState) {
      history.pushState('', title, windowUrl);
    }
  }

  handleDelete(rate) {
    let self = this
    $.ajax({
       type: "DELETE",
       url: `/rates/${rate.id}`,
       success: function (result) {
         self.setState({
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

  handleConditionUpdate(field, id) {
    return (value) => {
      let conditions = this.state.conditions.map(function(condition, i) {
        if (condition.id !== id) {
          return condition
        } else {
          condition[field] = value
          return condition
        }
      })
      this.setState({conditions: conditions})
    };
  }

  handleConditionDelete(id) {
    console.log('id:', id, 'state', this.state);

    let conditionsToDelete = this.state.conditionsToDelete
    let conditions = this.state.conditions.filter(function(condition, i) {
      if (Number(condition.id) === Number(id)) {
        conditionsToDelete.push(condition)
      }
      return Number(condition.id) !== Number(id)
    })

    this.setState({
      conditions: conditions,
      conditionsToDelete: conditionsToDelete
    })
  }

  addCondition() {
    let arr = this.state.conditions.slice()
    arr.push({
      id: Date.now(),
      rate_id: this.state.rate.id,
      field: '',
      verb: '',
      value: '',
      newCondition: true
    })

    return () => this.setState({conditions: arr});
  }



}
export default RateEditor
