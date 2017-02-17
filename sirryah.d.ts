type MessageType = 'incoming' | 'outgoing';

type MessageStatus = {
  incoming: 'unprocessed' | 'decrypting' | 'unread' | 'read';
  outgoing: 'unsent' | 'encrypting' | 'sending' | 'sent' | 'delivered' | 'seen';
};

type Payloads = {
  encrypted: {
    payload: ArrayBuffer;
    iv: ArrayBufferView;
  };
  decrypted: {
    date: Date;
    text: string;
  };
}

type MessagePropsByType = {
  incoming: { };
  outgoing: {
    to: string;
  };
}

type MessageProps<T extends MessageType> = MessagePropsByType[T];

type EncryptionStatus = 'encrypted' | 'decrypted';

type Payload<S extends EncryptionStatus> = Payloads[S];

type LocalMessage<
  T extends MessageType,
  E extends EncryptionStatus
> = MessageProps<T> & {
  localId: string;
  type: T;
  status: MessageStatus[T];
} & Payload<E>;

type MessageWithStatus<
  T extends MessageType,
  S extends MessageStatus[T],
  E extends EncryptionStatus
> = LocalMessage<T, E> & { status: S };

type Encryptor = (
  message: MessageWithStatus<'outgoing', 'unsent', 'decrypted'>,
  publicKey: CryptoKey
) => Promise<MessageWithStatus<'outgoing', 'unsent', 'encrypted'>>;

type Decryptor = (
  message: MessageWithStatus<'incoming', 'unprocessed', 'encrypted'>,
  privateKey: CryptoKey
) => Promise<MessageWithStatus<'incoming', 'unread', 'decrypted'>>;


type UserProfile = {
  email: string;
  displayName: string;
};

type EditableUserData = 'email' | 'displayName';

type StoreState = {
  userId: string | null;
  token: string | null;
  userProfile: UserProfile | null;
  publicKey: CryptoKey | null;
  privateKey: CryptoKey | null;
  inMemoryMessages: {
    [id: string]: LocalMessage<MessageType, EncryptionStatus>;
  };
};

type GenericError = {
  message: string;
};

type LoginForm = {
  email: string;
  password: string;
};

type SignUpForm = {
  email: string;
  displayName: string;
  password: string;
  publicKey: JsonWebKey;
};

type Events = {
  CREATE_USER_ACCOUNT_REQUESTED: Pick<SignUpForm, 'email' | 'password' | 'displayName'>;
  CREATE_USER_ACCOUNT_SUCCEEDED: {
    userId: string;
    token: string;
    email: string;
    displayName: string;
  };
  CREATE_USER_ACCOUNT_FAILED: {
    userId: string;
    email: string;
    displayName: string;
  };
  LOGOUT_REQUESTED: void;
  LOGIN_REQUSTED: LoginForm;
  LOGIN_FAILED: GenericError & {
    fields: Record<keyof LoginForm, GenericError>;
  };
  SEND_MESSAGE_REQUESTED: {
    publicKey: CryptoKey,
    message: MessageWithStatus<'outgoing', 'unsent', 'decrypted'>;
  };
  SEND_ENCRYPTED_MESSAGE_REQUESTED: MessageWithStatus<'outgoing', 'unsent', 'encrypted'>;
  SEND_MESSAGE_FAILED: GenericError & Pick<LocalMessage<'outgoing', EncryptionStatus>, 'localId'>;
  MESSAGE_DETAILS_CHANGED: Pick<LocalMessage<MessageType, EncryptionStatus>, 'localId' | 'status'>;
  MESSAGE_RECEIVED: MessageWithStatus<'incoming', 'unprocessed', 'encrypted'>;
  UPDATE_USER_DATA_REQUESTED: Pick<UserProfile, EditableUserData>;
  GENERATE_KEYS_REQUESTED: void;
  GENERATE_KEYS_SUCCEEDED: {
    publicKey: CryptoKey;
    privateKey: CryptoKey;
  };
  GENERATE_KEYS_FAILED: GenericError;
}

type GenericDispatch = (action: GenericAction) => any;

type ActionType = keyof Events;
type StoreKey = keyof StoreState;
type ActionCreator<T extends ActionType> = (payload: Events[T]) => Action<T>;
type GenericActionCreator = ActionCreator<ActionType>;

type GenericAction = {
  type: ActionType;
  payload?: any;
};

type Action<T extends ActionType> = {
  type: T;
  payload: Events[T];
};

type Reducer<S, A extends ActionType> = (state: S, action: Action<A>) => S;

type ReducerMap = {
  [Key in StoreKey]: Reducer<StoreState[Key], ActionType>;
};

type ActionToReducerMap<Key extends StoreKey> = Partial<{
  [A in ActionType]: Reducer<StoreState[Key], A>;
}>;
