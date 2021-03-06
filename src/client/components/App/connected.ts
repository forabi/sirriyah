import { connect } from 'react-redux';
import App from './index';
import Props from './props';

export default connect((state: StoreState) => ({
  userProfile: state.userProfile,
}))(App);
