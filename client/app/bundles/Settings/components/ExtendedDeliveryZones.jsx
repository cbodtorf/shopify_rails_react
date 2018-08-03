import React from 'react';
import {ActionList, Page, Popover, Card, Checkbox, ChoiceList, Banner, FormLayout, Select, Layout, Button, Icon, ResourceList, TextStyle, TextField, Subheading, Tabs, Tag, Link, DatePicker, Badge, Stack} from '@shopify/polaris';
import {EmbeddedApp, Alert, Bar} from '@shopify/polaris/embedded';

import Navigation from '../../Global/components/Navigation';
import ModalForm from '../../Global/components/ModalForm';
import DatePopover from '../../Global/components/DatePopover';
import bambooIcon from 'assets/green-square.jpg';

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const weekNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

class ExtendedDeliveryZones extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      method: '',
      formUrl: '',
      deleteAlertOpen: false,
      extendedDeliveryZone: {},
      extendedDeliveryZones: this.props.extendedDeliveryZones,
      editModal: false,
      titleErrors: false,
      dateErrors: false,
      postalCodesErrors: false,
      postal_code: '',
      popOverActive: false
    }
  }
  /**
  * Helps to format Dates input single d, outputs dd.
  * ie. addZ(2) => '02'
  */
  addZ(n){return n<10? '0'+n:''+n;}

  componentWillMount() {
    console.log("this", this);
  }

  render() {
    console.log("render", this.state);

    let postalCodesErrors = false
    if (this.state.postalCodesErrors) {
      postalCodesErrors = (
        <div className="Polaris-Labelled__Error">
          <div className="Polaris-Labelled__ErrorIcon">
            <Icon source="alert" color="red" />
          </div>
          { this.state.postalCodesErrors }
        </div>
      )
    }

    const extendedDeliveryZones = this.state.extendedDeliveryZones.map(extendedDeliveryZone => {
      let dropDate = new Date(extendedDeliveryZone.date.replace(/-/g, '/'));

      return (
        {
          attributeOne: extendedDeliveryZone.title,
          attributeTwo: <TextStyle variation="subdued">{ dropDate.toLocaleDateString() }</TextStyle>,
          attributeThree: <TextStyle variation="subdued">{ extendedDeliveryZone.enabled }</TextStyle>,
          badges: extendedDeliveryZone.postal_codes.map((code, i) => { return ({ content: code, status: "info", key: i }) }),
          actions: [
            { content: 'Edit zone', onAction: () => { this.handleEdit(extendedDeliveryZone) } },
            { content: <Icon source="delete" color="red" />, onAction: () => { this.setState({ deleteAlertOpen: true, extendedDeliveryZoneToDelete: extendedDeliveryZone }) } },
          ],
          persistActions: true,
        }
      )
    })

    let ratesChoices = []
    if (this.props.rates) {
      ratesChoices = this.props.rates.filter(r => r.code === "extended").map((rate, idx) => {
        return (
          {
            key: idx,
            label: `[${rate.id}] ${rate.title} - $${rate.price / 100} - ${rate.receive_window}`,
            value: rate.id
          }
        )
      })
    }


    let zipCodes = []
    let zipCodesInputs = []
    if (this.state.extendedDeliveryZone.postal_codes) {
      zipCodes = this.state.extendedDeliveryZone.postal_codes.map((zone, idx, arr) => {
        return (
          <Tag
            key={ idx }
            onRemove={ () => {
              let zones = [...arr]
              zones.pop(zones.indexOf(zone))
              console.log("zones", zones)
              this.setState({
                extendedDeliveryZone: { ...this.state.extendedDeliveryZone, postal_codes: zones }
              })
            } }
          >
          { zone }
          </Tag>
        )
      })
      zipCodesInputs = this.state.extendedDeliveryZone.postal_codes.map((zone, idx) => {
        return (
          <input key={ idx } type="hidden" name="extended_delivery_zone[postal_codes][]" value={ zone } />
        )
      })
    } else {
      zipCodes.push(
        (
          <Badge key={ 1 }>Currently there are no available zip codes</Badge>
        )
      )
    }

    let dropDate = new Date();
    if (this.state.extendedDeliveryZone.date) {
      console.log('drop I', this.state.extendedDeliveryZone.date)
      dropDate = new Date(this.state.extendedDeliveryZone.date.replace(/-/g, '/'));
      console.log('drop II', dropDate)
      dropDate = `${weekNames[dropDate.getDay()]}, ${monthNames[dropDate.getMonth()]} ${dropDate.getDate()}, ${dropDate.getFullYear()}`;
      console.log('drop III', dropDate)
    }

    return (
      <div className="bamboo-settings">
      <EmbeddedApp
        apiKey={ this.props.apiKey }
        shopOrigin={ this.props.shopOrigin }
        forceRedirect={ false }
      >
        <Page icon={ bambooIcon }>
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={ null } shop={this.props.shop_session.url}/>
            </Layout.Section>

            <Layout.AnnotatedSection
              title="Extended Delivery Zones"
              description={
                <div>
                  <div>Add special zip codes to be temporarily available for delivery. System will automatically allow delivery for the zip codes the 5 days before the delivery date.</div>
                  <br />
                  <div>Example - Birmingham delivery.</div>
                  <Button onClick={ () => {
                    this.setState({
                      extendedDeliveryZone: {},
                      method: 'post',
                      formUrl: '/create_extended_delivery_zone',
                      editModal: true
                    })
                  } }>Create new extended delivery zone</Button>
                </div>
              }
            >
              <Card
                sectioned
              >
                <ResourceList
                  items={ extendedDeliveryZones }
                  renderItem={ (item, index) => {
                    return <ResourceList.Item key={ index } { ...item } />;
                  } }
                />
              </Card>
            </Layout.AnnotatedSection>
          </Layout>
          <Alert
            title="Delete Extended Delivery Zone?"
            open={ this.state.deleteAlertOpen }
            confirmContent="Delete"
            onConfirm={ () => {
              this.handleDelete(`/destroy_extended_delivery_zone?id=${this.state.extendedDeliveryZoneToDelete.id}`).bind(this)
              this.setState({ deleteAlertOpen: false, extendedDeliveryZoneToDelete: null })
              } }
            cancelContent="Continue editing"
            onCancel={ () => this.setState({ deleteAlertOpen: false }) }
          >
            Are you sure you want to delete this extended delivery zone?
          </Alert>
          <ModalForm
            open={ this.state.editModal }
            onClose={ () => this.setState({ editModal: false }) }
            onSave={ () => this.handleSave(this.extendedDeliveryZoneForm) }
            title="Delivery Zone"
          >
            <div className="modal-form-container delivery-zone-modal">
              <FormLayout>
                <Checkbox
                  label="Enable this Zone"
                  name="extended_delivery_zone[enabled]"
                  checked={ this.state.extendedDeliveryZone.enabled }
                  onChange={ this.valueUpdater('enabled', 'extendedDeliveryZone') }
                />
              </FormLayout>
              <form
                action={ this.state.formUrl }
                acceptCharset="UTF-8" method="post"
                ref={ (form) => { this.extendedDeliveryZoneForm = form } }
                >
                <FormLayout>
                  <input name="utf8" type="hidden" value="✓" />
                  <input type="hidden" name="_method" value={ this.state.method } />
                  <input type="hidden" name="authenticity_token" value={ this.props.form_authenticity_token } />
                  <input type="hidden" name="extended_delivery_zone[enabled]" value={ this.state.extendedDeliveryZone.enabled } />
                  { zipCodesInputs }
                  <TextField
                    label="Zone Name"
                    name="extended_delivery_zone[title]"
                    type="text"
                    error={ this.state.titleErrors }
                    value={ this.state.extendedDeliveryZone.title }
                    onChange={ this.valueUpdater('title', 'extendedDeliveryZone') }
                  />
                  <TextField
                    label="Date"
                    name="extended_delivery_zone[date]"
                    readOnly
                    helpText="Click calendar icon to select a date"
                    error={ this.state.dateErrors }
                    value={ dropDate }
                    onChange={ this.valueUpdater('date', 'extendedDeliveryZone') }
                    connectedRight={
                      <DatePopover handleDateChange={ (selected) => {
                        let zone = this.state.extendedDeliveryZone
                        zone.date = `${weekNames[selected.getDay()]}, ${monthNames[selected.getMonth()]} ${selected.getDate()}, ${selected.getFullYear()}`;
                        this.setState({
                          extendedDeliveryZone: zone
                        })
                       } }/>
                    }
                  />
                  <ChoiceList
                    allowMultiple
                    title="Rates"
                    name="extended_delivery_zone[rate_ids]"
                    choices={ ratesChoices }
                    selected={ this.state.extendedDeliveryZone.rate_ids ? this.state.extendedDeliveryZone.rate_ids : [] }
                    onChange={ this.valueUpdater('rate_ids', 'extendedDeliveryZone') }
                  />
                </FormLayout>
              </form>

              <TextField
                label="Available zip codes"
                name="extended_delivery_zone[postal_codes]"
                type="text"
                minLength={ 5 }
                error={ this.state.postalCodesErrors }
                value={ this.state.postal_code }
                onChange={ (value) => {
                  this.setState({postal_code: value})
                } }
                connectedRight={
                  <Button
                    icon="add"
                    onClick={ this.pushValue('postal_codes', 'extendedDeliveryZone', this.state.postal_code) }
                  >
                  </Button>
                }
              />
              <FormLayout>
                <Stack>
                  { zipCodes }
                </Stack>
              </FormLayout>
            </div>
          </ModalForm>
        </Page>
      </EmbeddedApp>
      </div>
    );
  }
  valueUpdater(field, namespace) {
    return (value) => this.setState({ [namespace]: { ...this.state[namespace], [field]: value } });
  }

  pushValue(field, namespace, value) {
    return () => {
      console.log('value', value);
      let vals = this.state[namespace][field] || [];
      vals.push(value)
      console.log('vals', vals);
      this.setState({ [namespace]: { ...this.state[namespace], [field]:  vals } })
    }
  }

  valid5DigitZipCodes(str) {
    if (! /^\d{5}(?:,\s*\d{5})*$/.test(str)) {
      this.setState({zipErrors: "You need a valid zip code"})
      return false;
    } else if (! /(?:(\d{5}),?)(?!.*\1)/.test(str)) {
      this.setState({zipErrors: "You entered a duplicate zip code"})
      return false;
    }

    return true;
  };

  handleEdit(zone) {
    let extendedDeliveryZone = { ...zone }
    extendedDeliveryZone.postal_codes = extendedDeliveryZone.postal_codes.map(code => { return code })
    console.log("extendedDeliveryZone: ", extendedDeliveryZone)

    this.setState({
      extendedDeliveryZone,
      title: zone.title,
      method: 'patch',
      formUrl: `/update_extended_delivery_zone/${zone.id}`,
      editModal: true,
      titleErrors: false,
      dateErrors: false,
      postalCodesErrors: false
    })
  }

  handleSave(formType) {
    let self = this
    let postalCodesRule = this.state.extendedDeliveryZone.postal_codes === [] || this.state.extendedDeliveryZone.postal_codes === undefined || this.state.extendedDeliveryZone.postal_codes === null
    let dateRule = this.state.extendedDeliveryZone.date === "" || this.state.extendedDeliveryZone.date === undefined || this.state.extendedDeliveryZone.date === null
    let titleRule = this.state.extendedDeliveryZone.title === "" || this.state.extendedDeliveryZone.title === undefined || this.state.extendedDeliveryZone.title === null
    if (postalCodesRule) {
      self.setState({postalCodesErrors: "Must select at least one zip code."})
    } else {
      self.setState({postalCodesErrors: false})
    }
    if (dateRule) {
      self.setState({dateErrors: "Must enter in an date."})
    } else {
      self.setState({dateErrors: false})
    }
    if (titleRule) {
      self.setState({titleErrors: "Must enter a title for extended delivery zone."})
    } else {
      self.setState({titleErrors: false})
    }

    if(!postalCodesRule && !dateRule && !titleRule){
      formType.submit()
    }
  }

  handleDelete(url) {
    let self = this
    $.ajax({
       type: "DELETE",
       url: url,
       success: function (result) {
       },
       error: function (result){
         console.console.log('meh', result);
         window.alert("something went wrong!");
       }
    });
  }

}
export default ExtendedDeliveryZones
