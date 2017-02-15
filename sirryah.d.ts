type MessageType = 'incoming' | 'outgoing';

type MessageStatus = {
  incoming: 'decrypting' | 'unread' | 'read';
  outgoing: 'unsent' | 'encrypting' | 'sending' | 'sent' | 'delivered' | 'seen';
};

type LocalMessage<T extends MessageType> = {
  localId: string;
  date: Date;
  text: string;
  type: T;
  status: MessageStatus[T];
}

type MessageWithStatus<T extends MessageType, S extends MessageStatus[T]> = LocalMessage<T> & { status: S };

type UserProfile = {
  email: string;
  displayName: string;
};

type EditableUserData = 'email' | 'displayName';

type StoreState = {
  userId: string | null;
  token: string | null;
  userProfile: UserProfile | null;
  publicKey: Blob | null;
  inMemoryMessages: {
    [id: string]: LocalMessage<MessageType>;
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
  publicKey: Blob;
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
  SEND_MESSAGE_REQUESTED: MessageWithStatus<'outgoing', 'unsent'>;
  SEND_MESSAGE_FAILED: GenericError & Pick<LocalMessage<'outgoing'>, 'localId'>;
  SEND_MESSAGE_SUCCEEDED: MessageWithStatus<'outgoing', 'sent'>;
  MESSAGE_DETAILS_CHANGED: Pick<LocalMessage<MessageType>, 'localId' | 'status'>;
  MESSAGE_RECEIVED: LocalMessage<'incoming'>;
  UPDATE_USER_DATA_REQUESTED: Pick<UserProfile, EditableUserData>;
  GENERATE_KEYS_REQUESTED: void;
  GENERATE_KEYS_SUCCEEDED: {
    publicKey: Blob;
    privateKey: Blob;
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
