import { api } from './client';
import { DEFAULT_CLASH_PRODUCT_DETAIL, DEFAULT_CLASH_PRODUCT_SUMMARY } from './compat';
import type {
  BracketRound,
  Cart,
  CheckoutResponse,
  Dashboard,
  EligibleTeam,
  FriendRequest,
  Game,
  GameAccount,
  Home,
  Me,
  MyRegistration,
  MyTeam,
  MyTournament,
  Notification,
  OtpRequestResponse,
  Order,
  Paginated,
  Participant,
  Payment,
  PaymentMethod,
  PaymentStart,
  PresenceUser,
  Product,
  ProductSummary,
  Promo,
  RegistrationResult,
  Review,
  SearchResults,
  StatsTotals,
  SupportMessage,
  SupportStart,
  SupportStatus,
  Team,
  TeamInvitation,
  Tournament,
  TournamentStatus,
  TournamentSummary,
  VisitorConversation,
  VisitorSync,
  Wallet,
  WalletTransaction,
  WishlistItem,
} from './types';

// ------------------------------------------------------------------ Telegram sign-in
export interface TelegramAccount {
  telegramId: number;
  username: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  isPremium: boolean;
  notificationsEnabled: boolean;
  canMessage: boolean;
}

export interface TelegramUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  photoUrl: string;
}

export type TelegramSignIn =
  | { linked: false; telegramUser: TelegramUser }
  | {
      linked: true;
      telegramUser: TelegramUser;
      access: string;
      refresh: string;
      isNewUser: boolean;
      user: Me;
      telegram: TelegramAccount;
    };

export const telegramApi = {
  signIn: (initData: string) =>
    api<TelegramSignIn>('telegram/auth/', { method: 'POST', body: { initData }, auth: false }),
  linkContact: (initData: string, contact: string) =>
    api<TelegramSignIn>('telegram/auth/contact/', { method: 'POST', body: { initData, contact }, auth: false }),
  requestCode: (initData: string, phone: string) =>
    api<OtpRequestResponse>('telegram/auth/code/request/', { method: 'POST', body: { initData, phone }, auth: false }),
  verifyCode: (initData: string, phone: string, code: string) =>
    api<TelegramSignIn>('telegram/auth/code/verify/', {
      method: 'POST',
      body: { initData, phone, code },
      auth: false,
    }),
  me: () => api<TelegramAccount>('telegram/me/'),
  update: (data: { notificationsEnabled?: boolean; writeAccessGranted?: boolean }) =>
    api<TelegramAccount>('telegram/me/', { method: 'PATCH', body: data }),
  unlink: () => api<void>('telegram/me/', { method: 'DELETE' }),
};

// ------------------------------------------------------------------ me
export const meApi = {
  get: () => api<Me>('me/'),
  update: (data: Partial<Pick<Me, 'fullName' | 'email' | 'username' | 'favoriteGame'>>) =>
    api<Me>('me/', { method: 'PATCH', body: data }),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return api<Me>('me/avatar/', { method: 'POST', body: form });
  },
  dashboard: () => api<Dashboard>('me/dashboard/'),
  stats: () => api<StatsTotals>('me/stats/'),
  tournaments: () => api<Paginated<MyTournament>>('me/tournaments/', { query: { page_size: 50 } }),
  teams: () => api<MyTeam[]>('me/teams/'),
  teamInvitations: () => api<TeamInvitation[]>('me/team-invitations/'),
  acceptTeamInvitation: (id: number) => api<Team>(`me/team-invitations/${id}/accept/`, { method: 'POST' }),
  declineTeamInvitation: (id: number) =>
    api<TeamInvitation>(`me/team-invitations/${id}/decline/`, { method: 'POST' }),
  friends: () => api<PresenceUser[]>('me/friends/'),
  addFriend: (username: string) => api<FriendRequest>('me/friends/', { method: 'POST', body: { username } }),
  removeFriend: (username: string) => api<void>(`me/friends/${encodeURIComponent(username)}/`, { method: 'DELETE' }),
  friendRequests: () => api<FriendRequest[]>('me/friend-requests/'),
  acceptFriend: (id: number) => api<FriendRequest>(`me/friend-requests/${id}/accept/`, { method: 'POST' }),
  declineFriend: (id: number) => api<FriendRequest>(`me/friend-requests/${id}/decline/`, { method: 'POST' }),
  heartbeat: () => api<void>('me/heartbeat/', { method: 'POST', body: { status: 'online' } }),
};

