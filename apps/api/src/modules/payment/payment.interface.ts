import { ENUM_VNPAY_COMMAND } from './payment.contant';

export interface SortedObject<T> {
  [key: string]: T;
}

export interface CreatePaymentUrlParams {
  ipAddr: string;
  totalPrice: number;
  createdAt: Date;
  vnpTxnRef: string;
}

export interface VnpParams extends SortedObject<string | number> {
  vnp_Version: string;
  vnp_TmnCode: string;
  vnp_Locale: string;
  vnp_CurrCode: string;
  vnp_ReturnUrl: string;
  vnp_IpAddr: string;
  vnp_Command: ENUM_VNPAY_COMMAND;
  vnp_OrderType: string;
  vnp_OrderInfo: string;
  vnp_Amount: number;
  vnp_CreateDate: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

export interface VnpQueryParams extends SortedObject<string | number> {
  vnp_Amount: number;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  vnp_SecureHashType: string;
}
