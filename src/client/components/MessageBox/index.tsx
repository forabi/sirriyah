import * as React from 'react';
import Props from './props';

import { createMessageId } from 'client/utils';

type State = {
  text: string;
}

class MessageBox extends React.PureComponent<Props, State> {
  constructor(...args: any[]) {
    super(...args);
    this.state = {
      text: '',
    };
  };

  handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = this.state.text.trim();
    if (text.length == 0) {
      return;
    }
    const { onSendMessage, publicKey, userId: to } = this.props;
    onSendMessage(
      {
        localId: createMessageId(),
        to,
        date: new Date,
        text: this.state.text,
        status: 'unsent',
        type: 'outgoing',
      },
      publicKey,
    );
  }

  updateInput = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const text = (e.target as HTMLTextAreaElement).value;
    this.setState({ text });
  }

  render() {
    const { displayName } = this.props;
    return (
      <form action="/send" method="POST" onSubmit={this.handleSubmit}>
        <textarea
          required
          onInput={this.updateInput}
          placeholder={`اكتب رسالة مشفّرة لـ${displayName}`}
          value={this.state.text}
        />
      </form>
    );
  }
}

export default MessageBox;
