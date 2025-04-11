import React, { useEffect } from 'react';
import {
	Box,
	Grid,
	Paper,
	Typography,
	CircularProgress,
	useTheme,
} from '@mui/material';
import {
	AccountBalance,
	TrendingUp,
	Receipt,
	Subscriptions,
} from '@mui/icons-material';
import { useUIStore } from '../store';
import { apiClient } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface DashboardStats {
	totalExpenses: number;
	monthlyExpenses: number;
	totalReceipts: number;
	activeSubscriptions: number;
	recentTransactions: Array<{
		id: string;
		date: string;
		description: string;
		amount: number;
		category: string;
	}>;
	expensesByCategory: Array<{
		category: string;
		amount: number;
		percentage: number;
	}>;
}

const Dashboard = () => {
	const [stats, setStats] = React.useState<DashboardStats | null>(null);
	const [error, setError] = React.useState<string | null>(null);
	const setIsLoading = useUIStore((state) => state.setIsLoading);
	const theme = useTheme();

	useEffect(() => {
		const fetchDashboardData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await apiClient.get<DashboardStats>('/api/dashboard/stats');
				setStats(response.data);
			} catch (error) {
				setError('Failed to load dashboard data');
				toast.error('Unable to load dashboard information');
			} finally {
				setIsLoading(false);
			}
		};

		fetchDashboardData();
	}, [setIsLoading]);

	if (error) {
		return (
			<Box
				sx={{
					p: 3,
					textAlign: 'center',
					color: 'error.main',
				}}
			>
				<Typography variant="h6">{error}</Typography>
			</Box>
		);
	}

	if (!stats) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Typography
				variant="h4"
				gutterBottom
				sx={{
					fontWeight: 700,
					mb: 4,
					background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
				}}
			>
				Dashboard Overview
			</Typography>

			<Grid container spacing={3}>
				{/* Stats Cards */}
				<Grid item xs={12} sm={6} md={3}>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<Paper
							sx={{
								p: 3,
								background: 'rgba(26, 27, 30, 0.7)',
								backdropFilter: 'blur(20px)',
								borderRadius: 2,
								border: `1px solid ${theme.palette.divider}`,
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<AccountBalance color="primary" sx={{ mr: 1 }} />
								<Typography variant="h6">Total Expenses</Typography>
							</Box>
							<Typography variant="h4">
								${stats.totalExpenses.toLocaleString()}
							</Typography>
						</Paper>
					</motion.div>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						<Paper
							sx={{
								p: 3,
								background: 'rgba(26, 27, 30, 0.7)',
								backdropFilter: 'blur(20px)',
								borderRadius: 2,
								border: `1px solid ${theme.palette.divider}`,
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<TrendingUp color="secondary" sx={{ mr: 1 }} />
								<Typography variant="h6">Monthly Expenses</Typography>
							</Box>
							<Typography variant="h4">
								${stats.monthlyExpenses.toLocaleString()}
							</Typography>
						</Paper>
					</motion.div>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.2 }}
					>
						<Paper
							sx={{
								p: 3,
								background: 'rgba(26, 27, 30, 0.7)',
								backdropFilter: 'blur(20px)',
								borderRadius: 2,
								border: `1px solid ${theme.palette.divider}`,
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<Receipt color="info" sx={{ mr: 1 }} />
								<Typography variant="h6">Total Receipts</Typography>
							</Box>
							<Typography variant="h4">{stats.totalReceipts}</Typography>
						</Paper>
					</motion.div>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.3 }}
					>
						<Paper
							sx={{
								p: 3,
								background: 'rgba(26, 27, 30, 0.7)',
								backdropFilter: 'blur(20px)',
								borderRadius: 2,
								border: `1px solid ${theme.palette.divider}`,
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<Subscriptions color="success" sx={{ mr: 1 }} />
								<Typography variant="h6">Active Subscriptions</Typography>
							</Box>
							<Typography variant="h4">{stats.activeSubscriptions}</Typography>
						</Paper>
					</motion.div>
				</Grid>

				{/* Recent Transactions */}
				<Grid item xs={12} md={6}>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.4 }}
					>
						<Paper
							sx={{
								p: 3,
								background: 'rgba(26, 27, 30, 0.7)',
								backdropFilter: 'blur(20px)',
								borderRadius: 2,
								border: `1px solid ${theme.palette.divider}`,
								height: '100%',
							}}
						>
							<Typography variant="h6" gutterBottom>
								Recent Transactions
							</Typography>
							<Box>
								{stats.recentTransactions.map((transaction) => (
									<Box
										key={transaction.id}
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											py: 1.5,
											borderBottom: `1px solid ${theme.palette.divider}`,
										}}
									>
										<Box>
											<Typography variant="body1">
												{transaction.description}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												{new Date(transaction.date).toLocaleDateString()}
											</Typography>
										</Box>
										<Typography
											variant="body1"
											sx={{
												color:
													transaction.amount < 0
														? 'error.main'
														: 'success.main',
											}}
										>
											${Math.abs(transaction.amount).toLocaleString()}
										</Typography>
									</Box>
								))}
							</Box>
						</Paper>
					</motion.div>
				</Grid>

				{/* Expenses by Category */}
				<Grid item xs={12} md={6}>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.5 }}
					>
						<Paper
							sx={{
								p: 3,
								background: 'rgba(26, 27, 30, 0.7)',
								backdropFilter: 'blur(20px)',
								borderRadius: 2,
								border: `1px solid ${theme.palette.divider}`,
								height: '100%',
							}}
						>
							<Typography variant="h6" gutterBottom>
								Expenses by Category
							</Typography>
							<Box>
								{stats.expensesByCategory.map((category) => (
									<Box key={category.category} sx={{ mb: 2 }}>
										<Box
											sx={{
												display: 'flex',
												justifyContent: 'space-between',
												mb: 0.5,
											}}
										>
											<Typography variant="body2">
												{category.category}
											</Typography>
											<Typography variant="body2">
												${category.amount.toLocaleString()} (
												{category.percentage}%)
											</Typography>
										</Box>
										<Box
											sx={{
												width: '100%',
												height: 8,
												bgcolor: 'background.paper',
												borderRadius: 1,
												overflow: 'hidden',
											}}
										>
											<Box
												sx={{
													width: `${category.percentage}%`,
													height: '100%',
													bgcolor: 'primary.main',
													background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
												}}
											/>
										</Box>
									</Box>
								))}
							</Box>
						</Paper>
					</motion.div>
				</Grid>
			</Grid>
		</Box>
	);
};

export default Dashboard;