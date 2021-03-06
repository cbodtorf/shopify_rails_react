import React from 'react';
import {Page, Card, Layout, Stack, Button, Heading, Tag, FormLayout, TextField} from '@shopify/polaris';
import {EmbeddedApp, Alert, Bar} from '@shopify/polaris/embedded';

import Navigation from '../../Global/components/Navigation';
import ModalForm from '../../Global/components/ModalForm';
import bambooIcon from 'assets/green-square.jpg';

class PostalCodes extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      deleteAlertOpen: false,
      postalCode: {},
      postalCodes: this.props.postalCodes,
      editModal: false,
      zipErrors: false
    }
  }

  componentWillMount() {
    console.log("this", this);
  }

  render() {
    let codes = this.state.postalCodes.map((code,i) => {
      return (
        <Tag
          key={ i }
          onRemove={ () => { this.setState({ deleteAlertOpen: true, postalCodeToDelete: code }) } }
        >
          { code.title }
        </Tag>
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
              <Navigation selectedTab={ 0 } shop={this.props.shop_session.url}/>
            </Layout.Section>

            <Layout.AnnotatedSection
              title="Postal Codes"
              description={
                <div>
                  <div>
                    "Determine the postal codes in which your delivery rates will be valid. Enter a 5 digit zip code [ex. 30076] or a comma separated list [ex. 30076,30002,30030,30032,30067]"
                  </div>
                  <br />
                  <Button onClick={ () => {
                    this.setState({
                      postalCode: {},
                      method: 'post',
                      editModal: true
                    })
                  } }>Add Postal Code</Button>
                </div>
              }
            >
              <div className="postalCodes">
                <Heading>Postal Codes</Heading>
                <Card sectioned>
                  <Stack
                    spacing="loose"
                    distribution="baseline"
                    >
                    { codes }
                  </Stack>
                </Card>
              </div>
            </Layout.AnnotatedSection>

          </Layout>
          <Alert
            title="Delete Postal Code?"
            open={ this.state.deleteAlertOpen }
            confirmContent="Delete"
            onConfirm={ () => {
              this.handleDelete(`/destroy_postal_code?id=${this.state.postalCodeToDelete.id}`).bind(this)
              this.setState({ deleteAlertOpen: false, postalCodeToDelete: null })
              } }
            cancelContent="Continue editing"
            onCancel={ () => this.setState({ deleteAlertOpen: false }) }
          >
            Are you sure you want to delete this postal code?
          </Alert>
          <ModalForm
            open={ this.state.editModal }
            onClose={ () => this.setState({ editModal: false }) }
            onSave={ () => this.handleSave(this.postalCodeForm) }
            title="Postal Code"
          >
            <div className="modal-form-container">
              <form
                action='/create_postal_code'
                acceptCharset="UTF-8" method="post"
                ref={ (form) => { this.postalCodeForm = form } }
                >
                  <FormLayout>
                    <input name="utf8" type="hidden" value="✓" />
                    <input type="hidden" name="_method" value={ this.state.postalCodeMethod } />
                    <input type="hidden" name="authenticity_token" value={ this.props.form_authenticity_token } />
                    <TextField
                      label="Postal Code"
                      name="postal_code[title]"
                      type="text"
                      error={ this.state.zipErrors }
                      multiline
                      value={ this.state.postalCode.title }
                      onChange={ this.valueUpdater('title', 'postalCode') }
                    />
                  </FormLayout>
                </form>
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

  handleSave(formType) {
    console.log('form', formType["postal_code[title]"].value)
    if (this.valid5DigitZipCodes(formType["postal_code[title]"].value)) {
      formType.submit()
    } else {
      console.log('err: need to enter a valid zip code or comma delimited list of zip codes')
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
export default PostalCodes
