import { Add as AddIcon } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { DataTable } from "../shared";
import { useNotification } from "../shared/Notification";

interface Merchant extends Record<string, unknown> {
  id: string;
  name: string;
  category: string;
  transactionCount: number;
  lastTransactionDate: string;
}

interface MerchantListProps {
  merchants: Merchant[];
  onAddMerchant?: () => void;
  onEditMerchant?: (merchant: Merchant) => void;
}

export function MerchantList({ merchants, onAddMerchant, onEditMerchant }: MerchantListProps) {
  const { showNotification } = useNotification();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const columns = [
    { id: "name", label: "Name", minWidth: 200 },
    { id: "category", label: "Category", minWidth: 150 },
    {
      id: "transactionCount",
      label: "Transactions",
      minWidth: 120,
      align: "right",
    },
    { id: "lastTransactionDate", label: "Last Transaction", minWidth: 150 },
  ] as const;

  const handleRowClick = (row: Record<string, unknown>) => {
    if (onEditMerchant) {
      onEditMerchant(row as Merchant);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Merchants</Typography>
        {onAddMerchant && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAddMerchant}>
            Add Merchant
          </Button>
        )}
      </Box>
      <DataTable<Merchant>
        columns={columns}
        data={merchants}
        onRowClick={handleRowClick}
        searchable
        defaultSortBy="name"
      />
    </Box>
  );
}
