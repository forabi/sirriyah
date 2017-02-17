import { connect } from 'react-redux';
import MessageBox from './index';
import Props from './props';

import { sendMessage } from 'client/actions';

export default connect(
  undefined,
  (dispatch: GenericDispatch) => ({
    onSendMessage: (message, publicKey) => dispatch(sendMessage({ message, publicKey }))
  } as Partial<Props>),
)(MessageBox);
