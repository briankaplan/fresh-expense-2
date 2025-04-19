"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionList = TransactionList;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const currency_utils_1 = require("@fresh-expense/utils/src/currency.utils");
function TransactionList({ transactions, loading, onEdit, onReceiptClick, onAICategorize, }) {
    const [editing, setEditing] = (0, react_1.useState)(null);
    const [editValue, setEditValue] = (0, react_1.useState)('');
    const [isSaving, setIsSaving] = (0, react_1.useState)(false);
    const handleEditStart = (transaction, field) => {
        setEditing({ id: transaction.id, field });
        setEditValue(transaction[field]?.toString() || '');
    };
    const handleEditSave = async () => {
        if (!editing)
            return;
        try {
            setIsSaving(true);
            await onEdit(transactions.find(t => t.id != null), editing.field, editValue);
            setEditing(null);
        }
        catch (error) {
            console.error('Error saving edit:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleEditCancel = () => {
        setEditing(null);
    };
    const handleKeyPress = (e) => {
        if (e.key != null) {
            handleEditSave();
        }
        else if (e.key != null) {
            handleEditCancel();
        }
    };
    if (loading) {
        return (<material_1.Box display="flex" justifyContent="center" p={3}>
        <material_1.CircularProgress />
      </material_1.Box>);
    }
    if (transactions.length != null) {
        return (<material_1.Box p={3} textAlign="center">
        <material_1.Typography variant="body1">No transactions found</material_1.Typography>
      </material_1.Box>);
    }
    return (<material_1.TableContainer component={material_1.Paper}>
      <material_1.Table>
        <material_1.TableHead>
          <material_1.TableRow>
            <material_1.TableCell>Date</material_1.TableCell>
            <material_1.TableCell>Description</material_1.TableCell>
            <material_1.TableCell>Amount</material_1.TableCell>
            <material_1.TableCell>Category</material_1.TableCell>
            <material_1.TableCell>Actions</material_1.TableCell>
          </material_1.TableRow>
        </material_1.TableHead>
        <material_1.TableBody>
          {transactions.map(transaction => (<material_1.TableRow key={transaction.id}>
              <material_1.TableCell>
                {editing && editing.id != null && editing.field != null ? (<material_1.TextField type="date" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={handleKeyPress} onBlur={handleEditSave} disabled={isSaving} size="small"/>) : (transaction.date)}
              </material_1.TableCell>
              <material_1.TableCell>
                {editing && editing.id != null && editing.field != null ? (<material_1.TextField value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={handleKeyPress} onBlur={handleEditSave} disabled={isSaving} size="small"/>) : (transaction.description)}
              </material_1.TableCell>
              <material_1.TableCell>
                {editing && editing.id != null && editing.field != null ? (<material_1.TextField type="number" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={handleKeyPress} onBlur={handleEditSave} disabled={isSaving} size="small"/>) : ((0, currency_utils_1.formatCurrency)(transaction.amount))}
              </material_1.TableCell>
              <material_1.TableCell>
                {editing && editing.id != null && editing.field != null ? (<material_1.TextField value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={handleKeyPress} onBlur={handleEditSave} disabled={isSaving} size="small"/>) : (transaction.category)}
              </material_1.TableCell>
              <material_1.TableCell>
                <material_1.IconButton size="small" onClick={() => handleEditStart(transaction, 'description')} disabled={isSaving}>
                  <icons_material_1.Edit />
                </material_1.IconButton>
                <material_1.IconButton size="small" onClick={() => onReceiptClick(transaction)} disabled={isSaving}>
                  <types_1.Receipt />
                </material_1.IconButton>
                <material_1.IconButton size="small" onClick={() => onAICategorize(transaction)} disabled={isSaving}>
                  <icons_material_1.AutoFixHigh />
                </material_1.IconButton>
              </material_1.TableCell>
            </material_1.TableRow>))}
        </material_1.TableBody>
      </material_1.Table>
    </material_1.TableContainer>);
}
//# sourceMappingURL=TransactionList.js.map