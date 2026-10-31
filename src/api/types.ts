/** Types mirroring the Titan API (camelCase JSON). Money is integer Toman unless a currency says otherwise. */

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type Presence = 'online' | 'away' | 'in_game' | 'offline';

// ------------------------------------------------------------------ accounts
export interface RankTier {
  slug: string;
  name: string;
  description: string;
  minPoints: number;
  colorFrom: string;
  colorTo: string;
  glow: string;
  ornament: string;
}

export interface Badge {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export interface GameRef {
  slug: string;
  title: string;
  titleEn: string;
}

export interface UserMini {
  id: number;
  username: string | null;
  displayName: string;
  avatar: string | null;
  avatarSeed: number;
  level: number;
  points: number;
  rank: string | null;
}

export interface PresenceUser extends UserMini {
  presence: Presence;
  currentGame: GameRef | null;
}

export interface PublicPlayer {
  id: number;
  username: string | null;
  displayName: string;
  avatar: string | null;
  avatarSeed: number;
  level: number;
  xp: number;
  maxXp: number;
  points: number;
  rank: RankTier | null;
  favoriteGame: GameRef | null;
  badges: Badge[];
  presence: Presence;
  dateJoined: string;
}

export interface Me extends Omit<PublicPlayer, 'favoriteGame'> {
  phone: string;
  fullName: string;
  email: string;
  favoriteGame: string | null;
  favoriteGameDetail: GameRef | null;
  isStaff: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse extends AuthTokens {
  isNewUser: boolean;
  user: Me;
}

export interface OtpRequestResponse {
  phone: string;
  expiresIn: number;
  resendIn: number;
}

export interface GameAccount {
  id: number;
  title: string;
  username: string;
  hasPassword: boolean;
  game: string | null;
  createdAt: string;
}

export interface FriendRequest {
  id: number;
  fromUser: UserMini;
  toUser: UserMini;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

// ------------------------------------------------------------------ catalog
export interface GameMini {
  slug: string;
  title: string;
  titleEn: string;
  iconImage: string | null;
  accentColor: string;
  credentialType?: CredentialType;
}

export interface Game extends GameMini {
  description: string;
  genre: string;
  kind: 'game' | 'service';
  coverImage: string | null;
  logoImage: string | null;
  backgroundImage: string | null;
  characterImage: string | null;
  accentGradient: string;
  isFeatured: boolean;
  productCount: number;
  tournamentCount: number;
  playerCount: number;
  introText?: string;
  bottomSeoText?: string;
  metaTitle?: string;
  metaDescription?: string;
  noindex?: boolean;
  ogImage?: string | null;
  canonicalUrl?: string;
  imageAlt?: string;
  updatedAt?: string;
}

export interface Platform {
  slug: string;
  name: string;
  icon: string | null;
}

export interface ProductCategory {
  description?: string;
  introText?: string;
  bottomSeoText?: string;
  metaTitle?: string;
  metaDescription?: string;
  noindex?: boolean;
  canonicalUrl?: string;
  imageAlt?: string;
  updatedAt?: string;
  slug: string;
  name: string;
}

export type ProductBadge = 'bestseller' | 'discount' | 'new';
export type DeliveryType = 'code' | 'account' | 'manual';
export type CredentialType = 'email_password' | 'supercell_id' | 'player_id';

export interface ProductVariant {
  id: number;
  label: string;
  price: number;
  originalPrice: number | null;
  discountPercent: number;
  inStock: boolean;
}

/** ``price`` is the fixed price, or the cheapest option when ``hasVariants`` (``priceMax`` = most expensive). */
export interface ProductSummary {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  image: string | null;
  price: number | null;
  originalPrice: number | null;
  discountPercent: number;
  hasVariants: boolean;
  priceMax: number | null;
  rating: number;
  reviewCount: number;
  badges: ProductBadge[];
  inStock: boolean;
  vendor: string;
  deliveryType: DeliveryType;
  credentialType?: CredentialType;
  game: GameMini | null;
  category: ProductCategory;
  platforms: string[];
  isWishlisted: boolean;
  popularity?: number;
  imageAlt?: string;
  sku?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFeature {
  title: string;
  description: string;
  icon: string;
}

export interface Product extends Omit<ProductSummary, 'platforms'> {
  platforms: Platform[];
  description: string;
  deliveryInfo: string;
  requiresGameAccount: boolean;
  stock: number | null;
  features: ProductFeature[];
  tags: string[];
  specs: Record<string, string>;
  variants: ProductVariant[];
  gallery: { image: string | null; alt: string }[];
  gtin?: string;
  mpn?: string;
  metaTitle?: string;
  metaDescription?: string;
  noindex?: boolean;
  ogImage?: string | null;
  canonicalUrl?: string;
}

export interface Review {
  id: number;
  user: UserMini;
  /** Public display name chosen by the reviewer (the email is never returned). */
  authorName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface WishlistItem {
  product: ProductSummary;
  createdAt: string;
}

// ------------------------------------------------------------------ cart & orders
export interface CartItem {
  id: number;
  product: {
    id: number;
    slug: string;
    title: string;
    image: string | null;
    deliveryType: DeliveryType;
    requiresGameAccount: boolean;
    credentialType?: CredentialType;
    inStock: boolean;
  };
  variant: { id: number; label: string } | null;
  quantity: number;
  unitPrice: number;
  unitOriginalPrice: number;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  count: number;
  subtotal: number;
  discount: number;
  total: number;
  requiresGameAccount: boolean;
  credentialTypes?: CredentialType[];
}

export type PaymentMethod = 'wallet' | 'gateway';
export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'refunded';

export interface OrderItem {
  id: number;
  product: string | null;
  title: string;
  variantLabel: string;
  image: string | null;
  deliveryType: DeliveryType;
  unitPrice: number;
  unitOriginalPrice: number;
  quantity: number;
  lineTotal: number;
  deliveredCode: string | null;
  deliveredAt: string | null;
}

export interface Order {
  number: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  total: number;
  gameAccountTitle: string;
  gameAccountUsername: string;
  items: OrderItem[];
  paidAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface CheckoutResponse {
  order: Order;
  paymentUrl: string | null;
}

// ------------------------------------------------------------------ payments
export interface Wallet {
  balance: number;
  updatedAt: string;
}

export interface WalletTransaction {
  id: number;
  amount: number;
  kind: string;
  balanceAfter: number;
  description: string;
  reference: string;
  createdAt: string;
}

export interface Payment {
  id: number;
  amount: number;
  gateway: string;
  purpose: 'order' | 'tournament_registration' | 'wallet_topup';
  objectId: number | null;
  reference: string;
  status: 'initiated' | 'paid' | 'failed' | 'cancelled';
  refId: string;
  cardPan: string;
  paidAt: string | null;
  createdAt: string;
}

export interface PaymentStart {
  paymentId: number;
  paymentUrl: string;
}

// ------------------------------------------------------------------ teams
export type TeamRole = 'captain' | 'player' | 'substitute';
export type Region = 'me' | 'eu' | 'ir' | 'intl';

export interface TeamMini {
  id: number;
  name: string;
  logo: string | null;
}

export interface TeamSummary extends TeamMini {
  memberCount: number;
  maxMembers: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  points: number;
  createdAt: string;
}

export interface TeamMember {
  user: PresenceUser;
  role: TeamRole;
  joinedAt: string;
}

export interface Team extends TeamSummary {
  members: TeamMember[];
  myRole: TeamRole | null;
  inviteCode: string | null;
  inviteUrl: string | null;
}

export interface MyTeam extends TeamSummary {
  myRole: TeamRole | null;
  activity: Presence;
}

export interface TeamInvitation {
  id: number;
  team: TeamMini;
  invitedUser: UserMini;
  invitedBy: UserMini;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
}

// ------------------------------------------------------------------ tournaments
export type TournamentStatus =
  | 'upcoming'
  | 'registration_open'
  | 'registration_closed'
  | 'live'
  | 'completed'
  | 'cancelled';

export interface Participant {
  id: number;
  kind: 'team' | 'player';
  name: string;
  logo: string | null;
  avatarSeed: number | null;
  teamId: number | null;
  username: string | null;
  points: number;
  rank: string | null;
  seed: number | null;
  finalPlacement: number | null;
}

export type MatchStatus = 'pending' | 'scheduled' | 'live' | 'completed' | 'bye';

export interface Match {
  id: number;
  round: number;
  position: number;
  status: MatchStatus;
  scheduledAt: string | null;
  bestOf: number;
  participantA: Participant | null;
  participantB: Participant | null;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: number | null;
  isMine: boolean;
  lobbyCode: string | null;
}

export interface BracketRound {
  round: number;
  name: string;
  matches: Match[];
}

export interface TournamentMini {
  id: number;
  slug: string;
  title: string;
  game: GameMini;
  coverImage: string | null;
  status: TournamentStatus;
  participantType: 'solo' | 'team';
  startsAt: string;
  endsAt: string;
}

export interface TournamentSummary extends Omit<TournamentMini, 'status'> {
  status: TournamentStatus;
  isFull: boolean;
  teamSize: number;
  formatLabel: string;
  region: Region;
  prizePool: number;
  prizeCurrency: 'IRT' | 'USD';
  entryFee: number;
  entryFeeOriginal: number | null;
  entryDiscountPercent: number;
  isFree: boolean;
  participantsCount: number;
  maxParticipants: number;
  registrationClosesAt: string;
  isFeatured: boolean;
  viewerCount: number;
  isRegistered: boolean;
  featuredMatch: Match | null;
  imageAlt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Registration {
  id: number;
  status: 'pending_payment' | 'confirmed' | 'withdrawn' | 'cancelled';
  team: TeamMini | null;
  entryFeePaid: number;
  seed: number | null;
  finalPlacement: number | null;
  confirmedAt: string | null;
  createdAt: string;
}

/** The viewer's own entry, with its lineup. ``canManage``: the viewer may edit the lineup or withdraw. */
export interface MyRegistration extends Registration {
  members: UserMini[];
  canManage: boolean;
}

export interface LineupCandidate extends TeamMember {
  /** Name of the team (or player) this member already plays for in the tournament. */
  registeredWith: string | null;
}

/** A team the viewer captains, offered for a tournament registration. */
export interface EligibleTeam extends TeamSummary {
  members: LineupCandidate[];
}

export interface Tournament extends TournamentSummary {
  description: string;
  rules: string[];
  prizes: { place: number; label: string; amount: number; points: number }[];
  season: { number: number; name: string; startsAt: string; endsAt: string; isCurrent: boolean };
  format: string;
  bestOf: number;
  registrationOpensAt: string;
  streamUrl: string;
  myRegistration: MyRegistration | null;
  specialBracket?: Record<string, unknown> | null;
  metaTitle?: string;
  metaDescription?: string;
  noindex?: boolean;
  ogImage?: string | null;
  canonicalUrl?: string;
}

export interface MyTournament extends Registration {
  tournament: TournamentMini;
  currentStage: string | null;
}

export interface RegistrationResult {
  registration: MyRegistration;
  paymentUrl: string | null;
}

/** Public platform-wide numbers (About page). */
export interface PlatformStats {
  players: number;
  teams: number;
  games: number;
  /** Live or completed tournaments. */
  tournaments: number;
  ordersDelivered: number;
  /** Prize pools of completed tournaments, one entry per currency. */
  prizesAwarded: { currency: 'IRT' | 'USD'; amount: number }[];
}

export interface StatsTotals {
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  points: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
  earningsIrt: number;
  earningsUsd: number;
  rank: RankTier | null;
}

export interface PlayerLeaderboardRow extends Omit<StatsTotals, 'rank'> {
  rank: number;
  player: UserMini;
  game: string;
}

export interface TeamLeaderboardRow extends Omit<StatsTotals, 'rank'> {
  rank: number;
  team: TeamMini;
  game: string;
}

// ------------------------------------------------------------------ notifications & content
export interface Notification {
  id: number;
  kind: 'system' | 'tournament' | 'team_invite' | 'team' | 'friend_request' | 'order' | 'payment';
  title: string;
  body: string;
  icon: string;
  data: Record<string, string | number | null>;
  isRead: boolean;
  createdAt: string;
}

export interface Promo {
  id: number;
  placement: 'store_discount' | 'store_bestseller' | 'home_hero' | 'tournament_hero';
  title: string;
  subtitle: string;
  badge: string;
  image: string | null;
  backgroundImage: string | null;
  backgroundGradient: string;
  price: number | null;
  originalPrice: number | null;
  discountLabel: string;
  product: string | null;
  tournament: string | null;
  link: string;
  layout: { scale?: number; x?: number; y?: number };
  startsAt: string | null;
  endsAt: string | null;
}

export interface Announcement {
  id: number;
  title: string;
  text: string;
  icon: string;
  link: string;
}

export interface ContactChannel {
  kind: 'discord' | 'telegram_channel' | 'telegram_support' | 'live_chat' | 'email' | 'phone';
  title: string;
  description: string;
  url: string;
  icon: string | null;
  actionLabel: string;
  isPrimary: boolean;
  isOnline: boolean;
}

export interface Home {
  heroTournaments: TournamentSummary[];
  heroPromos: Promo[];
  categories: Game[];
  announcements: Announcement[];
  myStats: StatsTotals | null;
}

export interface Dashboard {
  walletBalance: number;
  tournamentsJoined: number;
  activeTeams: number;
  unreadNotifications: number;
  recentTournaments: MyTournament[];
  recentOrders: Order[];
}

export interface SearchResults {
  games: GameMini[];
  tournaments: TournamentMini[];
  products: ProductSummary[];
}

// ------------------------------------------------------------------ live support chat
export type SupportMessageKind = 'visitor' | 'agent' | 'note' | 'system';

export interface SupportAgent {
  id: number;
  name: string;
  avatar: string | null;
  avatarSeed: number;
  isOnline: boolean;
}

export interface SupportMessage {
  id: number;
  kind: SupportMessageKind;
  body: string;
  image: string | null;
  author: SupportAgent | null;
  clientId: string | null;
  createdAt: string;
}

export interface SupportStatus {
  online: boolean;
  agents: SupportAgent[];
  avgResponseSeconds: number | null;
}

export interface VisitorConversation {
  ticket: string;
  status: 'open' | 'closed';
  firstName: string;
  lastName: string;
  phone: string;
  agent: SupportAgent | null;
  agentTyping: boolean;
  agentReadId: number;
  visitorReadId: number;
  rating: number | null;
  createdAt: string;
  closedAt: string | null;
}

export interface VisitorSync {
  conversation: VisitorConversation;
  messages: SupportMessage[];
  support: SupportStatus;
}

export interface SupportStart extends VisitorSync {
  token: string;
}

export interface SupportMessageInput {
  body?: string;
  image?: File | null;
  clientId: string;
}

export interface DeskQueueItem {
  id: number;
  ticket: string;
  status: 'open' | 'closed';
  fullName: string;
  phone: string;
  username: string | null;
  assignee: SupportAgent | null;
  unread: number;
  lastKind: SupportMessageKind | null;
  lastBody: string | null;
  lastHasImage: boolean;
  lastMessageAt: string | null;
  awaitingSince: string | null;
  visitorOnline: boolean;
  visitorTyping: boolean;
  rating: number | null;
  createdAt: string;
  closedAt: string | null;
}

export interface DeskConversation extends DeskQueueItem {
  firstName: string;
  lastName: string;
  pageUrl: string;
  agentTyping: boolean;
  visitorReadId: number;
  agentReadId: number;
  ratingComment: string;
}

export interface DeskCustomer {
  userId: number | null;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  dateJoined: string | null;
  walletBalance: number | null;
  ordersCount: number;
  recentOrders: { number: string; status: string; statusLabel: string; total: number; createdAt: string }[];
  previousConversations: number;
}

export interface DeskMe {
  id: number;
  name: string;
  displayName: string;
  avatar: string | null;
  avatarSeed: number;
  isAvailable: boolean;
  smsAlerts: boolean;
}

export interface DeskSync {
  me: DeskMe;
  agents: SupportAgent[];
  queue: DeskQueueItem[];
  conversation: DeskConversation | null;
  customer: DeskCustomer | null;
  messages: SupportMessage[];
}

export interface CannedReply {
  id: number;
  shortcut: string;
  title: string;
  body: string;
  position: number;
}

// ------------------------------------------------------------------ guides
export type GuideCategory = 'purchase' | 'account' | 'site' | 'tournament';

export interface GuideSummary {
  slug: string;
  title: string;
  category: GuideCategory;
  game: GameMini | null;
  summary: string;
  publishedAt: string | null;
  updatedAt: string;
}

export interface Guide extends GuideSummary {
  body: string;
  faqs: { question: string; answer: string }[];
  products: { slug: string; title: string }[];
  related: GuideSummary[];
  metaTitle: string;
  metaDescription: string;
  noindex: boolean;
  ogImage: string | null;
  canonicalUrl: string;
}
