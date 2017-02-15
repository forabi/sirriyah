import * as React from 'react';
import Props from './props';

const App = ({ userProfile }: Props) => (
  <div>Hello {userProfile!.displayName}!</div>
);

export default App;