export interface GameAccountInput {
  title: string;
  username: string;
  password?: string;
  game?: string | null;
  credentialType?: string;
}

export const gameAccountsApi = {
  list: () => api<GameAccount[]>('me/game-accounts/'),
  create: (data: GameAccountInput) => api<GameAccount>('me/game-accounts/', { method: 'POST', body: data }),
  remove: (id: number) => api<void>(`me/game-accounts/${id}/`, { method: 'DELETE' }),
};

// ------------------------------------------------------------------ catalog
export interface ProductQuery {
  game?: string;
  category?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export const catalogApi = {
  games: () => api<Game[]>('games/'),
  products: async (query: ProductQuery = {}) => {
    const res = await api<Paginated<ProductSummary>>('products/', { query: { ...query } });
    if (query.game === 'clash-of-clans' && !res.results?.length) {
      return { count: 1, next: null, previous: null, results: [DEFAULT_CLASH_PRODUCT_SUMMARY] };
    }
    return res;
  },
  product: async (slug: string) => {
    try {
      return await api<Product>(`products/${encodeURIComponent(slug)}/`);
    } catch (err) {
      if (slug === 'clash-of-clans-gems') return DEFAULT_CLASH_PRODUCT_DETAIL;
      throw err;
    }
  },
  related: (slug: string) => api<ProductSummary[]>(`products/${encodeURIComponent(slug)}/related/`),
  reviews: (slug: string) =>
    api<Paginated<Review>>(`products/${encodeURIComponent(slug)}/reviews/`, { query: { page_size: 20 } }),
  wishlist: () => api<Paginated<WishlistItem>>('me/wishlist/', { query: { page_size: 100 } }),
  addToWishlist: (slug: string) => api<WishlistItem>('me/wishlist/', { method: 'POST', body: { product: slug } }),
  removeFromWishlist: (slug: string) => api<void>(`me/wishlist/${encodeURIComponent(slug)}/`, { method: 'DELETE' }),
};

// ------------------------------------------------------------------ cart, orders, wallet
export const cartApi = {
  get: () => api<Cart>('cart/'),
  add: (line: { product: string; variant?: number | null; quantity: number }) =>
    api<Cart>('cart/items/', { method: 'POST', body: line }),
  update: (itemId: number, quantity: number) =>
    api<Cart>(`cart/items/${itemId}/`, { method: 'PATCH', body: { quantity } }),
  remove: (itemId: number) => api<Cart>(`cart/items/${itemId}/`, { method: 'DELETE' }),
};

export const ordersApi = {
  checkout: (paymentMethod: PaymentMethod, gameAccount?: number | null) =>
    api<CheckoutResponse>('orders/checkout/', { method: 'POST', body: { paymentMethod, gameAccount } }),
  list: () => api<Paginated<Order>>('me/orders/', { query: { page_size: 50 } }),
  get: (number: string) => api<Order>(`me/orders/${encodeURIComponent(number)}/`),
  cancel: (number: string) => api<Order>(`me/orders/${encodeURIComponent(number)}/cancel/`, { method: 'POST' }),
};

export const walletApi = {
  get: () => api<Wallet>('wallet/'),
  transactions: () => api<Paginated<WalletTransaction>>('wallet/transactions/', { query: { page_size: 30 } }),
  topup: (amount: number) => api<PaymentStart>('wallet/topup/', { method: 'POST', body: { amount } }),
  payment: (id: number | string) => api<Payment>(`payments/${id}/`),
};

// ------------------------------------------------------------------ tournaments & teams
export interface TournamentQuery {
  game?: string;
  status?: TournamentStatus | TournamentStatus[];
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export const tournamentsApi = {
  list: (query: TournamentQuery = {}) => api<Paginated<TournamentSummary>>('tournaments/', { query: { ...query } }),
  get: (slug: string) => api<Tournament>(`tournaments/${encodeURIComponent(slug)}/`),
  participants: (slug: string) => api<Participant[]>(`tournaments/${encodeURIComponent(slug)}/participants/`),
  bracket: (slug: string) => api<BracketRound[]>(`tournaments/${encodeURIComponent(slug)}/bracket/`),
  eligibleTeams: (slug: string) => api<EligibleTeam[]>(`tournaments/${encodeURIComponent(slug)}/eligible-teams/`),
  register: (slug: string, data: { team?: number | null; members?: number[]; paymentMethod?: PaymentMethod | null }) =>
    api<RegistrationResult>(`tournaments/${encodeURIComponent(slug)}/register/`, { method: 'POST', body: data }),
  withdraw: (slug: string) => api<void>(`tournaments/${encodeURIComponent(slug)}/register/`, { method: 'DELETE' }),
  updateLineup: (slug: string, members: number[]) =>
    api<MyRegistration>(`tournaments/${encodeURIComponent(slug)}/lineup/`, { method: 'PUT', body: { members } }),
};

export const teamsApi = {
  get: (id: number | string) => api<Team>(`teams/${id}/`),
  create: (name: string, logo?: File | null) => {
    const form = new FormData();
    form.append('name', name);
    if (logo) form.append('logo', logo);
    return api<Team>('teams/', { method: 'POST', body: form });
  },
  dissolve: (id: number) => api<void>(`teams/${id}/`, { method: 'DELETE' }),
  removeMember: (id: number, userId: number) => api<void>(`teams/${id}/members/${userId}/`, { method: 'DELETE' }),
  promote: (id: number, userId: number) => api<Team>(`teams/${id}/members/${userId}/promote/`, { method: 'POST' }),
  regenerateInvite: (id: number) => api<Team>(`teams/${id}/invite-code/regenerate/`, { method: 'POST' }),
  invite: (id: number, username: string) =>
    api<TeamInvitation>(`teams/${id}/invitations/`, { method: 'POST', body: { username } }),
  join: (code: string) => api<Team>('teams/join/', { method: 'POST', body: { code } }),
};

// ------------------------------------------------------------------ notifications & content
export const notificationsApi = {
  list: () => api<Paginated<Notification>>('notifications/', { query: { page_size: 50 } }),
  unreadCount: () => api<{ count: number }>('notifications/unread-count/'),
  markRead: (id: number) => api<Notification>(`notifications/${id}/read/`, { method: 'POST' }),
  markAllRead: () => api<{ count: number }>('notifications/read-all/', { method: 'POST' }),
};

export const contentApi = {
  home: () => api<Home>('home/'),
  search: (q: string, signal?: AbortSignal) => api<SearchResults>('search/', { query: { q }, signal }),
  promos: (placement: Promo['placement']) => api<Promo[]>('content/promos/', { query: { placement } }),
};

// ------------------------------------------------------------------ live support (visitor side)
const visitor = (token: string) => ({ auth: false, headers: { 'X-Support-Token': token } });

export const supportApi = {
  status: () => api<SupportStatus>('support/status/', { auth: false }),
  start: (data: { firstName: string; lastName: string; phone: string; pageUrl?: string }) =>
    api<SupportStart>('support/chat/start/', { method: 'POST', body: data }),
  sync: (token: string, after: number) => api<VisitorSync>('support/chat/sync/', { ...visitor(token), query: { after } }),
  send: (token: string, body: string, clientId: string) =>
    api<SupportMessage>('support/chat/messages/', { ...visitor(token), method: 'POST', body: { body, clientId } }),
  sendImage: (token: string, image: File, clientId: string) => {
    const form = new FormData();
    form.append('image', image);
    form.append('clientId', clientId);
    return api<SupportMessage>('support/chat/messages/', { ...visitor(token), method: 'POST', body: form });
  },
  read: (token: string, lastId: number) =>
    api<void>('support/chat/read/', { ...visitor(token), method: 'POST', body: { lastId } }),
  typing: (token: string) => api<void>('support/chat/typing/', { ...visitor(token), method: 'POST' }),
  close: (token: string) => api<VisitorConversation>('support/chat/close/', { ...visitor(token), method: 'POST' }),
  rate: (token: string, rating: number, comment: string) =>
    api<VisitorConversation>('support/chat/rate/', { ...visitor(token), method: 'POST', body: { rating, comment } }),
};
