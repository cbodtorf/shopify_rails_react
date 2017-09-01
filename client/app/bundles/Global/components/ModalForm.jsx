import React from 'react';
import { Card, Button, Icon, Link } from '@shopify/polaris';

class ModalForm extends React.Component {
  constructor(props) {
    super(props)

  }

  render() {
    return (
      <div>
        <div className={`ui-modal-backdrop ${this.props.open ? 'ui-modal-backdrop--is-visible' : ''}`}>
        </div>
        <div className={`ModalForm__Bamboo ui-modal-contents ${this.props.open ? 'ui-modal-contents--is-visible' : ''}`}>
          <div className={`ui-modal ${this.props.open ? 'ui-modal--is-visible' : ''}`}>
            <Card
              title={this.props.title}
              sectioned
              actions={[{content: <Icon color="inkLight" source="cancel" />, onAction: () => this.props.onClose() }]}
              primaryFooterAction={{content: 'Save', onAction: () => { this.props.onSave() } }}
            >
              {this.props.children}
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default ModalForm
