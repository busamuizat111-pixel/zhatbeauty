import { ConnectionState, WhatsAppConnectionInfo } from '../../types';

export interface SendMessageResult {
  success: boolean;
  messageId: string;
  timestamp: string;
  error?: string;
}

export interface InboundMessageEvent {
  messageId: string;
  fromPhone: string;
  fromName?: string;
  text: string;
  timestamp: string;
  rawPayload?: any;
}

export interface ConnectResult {
  status: ConnectionState;
  qrCode?: string;
  message?: string;
  phoneNumber?: string;
}

export interface IMessagingAdapter {
  readonly providerName: string;

  /**
   * Initialize or start connection (e.g. initiate QR generation or verify Meta token)
   */
  connect(): Promise<ConnectResult>;

  /**
   * Retrieve current connection status and telemetry
   */
  getConnectionStatus(): Promise<WhatsAppConnectionInfo>;

  /**
   * Disconnect the current session
   */
  disconnect(): Promise<void>;

  /**
   * Send text message to a specific customer phone
   */
  sendTextMessage(toPhone: string, text: string): Promise<SendMessageResult>;

  /**
   * Process raw inbound webhook or socket event
   */
  receiveMessage(payload: any): Promise<InboundMessageEvent | null>;

  /**
   * Get static connection summary
   */
  getConnectionInformation(): WhatsAppConnectionInfo;
}
