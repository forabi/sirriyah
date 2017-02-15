import { connect } from 'react-redux';
import App from './index';
import Props from './props';

export default connect((state: AppProps) => ({
  hello: state.hello,
}))(App);
