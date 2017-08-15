import React from 'react';
import {Layout, Card} from '@shopify/polaris';

class FormSuccess extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {

    return (
          <Layout>
            <Layout.Section>
            <Card
              title="Success"
              sectioned
              >
              <p>Great you just updated that thing.</p>
              </Card>
            </Layout.Section>
          </Layout>
    );
  }

}
export default FormSuccess
