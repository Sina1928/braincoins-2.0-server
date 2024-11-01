export interface Balance {
  id: number;
  user_id: number;
  umer_coins: number;
  mark_bucks: number;
  kcoins: number;
  corgi_coins: number;
  neo_coins: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  balances: Balance | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}

export interface BalanceResponse extends Balance {
  totalValueInMarkBucks: number;
}
