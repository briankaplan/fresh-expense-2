import { SvgIconProps } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import SubscriptionsRoundedIcon from '@mui/icons-material/SubscriptionsRounded';
import SubscriptionsOutlinedIcon from '@mui/icons-material/SubscriptionsOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import PendingRoundedIcon from '@mui/icons-material/PendingRounded';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import FindInPageRoundedIcon from '@mui/icons-material/FindInPageRounded';
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined';
export const Icons = {
  // Navigation Icons
  Dashboard: { Filled: DashboardRoundedIcon, Outlined: DashboardOutlinedIcon },
  Wallet: { Filled: AccountBalanceWalletRoundedIcon, Outlined: AccountBalanceWalletOutlinedIcon },
  Profile: { Filled: AccountCircleRoundedIcon, Outlined: AccountCircleOutlinedIcon },
  Settings: { Filled: SettingsRoundedIcon, Outlined: SettingsOutlinedIcon },

  // Finance Icons
  Transactions: { Filled: PaymentsRoundedIcon, Outlined: PaymentsOutlinedIcon },
  BankAccount: { Filled: AccountBalanceRoundedIcon, Outlined: AccountBalanceOutlinedIcon },
  Expenses: { Filled: ReceiptRoundedIcon, Outlined: ReceiptOutlinedIcon },
  Subscriptions: { Filled: SubscriptionsRoundedIcon, Outlined: SubscriptionsOutlinedIcon },
  Investments: { Filled: TrendingUpRoundedIcon, Outlined: TrendingUpOutlinedIcon },
  Savings: { Filled: SavingsRoundedIcon, Outlined: SavingsOutlinedIcon },

  // Status Icons
  Success: { Filled: CheckCircleRoundedIcon, Outlined: CheckCircleOutlineRoundedIcon },
  Pending: { Filled: PendingRoundedIcon, Outlined: PendingOutlinedIcon },
  Error: { Filled: ErrorRoundedIcon, Outlined: ErrorOutlinedIcon },
  FindInPage: { Filled: FindInPageRoundedIcon, Outlined: FindInPageOutlinedIcon },
} as const;
