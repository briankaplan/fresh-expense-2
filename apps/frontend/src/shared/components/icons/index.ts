import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined";
import FindInPageRoundedIcon from "@mui/icons-material/FindInPageRounded";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SubscriptionsOutlinedIcon from "@mui/icons-material/SubscriptionsOutlined";
import SubscriptionsRoundedIcon from "@mui/icons-material/SubscriptionsRounded";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { SvgIconProps } from "@mui/material";
export const Icons = {
  // Navigation Icons
  Dashboard: { Filled: DashboardRoundedIcon, Outlined: DashboardOutlinedIcon },
  Wallet: {
    Filled: AccountBalanceWalletRoundedIcon,
    Outlined: AccountBalanceWalletOutlinedIcon,
  },
  Profile: {
    Filled: AccountCircleRoundedIcon,
    Outlined: AccountCircleOutlinedIcon,
  },
  Settings: { Filled: SettingsRoundedIcon, Outlined: SettingsOutlinedIcon },

  // Finance Icons
  Transactions: { Filled: PaymentsRoundedIcon, Outlined: PaymentsOutlinedIcon },
  BankAccount: {
    Filled: AccountBalanceRoundedIcon,
    Outlined: AccountBalanceOutlinedIcon,
  },
  Expenses: { Filled: ReceiptRoundedIcon, Outlined: ReceiptOutlinedIcon },
  Subscriptions: {
    Filled: SubscriptionsRoundedIcon,
    Outlined: SubscriptionsOutlinedIcon,
  },
  Investments: {
    Filled: TrendingUpRoundedIcon,
    Outlined: TrendingUpOutlinedIcon,
  },
  Savings: { Filled: SavingsRoundedIcon, Outlined: SavingsOutlinedIcon },

  // Status Icons
  Success: {
    Filled: CheckCircleRoundedIcon,
    Outlined: CheckCircleOutlineRoundedIcon,
  },
  Pending: { Filled: PendingRoundedIcon, Outlined: PendingOutlinedIcon },
  Error: { Filled: ErrorRoundedIcon, Outlined: ErrorOutlinedIcon },
  FindInPage: {
    Filled: FindInPageRoundedIcon,
    Outlined: FindInPageOutlinedIcon,
  },
} as const;
