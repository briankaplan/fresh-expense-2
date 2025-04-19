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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptLibrary = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const DatePicker_1 = require("@mui/x-date-pickers/DatePicker");
const LocalizationProvider_1 = require("@mui/x-date-pickers/LocalizationProvider");
const AdapterDateFns_1 = require("@mui/x-date-pickers/AdapterDateFns");
const react_hot_toast_1 = require("react-hot-toast");
const react_konva_1 = require("react-konva");
const react_virtual_1 = require("@tanstack/react-virtual");
const use_debounce_1 = require("use-debounce");
const file_saver_1 = __importDefault(require("file-saver"));
const jszip_1 = __importDefault(require("jszip"));
const ReceiptLibrary = () => {
    const [receipts, setReceipts] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedReceipt, setSelectedReceipt] = (0, react_1.useState)(null);
    const [filters, setFilters] = (0, react_1.useState)({
        search: '',
        categories: [],
        dateRange: {
            start: null,
            end: null,
        },
    });
    const [selectedReceipts, setSelectedReceipts] = (0, react_1.useState)([]);
    const [sortOption] = (0, react_1.useState)('date');
    const containerRef = (0, react_1.useRef)(null);
    const debouncedSearch = (0, use_debounce_1.useDebouncedCallback)((value) => {
        setFilters(prev => ({ ...prev, search: value }));
    }, 500);
    const filteredReceipts = (0, react_1.useMemo)(() => {
        return receipts
            .filter(receipt => {
            const matchesSearch = receipt.metadata.merchant?.toLowerCase().includes(filters.search.toLowerCase()) ||
                receipt.metadata.text?.toLowerCase().includes(filters.search.toLowerCase()) ||
                false;
            const matchesCategories = filters.categories.length != null || filters.categories.includes(receipt.status);
            const matchesDateRange = (!filters.dateRange.start ||
                new Date(receipt.metadata.date || '') >= filters.dateRange.start) &&
                (!filters.dateRange.end ||
                    new Date(receipt.metadata.date || '') <= filters.dateRange.end);
            return matchesSearch && matchesCategories && matchesDateRange;
        })
            .sort((a, b) => {
            if (!a || !b)
                return 0;
            const aValue = a[sortOption];
            const bValue = b[sortOption];
            if (!aValue || !bValue)
                return 0;
            const modifier = sortOption === 'date' ? -1 : 1;
            return aValue > bValue ? modifier : -modifier;
        });
    }, [receipts, filters, sortOption]);
    const virtualizer = (0, react_virtual_1.useVirtualizer)({
        count: filteredReceipts.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 300,
        overscan: 5,
    });
    const handleExport = async (options) => {
        try {
            if (selectedReceipts.length != null) {
                react_hot_toast_1.toast.error('Please select at least one receipt to export');
                return;
            }
            if (options.format != null) {
                const zip = new jszip_1.default();
                // Add files to zip
                const blob = await zip.generateAsync({ type: 'blob' });
                (0, file_saver_1.default)(blob, 'receipts.zip');
            }
            else {
                // Handle PDF and CSV exports
            }
            react_hot_toast_1.toast.success(`Successfully exported ${selectedReceipts.length} receipts`);
        }
        catch (error) {
            console.error('Export failed:', error);
            react_hot_toast_1.toast.error('Failed to export receipts');
        }
    };
    const handleUpload = async (files) => {
        try {
            setLoading(true);
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('receipts', file);
            });
            const response = await fetch('/api/receipt-bank/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            const result = await response.json();
            setReceipts(prev => [...result.receipts, ...prev]);
            react_hot_toast_1.toast.success(`Successfully uploaded ${files.length} receipt(s)`);
        }
        catch (error) {
            console.error('Upload failed:', error);
            react_hot_toast_1.toast.error('Failed to upload receipts');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async (receiptId) => {
        try {
            const response = await fetch(`/api/receipt-bank/${receiptId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Delete failed');
            }
            setReceipts(prev => prev.filter(r => r.id !== receiptId));
            react_hot_toast_1.toast.success('Receipt deleted successfully');
        }
        catch (error) {
            console.error('Delete failed:', error);
            react_hot_toast_1.toast.error('Failed to delete receipt');
        }
    };
    const ReceiptCard = ({ receipt }) => (<framer_motion_1.motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
        }} whileHover={{ y: -4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} whileTap={{ scale: 0.98 }}>
      <material_1.Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            position: 'relative',
            outline: selectedReceipts.includes(receipt.id) ? '2px solid' : 'none',
            outlineColor: 'primary.main',
        }}>
        <material_1.Box sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1,
        }}>
          <material_1.Checkbox checked={selectedReceipts.includes(receipt.id)} onChange={e => {
            e.stopPropagation();
            setSelectedReceipts(prev => {
                const next = prev.includes(receipt.id)
                    ? prev.filter(id => id !== receipt.id)
                    : [...prev, receipt.id];
                return next;
            });
        }}/>
        </material_1.Box>

        <material_1.CardMedia component="img" height="200" image={receipt.thumbnailUrl} alt={`Receipt from ${receipt.metadata.merchant || 'Unknown Merchant'}`} sx={{
            objectFit: 'cover',
            filter: selectedReceipts.includes(receipt.id) ? 'brightness(0.9)' : 'none',
        }} onClick={() => setSelectedReceipt(receipt)}/>

        <material_1.CardContent>
          <material_1.Typography variant="h6" noWrap>
            {receipt.metadata.merchant || 'Unknown Merchant'}
          </material_1.Typography>
          <material_1.Typography variant="body2" color="text.secondary">
            {receipt.metadata.date
            ? new Date(receipt.metadata.date).toLocaleDateString()
            : 'Unknown'}
          </material_1.Typography>
          <material_1.Typography variant="body1" sx={{ mt: 1 }}>
            {receipt.metadata.amount
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(receipt.metadata.amount)
            : 'Unknown'}
          </material_1.Typography>

          <material_1.Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <material_1.Chip size="small" label={receipt.status} color={receipt.status != null
            ? 'success'
            : receipt.status != null
                ? 'warning'
                : 'info'}/>
          </material_1.Stack>
        </material_1.CardContent>

        <material_1.CardActions sx={{ mt: 'auto', p: 2 }}>
          <material_1.Tooltip title="View Details">
            <material_1.IconButton size="small" onClick={() => setSelectedReceipt(receipt)}>
              <icons_material_1.ZoomIn />
            </material_1.IconButton>
          </material_1.Tooltip>
          {receipt.status != null && (<material_1.Tooltip title="Find Matches">
              <material_1.IconButton size="small" color="primary" onClick={e => {
                e.stopPropagation();
                // TODO: Implement find matches
            }}>
                <icons_material_1.Link />
              </material_1.IconButton>
            </material_1.Tooltip>)}
          <material_1.Tooltip title="Delete">
            <material_1.IconButton size="small" color="error" onClick={e => {
            e.stopPropagation();
            handleDelete(receipt.id);
        }}>
              <icons_material_1.Delete />
            </material_1.IconButton>
          </material_1.Tooltip>
        </material_1.CardActions>
      </material_1.Card>
    </framer_motion_1.motion.div>);
    const ExportMenu = () => {
        const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
        const [exportOptions, setExportOptions] = (0, react_1.useState)({
            format: 'pdf',
            includeAnnotations: true,
            includeMetadata: true,
        });
        return (<>
        <material_1.Button variant="outlined" startIcon={<icons_material_1.Save />} onClick={e => setAnchorEl(e.currentTarget)} disabled={selectedReceipts.length != null}>
          Export Selected ({selectedReceipts.length})
        </material_1.Button>
        <material_1.Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <material_1.MenuItem onClick={() => handleExport({ ...exportOptions, format: 'pdf' })}>
            Export as PDF
          </material_1.MenuItem>
          <material_1.MenuItem onClick={() => handleExport({ ...exportOptions, format: 'csv' })}>
            Export as CSV
          </material_1.MenuItem>
          <material_1.MenuItem onClick={() => handleExport({ ...exportOptions, format: 'zip' })}>
            Export as ZIP
          </material_1.MenuItem>
          <material_1.Divider />
          <material_1.MenuItem>
            <material_1.FormControlLabel control={<material_1.Checkbox checked={exportOptions.includeAnnotations} onChange={e => setExportOptions(prev => ({
                    ...prev,
                    includeAnnotations: e.target.checked,
                }))}/>} label="Include Annotations"/>
          </material_1.MenuItem>
          <material_1.MenuItem>
            <material_1.FormControlLabel control={<material_1.Checkbox checked={exportOptions.includeMetadata} onChange={e => setExportOptions(prev => ({
                    ...prev,
                    includeMetadata: e.target.checked,
                }))}/>} label="Include Metadata"/>
          </material_1.MenuItem>
        </material_1.Menu>
      </>);
    };
    const ReceiptDialog = () => {
        const [zoom, setZoom] = (0, react_1.useState)(1);
        const [rotation, setRotation] = (0, react_1.useState)(0);
        const [annotations, setAnnotations] = (0, react_1.useState)([]);
        const [isAnnotating, setIsAnnotating] = (0, react_1.useState)(false);
        const [selectedAnnotationId, setSelectedAnnotationId] = (0, react_1.useState)(null);
        const [image, setImage] = (0, react_1.useState)(null);
        const [stageSize, setStageSize] = (0, react_1.useState)({ width: 800, height: 600 });
        const stageRef = (0, react_1.useRef)(null);
        const containerRef = (0, react_1.useRef)(null);
        (0, react_1.useEffect)(() => {
            if (selectedReceipt) {
                const img = document.createElement('img');
                img.crossOrigin = 'anonymous';
                img.src = selectedReceipt.fullImageUrl;
                img.onload = () => {
                    const scale = Math.min(stageSize.width / img.width, stageSize.height / img.height);
                    setImage(img);
                    setZoom(scale);
                };
            }
        }, [selectedReceipt, stageSize]);
        (0, react_1.useEffect)(() => {
            const updateSize = () => {
                if (containerRef.current) {
                    const { clientWidth, clientHeight } = containerRef.current;
                    setStageSize({
                        width: clientWidth,
                        height: clientHeight,
                    });
                }
            };
            updateSize();
            window.addEventListener('resize', updateSize);
            return () => window.removeEventListener('resize', updateSize);
        }, []);
        const handleZoom = (delta) => {
            setZoom(prev => Math.min(Math.max(0.5, prev + delta), 3));
        };
        const handleRotate = (delta) => {
            setRotation(prev => (prev + delta) % 360);
        };
        const handleAddAnnotation = (type) => {
            const stage = stageRef.current;
            if (!stage)
                return;
            const center = {
                x: stage.width() / 2,
                y: stage.height() / 2,
            };
            const newAnnotation = {
                id: Math.random().toString(36).substr(2, 9),
                type,
                position: center,
                content: '',
                color: '#ff0000',
            };
            switch (type) {
                case 'text':
                    newAnnotation.content = 'Double click to edit';
                    break;
                case 'highlight':
                    newAnnotation.width = 100;
                    newAnnotation.height = 30;
                    break;
            }
            setAnnotations(prev => [...prev, newAnnotation]);
            setSelectedAnnotationId(newAnnotation.id);
        };
        const handleAnnotationChange = (id, changes) => {
            setAnnotations(prev => prev.map(ann => (ann.id != null ? { ...ann, ...changes } : ann)));
        };
        const handleDeleteAnnotation = (id) => {
            setAnnotations(prev => prev.filter(ann => ann.id !== id));
            setSelectedAnnotationId(null);
        };
        const renderAnnotation = (annotation) => {
            const isSelected = selectedAnnotationId === annotation.id;
            const commonProps = {
                draggable: true,
                onClick: () => setSelectedAnnotationId(annotation.id),
                stroke: isSelected ? '#1976d2' : undefined,
                strokeWidth: isSelected ? 2 : undefined,
            };
            switch (annotation.type) {
                case 'text':
                    return (<react_konva_1.Text {...commonProps} key={annotation.id} text={annotation.content} x={annotation.position.x} y={annotation.position.y} fill={annotation.color} fontSize={20} onDblClick={() => {
                            const newText = prompt('Enter new text:', annotation.content);
                            if (newText !== null) {
                                handleAnnotationChange(annotation.id, { content: newText });
                            }
                        }}/>);
                case 'highlight':
                    return (<react_konva_1.Rect {...commonProps} key={annotation.id} x={annotation.position.x} y={annotation.position.y} width={annotation.width || 100} height={annotation.height || 30} fill={annotation.color} opacity={isSelected ? 0.5 : 0.3}/>);
                default:
                    return null;
            }
        };
        const handleStageClick = (e) => {
            if (e.target != null) {
                setSelectedAnnotationId(null);
            }
        };
        return (<material_1.Dialog open={!!selectedReceipt} onClose={() => setSelectedReceipt(null)} maxWidth="lg" fullWidth>
        {selectedReceipt && (<>
            <material_1.DialogTitle>
              <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <material_1.Typography variant="h6">
                  {selectedReceipt.metadata.merchant || 'Unknown Merchant'}
                </material_1.Typography>
                <material_1.Box>
                  <material_1.IconButton onClick={() => handleZoom(0.1)} title="Zoom In">
                    <icons_material_1.ZoomIn />
                  </material_1.IconButton>
                  <material_1.IconButton onClick={() => handleZoom(-0.1)} title="Zoom Out">
                    <icons_material_1.ZoomOut />
                  </material_1.IconButton>
                  <material_1.IconButton onClick={() => handleRotate(-90)} title="Rotate Left">
                    <icons_material_1.RotateLeft />
                  </material_1.IconButton>
                  <material_1.IconButton onClick={() => handleRotate(90)} title="Rotate Right">
                    <icons_material_1.RotateRight />
                  </material_1.IconButton>
                  <material_1.IconButton onClick={() => setIsAnnotating(!isAnnotating)} title="Toggle Annotations">
                    <icons_material_1.Edit color={isAnnotating ? 'primary' : 'inherit'}/>
                  </material_1.IconButton>
                </material_1.Box>
              </material_1.Box>
            </material_1.DialogTitle>
            <material_1.DialogContent>
              <material_1.Grid container spacing={3}>
                <material_1.Grid item xs={12} md={8}>
                  <material_1.Box ref={containerRef} sx={{
                    position: 'relative',
                    width: '100%',
                    height: '70vh',
                    overflow: 'hidden',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                }}>
                    <react_konva_1.Stage ref={stageRef} width={stageSize.width} height={stageSize.height} scaleX={zoom} scaleY={zoom} onClick={handleStageClick}>
                      <react_konva_1.Layer>
                        {image && (<react_konva_1.Image image={image} rotation={rotation} offsetX={image.width / 2} offsetY={image.height / 2} x={stageSize.width / 2} y={stageSize.height / 2}/>)}
                        {annotations.map(renderAnnotation)}
                      </react_konva_1.Layer>
                    </react_konva_1.Stage>

                    {isAnnotating && (<material_1.Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <material_1.Paper elevation={3} sx={{ p: 1 }}>
                          <material_1.IconButton onClick={() => handleAddAnnotation('text')} title="Add Text">
                            <icons_material_1.Edit fontSize="small"/>
                          </material_1.IconButton>
                          <material_1.IconButton onClick={() => handleAddAnnotation('highlight')} title="Highlight">
                            <icons_material_1.ZoomIn fontSize="small"/>
                          </material_1.IconButton>
                        </material_1.Paper>
                      </material_1.Box>)}
                  </material_1.Box>
                </material_1.Grid>
                <material_1.Grid item xs={12} md={4}>
                  <material_1.Typography variant="h6" gutterBottom>
                    Receipt Details
                  </material_1.Typography>
                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Typography variant="subtitle2">Date</material_1.Typography>
                    <material_1.Typography>
                      {selectedReceipt.metadata.date
                    ? new Date(selectedReceipt.metadata.date).toLocaleDateString()
                    : 'Unknown'}
                    </material_1.Typography>
                  </material_1.Box>
                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Typography variant="subtitle2">Amount</material_1.Typography>
                    <material_1.Typography>
                      {selectedReceipt.metadata.amount
                    ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                    }).format(selectedReceipt.metadata.amount)
                    : 'Unknown'}
                    </material_1.Typography>
                  </material_1.Box>
                  {selectedReceipt.metadata.text && (<>
                      <material_1.Typography variant="h6" gutterBottom>
                        OCR Data
                      </material_1.Typography>
                      <material_1.Box sx={{ mb: 2 }}>
                        <material_1.Typography variant="subtitle2">Text</material_1.Typography>
                        <material_1.Typography>{selectedReceipt.metadata.text}</material_1.Typography>
                      </material_1.Box>
                      <material_1.Box sx={{ mb: 2 }}>
                        <material_1.Typography variant="subtitle2">Confidence</material_1.Typography>
                        <material_1.Typography>
                          {(selectedReceipt.metadata.confidence || 0 * 100).toFixed(1)}%
                        </material_1.Typography>
                      </material_1.Box>
                      {selectedReceipt.metadata.items && (<material_1.Box sx={{ mb: 2 }}>
                          <material_1.Typography variant="subtitle2">Items</material_1.Typography>
                          <ul>
                            {selectedReceipt.metadata.items.map((item, index) => (<li key={index}>
                                {item.description} - ${item.amount.toFixed(2)}
                                {item.quantity && ` x ${item.quantity}`}
                              </li>))}
                          </ul>
                        </material_1.Box>)}
                    </>)}
                  {isAnnotating && (<material_1.Box sx={{ mt: 2 }}>
                      <material_1.Typography variant="h6" gutterBottom>
                        Annotations
                      </material_1.Typography>
                      {annotations.map(annotation => (<material_1.Box key={annotation.id} sx={{ mb: 1 }}>
                          <material_1.TextField fullWidth size="small" value={annotation.content} onChange={e => handleAnnotationChange(annotation.id, { content: e.target.value })} InputProps={{
                            endAdornment: (<material_1.InputAdornment position="end">
                                  <material_1.IconButton size="small" onClick={() => handleDeleteAnnotation(annotation.id)}>
                                    <icons_material_1.Delete fontSize="small"/>
                                  </material_1.IconButton>
                                </material_1.InputAdornment>),
                        }}/>
                        </material_1.Box>))}
                    </material_1.Box>)}
                </material_1.Grid>
              </material_1.Grid>
            </material_1.DialogContent>
          </>)}
      </material_1.Dialog>);
    };
    return (<material_1.Box>
      <material_1.Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <material_1.Typography variant="h4">Receipt Library</material_1.Typography>
        <material_1.Stack direction="row" spacing={2}>
          <ExportMenu />
          <material_1.Button variant="contained" startIcon={<icons_material_1.CloudUpload />} component="label">
            Upload Receipts
            <input type="file" hidden multiple accept="image/*,.pdf" onChange={e => e.target.files && handleUpload(e.target.files)}/>
          </material_1.Button>
        </material_1.Stack>
      </material_1.Box>

      <material_1.Paper sx={{ p: 2, mb: 3 }}>
        <material_1.Grid container spacing={2} alignItems="center">
          <material_1.Grid item xs={12} md={4}>
            <material_1.TextField fullWidth placeholder="Search receipts..." value={filters.search} onChange={e => debouncedSearch(e.target.value)} InputProps={{
            startAdornment: (<material_1.InputAdornment position="start">
                    <icons_material_1.Search />
                  </material_1.InputAdornment>),
        }}/>
          </material_1.Grid>
          <LocalizationProvider_1.LocalizationProvider dateAdapter={AdapterDateFns_1.AdapterDateFns}>
            <material_1.Grid item xs={12} sm={6} md={2}>
              <DatePicker_1.DatePicker label="Start Date" value={filters.dateRange.start} onChange={date => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: date } }))} slotProps={{ textField: { fullWidth: true } }}/>
            </material_1.Grid>
            <material_1.Grid item xs={12} sm={6} md={2}>
              <DatePicker_1.DatePicker label="End Date" value={filters.dateRange.end} onChange={date => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: date } }))} slotProps={{ textField: { fullWidth: true } }}/>
            </material_1.Grid>
          </LocalizationProvider_1.LocalizationProvider>
          <material_1.Grid item xs={12} sm={6} md={2}>
            <material_1.TextField select fullWidth label="Status" value={filters.categories.join(', ')} onChange={e => setFilters(prev => ({
            ...prev,
            categories: e.target.value.split(',').map(s => s.trim()),
        }))}>
              <material_1.MenuItem value="matched">Matched</material_1.MenuItem>
              <material_1.MenuItem value="unmatched">Unmatched</material_1.MenuItem>
              <material_1.MenuItem value="processing">Processing</material_1.MenuItem>
            </material_1.TextField>
          </material_1.Grid>
        </material_1.Grid>
      </material_1.Paper>

      {loading ? (<material_1.Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <material_1.CircularProgress />
        </material_1.Box>) : (<material_1.Box ref={containerRef} sx={{ height: 'calc(100vh - 300px)', overflow: 'auto' }}>
          <framer_motion_1.AnimatePresence>
            <material_1.Grid container spacing={3} sx={{ minHeight: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map(virtualRow => {
                const receipt = filteredReceipts[virtualRow.index];
                return (<material_1.Grid item xs={12} sm={6} md={4} lg={3} key={virtualRow.key} style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                        height: `${virtualRow.size}px`,
                    }}>
                    <ReceiptCard receipt={receipt}/>
                  </material_1.Grid>);
            })}
            </material_1.Grid>
          </framer_motion_1.AnimatePresence>
        </material_1.Box>)}

      <ReceiptDialog />
    </material_1.Box>);
};
exports.ReceiptLibrary = ReceiptLibrary;
//# sourceMappingURL=ReceiptLibrary.js.map