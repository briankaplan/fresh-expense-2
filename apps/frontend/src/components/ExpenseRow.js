"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseRow = void 0;
const styles_1 = require("@mui/material/styles");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const RowContainer = (0, styles_1.styled)(material_1.Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));
const AvatarContainer = (0, styles_1.styled)(material_1.Box)({
    width: 40,
    height: 40,
    marginRight: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});
const ContentContainer = (0, styles_1.styled)(material_1.Box)({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
});
const MerchantName = (0, styles_1.styled)(material_1.Typography)({
    width: '30%',
    fontWeight: 500,
});
const Amount = (0, styles_1.styled)(material_1.Typography)({
    width: '20%',
    textAlign: 'right',
});
const Category = (0, styles_1.styled)(material_1.Typography)({
    width: '15%',
    color: 'text.secondary',
});
const DateText = (0, styles_1.styled)(material_1.Typography)({
    width: '15%',
    color: 'text.secondary',
});
const ExpenseRow = ({ expense }) => {
    return (<RowContainer>
      <AvatarContainer>
        <material_1.Typography variant="h6" color="primary">
          {expense.merchant.charAt(0).toUpperCase()}
        </material_1.Typography>
      </AvatarContainer>
      <ContentContainer>
        <MerchantName variant="body1">{expense.merchant}</MerchantName>
        <Amount variant="body1">${expense.amount.toFixed(2)}</Amount>
        <Category variant="body2">{expense.category}</Category>
        <DateText variant="body2">{new Date(expense.date).toLocaleDateString()}</DateText>
        <material_1.Box sx={{ display: 'flex', gap: 1 }}>
          <material_1.IconButton size="small" color="primary">
            <icons_material_1.Edit />
          </material_1.IconButton>
          <material_1.IconButton size="small" color="error">
            <icons_material_1.Delete />
          </material_1.IconButton>
        </material_1.Box>
      </ContentContainer>
    </RowContainer>);
};
exports.ExpenseRow = ExpenseRow;
//# sourceMappingURL=ExpenseRow.js.map