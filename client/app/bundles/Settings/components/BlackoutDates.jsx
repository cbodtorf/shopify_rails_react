import React from 'react';
import {Page, Card, Banner, DatePicker, FormLayout, Select, Layout, Button, Icon, ResourceList, DisplayText, TextStyle, TextField, Subheading, Tabs, Link, ChoiceList, Badge} from '@shopify/polaris';
import {EmbeddedApp, Alert, Modal} from '@shopify/polaris/embedded';
import Navigation from '../../Global/components/Navigation';
import ModalForm from '../../Global/components/ModalForm';
import bambooIcon from 'assets/green-square.jpg';


const weekNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

class BlackoutDates extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      deleteAlertBlackoutOpen: false,
      datePickerMonth: new Date().getMonth(),
      datePickerYear: new Date().getUTCFullYear(),
      datePickerSelected: null,
      blackoutDate: {
        blackout_date: undefined,
        title: undefined,
        wday: undefined,
        day: undefined,
        month: undefined,
        year: undefined
      },
      blackoutDates: [],
      method: 'put',
      formUrl: '/create_blackout_date',
      editModal: false
    }
  }
  /**
  * Helps to format Dates input single d, outputs dd.
  * ie. addZ(2) => '02'
  */
  addZ(n){return n<10? '0'+n:''+n;}

  componentWillMount() {

    this.setState({
      blackoutDates: this.props.blackoutDates,
    })
  }

  render() {
    console.log("render", this.state);
    const blackoutDates = this.state.blackoutDates.map(date => {
      let d = new Date(date.blackout_date)
      let utc = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),  d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds())
      return (
        {
          attributeOne: date.title,
          attributeTwo: utc.toLocaleDateString(),
          actions: [
            {content: 'Edit date', onAction: () => this.setState({
              editModal: true,
              method: 'patch',
              formUrl: `/update_blackout_date/${date.id}`,
              datePickerSelected: utc,
              blackoutDate: {
                blackout_date: utc,
                title: date.title,
                wday: weekNames[utc.getDay()],
                day: this.addZ(utc.getDate()),
                month: this.addZ(utc.getMonth() + 1),
                year: utc.getFullYear()
              }
            }) },
            { content: <Icon source="delete" color="red" />, onAction: () => { this.setState({ deleteAlertBlackoutOpen: true, dateToDelete: date }) } },
          ],
          persistActions: true,
        }
      )
    })

    return (
      <div className="bamboo-settings">
      <EmbeddedApp
        apiKey={ this.props.apiKey }
        shopOrigin={ this.props.shopOrigin }
        forceRedirect={ true }
      >
        <Page icon={ bambooIcon }>
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={ null }/>
            </Layout.Section>
            <Layout.AnnotatedSection
              title="Blackout Dates"
              description={
                <div>
                  <div>
                    Customers will be unable to select these dates for their deliveries.<br /><br />

                    Click the 'New' button to open a popup in order to create a new blackout date.
                  </div>
                  <Button onClick={ () => {
                    this.setState({
                      editModal: true,
                      method: 'post',
                      url: '/create_blackout_date',
                      datePickerSelected: null,
                      blackoutDate: {
                        blackout_date: undefined,
                        title: undefined,
                        wday: undefined,
                        day: undefined,
                        month: undefined,
                        year: undefined
                      }
                    })
                  } }>Create new blackout date</Button>
                </div>
              }
            >
              <Card
                sectioned
                >
                <ResourceList
                  items={ blackoutDates }
                  renderItem={ (item, index) => {
                    return <ResourceList.Item key={ index } { ...item } />;
                  } }
                />
              </Card>
            </Layout.AnnotatedSection>
          </Layout>
          <Alert
            title="Delete Blackout Date?"
            open={ this.state.deleteAlertBlackoutOpen }
            confirmContent="Delete"
            onConfirm={ () => {
              this.handleDelete(`/destroy_blackout_date?id=${this.state.dateToDelete.id}`).bind(this)
              this.setState({ deleteAlertBlackoutOpen: false, dateToDelete: null })
              } }
            cancelContent="Continue editing"
            onCancel={ () => this.setState({ deleteAlertBlackoutOpen: false }) }
          >
            Are you sure you want to delete this blackout date?
          </Alert>

          <ModalForm
            open={ this.state.editModal }
            onClose={ () => this.setState({ editModal: false }) }
            onSave={ () => this.handleSave(this.blackoutDateForm) }
            title="Blackout Date"
          >
            <div>
              <form
                action={ this.state.formUrl }
                acceptCharset="UTF-8" method="post"
                ref={ (form) => { this.blackoutDateForm = form } }
                >
                <FormLayout>
                  <input name="utf8" type="hidden" value="✓" />
                  <input type="hidden" name="_method" value={ this.state.method } />
                  <input type="hidden" name="authenticity_token" value={ this.props.authenticity_token } />
                  <input type="hidden" name="blackout_date[blackout_date]" value={ this.state.blackoutDate.blackout_date ? `${this.state.blackoutDate.day}-${this.state.blackoutDate.month}-${this.state.blackoutDate.year}` : '' } />
                  <TextField
                    label="Blackout Date Title"
                    name="blackout_date[title]"
                    type="text"
                    value={ this.state.blackoutDate.title }
                    onChange={ this.valueUpdater('title', 'blackoutDate') }
                  />
                </FormLayout>
              </form>
              <br />
              <br />
              <DatePicker
                month={ this.state.datePickerMonth }
                year={ this.state.datePickerYear }
                selected={ this.state.datePickerSelected }
                disableDatesBefore={ new Date() }
                onChange={ (selected) => { this.dateChange(selected) } }
                onMonthChange={ (month,year) => { this.monthChange(month,year) } }
              />
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

  monthChange(month, year) {

    this.setState({
      datePickerMonth: month,
      datePickerYear: year
    })
  }

  dateChange(selected) {

    let d = selected.end
    this.setState({
      datePickerSelected: d,
      blackoutDate: {
        blackout_date: d,
        title: this.state.blackoutDate.title,
        wday: weekNames[d.getDay()],
        day: this.addZ(d.getDate()),
        month: this.addZ(d.getMonth() + 1),
        year: d.getFullYear()
      }
    })
  }

  handleSave(formType) {
    formType.submit()
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
export default BlackoutDates
