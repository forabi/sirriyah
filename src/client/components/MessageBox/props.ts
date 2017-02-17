export type OwnProps = {
  userId: string;
};

export type StateProps = {
  publicKey: CryptoKey;
  displayName: string;
};

export type DispatchProps = {
  onSendMessage: (
    message: MessageWithStatus<'outgoing', 'unsent', 'decrypted'>,
    publicKey: CryptoKey
  ) => any;
};

export type Props = StateProps & DispatchProps & OwnProps;

export default Props;
