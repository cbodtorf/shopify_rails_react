import React from 'react';
import {Page, Card, Banner, FormLayout, Select, Layout, Button, Icon, ResourceList, TextStyle, TextField, Subheading, Tabs, Link} from '@shopify/polaris';
import {EmbeddedApp, Alert, Bar} from '@shopify/polaris/embedded';

import Condition from './Condition'
import Navigation from '../../Global/components/Navigation';
import ModalForm from '../../Global/components/ModalForm';
import bambooIcon from 'assets/green-square.jpg';

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
      conditionsToDelete: [],
      tab: 1,
      editModal: false,
      titleErrors: false
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

    if (this.props.rate) {
      console.log('meh');
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

    {/* ADMIN ONLY - NO DELETE RATES - was in actions array */}
    {/* {content: <Icon source="delete" color="red" />, onAction: () => { this.setState({ deleteAlertOpen: true, rateToDelete: rate }) } } */}
    const rates = this.props.rates.map(rate => {
      return (
        {
          media: <Icon
            source={ 'notes' }
            color={ this.state.rate.id === rate.id ? 'blue' : 'black' }
          />,
          attributeOne: `${rate.title} - ${rate.price / 100.0} ${this.props.shop.currency}`,
          attributeTwo: <TextStyle variation="subdued">{ rate.description }</TextStyle>,
          actions: [
            {content: 'Edit rate', onAction: () => { this.handleEdit(rate) }}
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
          key={ i }
          id={ data.newCondition ? data.id : i + 1 }
          updateCondition={ (field, id) => self.handleConditionUpdate(field, id) }
          deleteCondition={ (id) => self.handleConditionDelete(id) }
          condition={ data } matcher={ self.props.matcher }
          />
      );
    })

    const conditionsToDelete = this.state.conditionsToDelete.map((data, i) => {
      if (data.created_at) {
        return (
          <div key={ i } style={ { 'display': 'none' } }>
            <input value={ 1 } type="hidden" name={ `rate[conditions_attributes][${data.index}][_destroy]` }/>
            <input value={ data.id } type="hidden" name={ `rate[conditions_attributes][${data.index}][id]` }/>
          </div>
        )
      }
    })


    return (
      <EmbeddedApp
        apiKey={ this.props.apiKey }
        shopOrigin={ this.props.shopOrigin }
        forceRedirect={ true }
      >
        <Page icon={ bambooIcon }>
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={ 3 } shop={this.props.shop_session.url}/>
            </Layout.Section>

            <Layout.Section>
                {/* ADMIN ONLY - NO NEW RATES */}
                <Card
                  title="My Rates"
                  sectioned
                  actions={ [{
                    content: (
                    <div className="admin-only hide">
                    <Button disabled icon='add'>
                      New rate
                    </Button></div>),
                    onAction: () => { this.handleEdit() }
                  }] }
                >
                  <ResourceList
                    items={ rates }
                    renderItem={ (item, index) => {
                      return <ResourceList.Item key={ index } { ...item } />;
                    }}
                  />
                </Card>
            </Layout.Section>
          </Layout>
          <Alert
            title="Delete Delivery Rate?"
            open={ this.state.deleteAlertOpen }
            confirmContent="Delete"
            onConfirm={ () => {
              this.handleDelete(this.state.rateToDelete).bind(this)
              this.setState({ deleteAlertOpen: false, rateToDelete: null })
              } }
            cancelContent="Continue editing"
            onCancel={ () => this.setState({ deleteAlertOpen: false }) }
          >
            Are you sure you want to delete this rate?
          </Alert>
          <ModalForm
            open={ this.state.editModal }
            onClose={ () => this.setState({ editModal: false }) }
            onSave={ () => this.handleSave() }
            title={ this.state.rate.title || " " }
          >
            <div class="modal-form-container">
              <form
                action={ this.state.url }
                acceptCharset="UTF-8" method="post"
                ref={ (form) => { this.rateForm = form } }
                >
                <FormLayout>
                    <input name="utf8" type="hidden" value="✓" />
                    <input type="hidden" name="_method" value={ this.state.method } />
                    <input type="hidden" name="authenticity_token" value={ this.props.form_authenticity_token } />
                    <TextField
                      label="Title"
                      name="rate[title]"
                      type="text"
                      error={ this.state.titleErrors }
                      value={ this.state.rate.title || '' }
                      onChange={ this.valueUpdater('title') }
                      connectedRight={
                        <TextField
                          label="Price"
                          name="rate[price]"
                          type="number"
                          labelHidden
                          prefix={ <TextStyle variation="strong">Price: </TextStyle> }
                          value={ this.state.rate.price || '0' }
                          onChange={ this.valueUpdater('price') }
                          suffix={ <TextStyle variation="strong">{ this.props.shop.currency }</TextStyle> }
                          />
                      }
                      />
                      <TextField
                        label="Description"
                        name="rate[description]"
                        type="text"
                        value={ this.state.rate.description || '' }
                        onChange={ this.valueUpdater('description') }
                        multiline
                      />
                      {/* ADMIN ONLY FIELDS HIDING FROM VIEW */}
                      <div className="admin-only hide">
                        <TextField
                          label="Min Price"
                          name="rate[min_price]"
                          type="number"
                          value={ this.state.rate.min_price || '' }
                          onChange={ this.valueUpdater('min_price') }
                          suffix={ <TextStyle variation="strong">{ this.props.shop.currency }</TextStyle> }
                        />
                        <TextField
                          label="Max Price"
                          name="rate[max_price]"
                          type="number"
                          value={ this.state.rate.max_price || '' }
                          onChange={ this.valueUpdater('max_price') }
                          suffix={ <TextStyle variation="strong">{ this.props.shop.currency }</TextStyle> }
                        />
                        <TextField
                          label="Cutoff Time (Hour of day between 0-23)"
                          name="rate[cutoff_time]"
                          type="number"
                          minLength={ 2 }
                          maxLength={ 2 }
                          max={ 23 }
                          min={ 0 }
                          value={ this.state.rate.cutoff_time || '' }
                          onChange={ this.valueUpdater('cutoff_time') }
                        />
                        <Select
                          label="Cook Time"
                          name="rate[cook_time]"
                          options={ [
                            { label: 'N/A', value: null },
                            { label: 'Morning of delivery', value: 'morning' },
                            { label: 'Afternoon before delivery', value: 'afternoon' }
                          ] }
                          value={ this.state.rate.cook_time || '' }
                          onChange={ this.valueUpdater('cook_time') }
                          placeholder="Select"
                        />
                        <Select
                          label="Delivery Method"
                          name="rate[delivery_method]"
                          options={ [
                            { label: 'Delivery', value: 'delivery' },
                            { label: 'Pickup', value: 'pickup' },
                            { label: 'Shipping', value: 'shipping' }
                          ] }
                          value={ this.state.rate.delivery_method || '' }
                          onChange={ this.valueUpdater('delivery_method') }
                          placeholder="Select"
                        />
                        <Select
                          label="Delivery Type"
                          name="rate[delivery_type]"
                          options={ [
                            { label: 'Next Day', value: 'next_day' },
                            { label: 'Same Day', value: 'same_day' },
                            { label: 'Subscription', value: 'subscription' }
                          ] }
                          value={ this.state.rate.delivery_type || '' }
                          onChange={ this.valueUpdater('delivery_type') }
                          placeholder="Select"
                        />
                        <Subheading>Conditions</Subheading>
                        <Button size="slim" icon="add" onClick={ this.addCondition() }>New Condition</Button>
                        <div data-condition-list>
                          { conditions }
                          { conditionsToDelete }
                        </div>
                      </div>
                      {/* END ADMIN ONLY FIELDS */}
                </FormLayout>
              </form>
            </div>
          </ModalForm>
        </Page>
      </EmbeddedApp>
    );
  }

  valueUpdater(field) {
    return (value) => this.setState({ rate: { ...this.state.rate, [field]: value } });
  }

  handleSave() {

    if (this.state.rate.title === "" || this.state.rate.title  === undefined || this.state.rate.title  === null) {
      this.setState({titleErrors: "Must enter a title for rate."})
    } else {
      this.setState({titleErrors: false})

      this.rateForm.submit()
    }
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
      conditions: conditions,
      editModal: true
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
