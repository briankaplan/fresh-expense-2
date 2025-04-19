var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reports = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_hot_toast_1 = require("react-hot-toast");
const Reports = () => {
  const [templates, setTemplates] = (0, react_1.useState)([]);
  const [scheduledReports, setScheduledReports] = (0, react_1.useState)([]);
  const [loading, setLoading] = (0, react_1.useState)(true);
  const [selectedTemplate, setSelectedTemplate] = (0, react_1.useState)(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = (0, react_1.useState)(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = (0, react_1.useState)(false);
  const [scheduleData, setScheduleData] = (0, react_1.useState)({
    frequency: "monthly",
    nextRun: new Date(),
    recipients: [],
    active: true,
  });
  const [templateForm, setTemplateForm] = (0, react_1.useState)({
    name: "",
    description: "",
    type: "expense",
    format: "pdf",
  });
  (0, react_1.useEffect)(() => {
    fetchTemplatesAndReports();
  }, []);
  const fetchTemplatesAndReports = async () => {
    try {
      setLoading(true);
      const [templatesResponse, reportsResponse] = await Promise.all([
        fetch("/api/reports/templates"),
        fetch("/api/reports/scheduled"),
      ]);
      if (!templatesResponse.ok || !reportsResponse.ok) {
        throw new Error("Failed to fetch reports data");
      }
      const templatesData = await templatesResponse.json();
      const reportsData = await reportsResponse.json();
      setTemplates(templatesData);
      setScheduledReports(reportsData);
    } catch (error) {
      console.error("Error fetching reports:", error);
      react_hot_toast_1.toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };
  const handleCreateTemplate = async (template) => {
    try {
      const response = await fetch("/api/reports/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error("Failed to create template");
      const newTemplate = await response.json();
      setTemplates((prev) => [...prev, newTemplate]);
      react_hot_toast_1.toast.success("Template created successfully");
      setIsTemplateDialogOpen(false);
    } catch (error) {
      console.error("Error creating template:", error);
      react_hot_toast_1.toast.error("Failed to create template");
    }
  };
  const handleScheduleReport = async (templateId, schedule) => {
    try {
      const response = await fetch(`/api/reports/templates/${templateId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });
      if (!response.ok) throw new Error("Failed to schedule report");
      await fetchTemplatesAndReports();
      react_hot_toast_1.toast.success("Report scheduled successfully");
      setIsScheduleDialogOpen(false);
    } catch (error) {
      console.error("Error scheduling report:", error);
      react_hot_toast_1.toast.error("Failed to schedule report");
    }
  };
  const handleDownloadReport = async (reportId) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/download`);
      if (!response.ok) throw new Error("Failed to download report");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading report:", error);
      react_hot_toast_1.toast.error("Failed to download report");
    }
  };
  const handleScheduleFrequencyChange = (frequency) => {
    setScheduleData((prev) => ({
      ...prev,
      frequency,
    }));
  };
  const handleRecipientsChange = (recipientsString) => {
    setScheduleData((prev) => ({
      ...prev,
      recipients: recipientsString
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean),
    }));
  };
  const handleTemplateFormChange = (field, value) => {
    setTemplateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleTemplateSubmit = () => {
    if (!templateForm.name || !templateForm.type || !templateForm.format) {
      react_hot_toast_1.toast.error("Please fill in all required fields");
      return;
    }
    if (selectedTemplate) {
      // Handle edit case
      handleCreateTemplate({ ...templateForm, id: selectedTemplate.id });
    } else {
      // Handle create case
      handleCreateTemplate(templateForm);
    }
  };
  const TemplateDialog = () => (
    <material_1.Dialog
      open={isTemplateDialogOpen}
      onClose={() => setIsTemplateDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <material_1.DialogTitle>
        {selectedTemplate ? "Edit Report Template" : "Create Report Template"}
      </material_1.DialogTitle>
      <material_1.DialogContent>
        <material_1.Grid container spacing={3} sx={{ mt: 1 }}>
          <material_1.Grid item xs={12}>
            <material_1.TextField
              fullWidth
              label="Template Name"
              required
              value={templateForm.name}
              onChange={(e) => handleTemplateFormChange("name", e.target.value)}
            />
          </material_1.Grid>
          <material_1.Grid item xs={12}>
            <material_1.TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={templateForm.description}
              onChange={(e) => handleTemplateFormChange("description", e.target.value)}
            />
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6}>
            <material_1.TextField
              fullWidth
              select
              label="Report Type"
              required
              value={templateForm.type}
              onChange={(e) => handleTemplateFormChange("type", e.target.value)}
            >
              <material_1.MenuItem value="expense">Expense Report</material_1.MenuItem>
              <material_1.MenuItem value="receipt">Receipt Report</material_1.MenuItem>
              <material_1.MenuItem value="custom">Custom Report</material_1.MenuItem>
            </material_1.TextField>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6}>
            <material_1.TextField
              fullWidth
              select
              label="Output Format"
              required
              value={templateForm.format}
              onChange={(e) => handleTemplateFormChange("format", e.target.value)}
            >
              <material_1.MenuItem value="pdf">PDF</material_1.MenuItem>
              <material_1.MenuItem value="csv">CSV</material_1.MenuItem>
              <material_1.MenuItem value="excel">Excel</material_1.MenuItem>
            </material_1.TextField>
          </material_1.Grid>
        </material_1.Grid>
      </material_1.DialogContent>
      <material_1.DialogActions>
        <material_1.Button onClick={() => setIsTemplateDialogOpen(false)}>Cancel</material_1.Button>
        <material_1.Button variant="contained" color="primary" onClick={handleTemplateSubmit}>
          {selectedTemplate ? "Save Changes" : "Create Template"}
        </material_1.Button>
      </material_1.DialogActions>
    </material_1.Dialog>
  );
  const ScheduleDialog = () => (
    <material_1.Dialog
      open={isScheduleDialogOpen}
      onClose={() => setIsScheduleDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <material_1.DialogTitle>Schedule Report</material_1.DialogTitle>
      <material_1.DialogContent>
        <material_1.Grid container spacing={3} sx={{ mt: 1 }}>
          <material_1.Grid item xs={12}>
            <material_1.TextField
              fullWidth
              select
              label="Frequency"
              value={scheduleData.frequency}
              onChange={(e) => handleScheduleFrequencyChange(e.target.value)}
            >
              <material_1.MenuItem value="daily">Daily</material_1.MenuItem>
              <material_1.MenuItem value="weekly">Weekly</material_1.MenuItem>
              <material_1.MenuItem value="monthly">Monthly</material_1.MenuItem>
            </material_1.TextField>
          </material_1.Grid>
          <material_1.Grid item xs={12}>
            <material_1.TextField
              fullWidth
              label="Recipients"
              placeholder="Enter email addresses (comma-separated)"
              value={scheduleData.recipients.join(", ")}
              onChange={(e) => handleRecipientsChange(e.target.value)}
            />
          </material_1.Grid>
        </material_1.Grid>
      </material_1.DialogContent>
      <material_1.DialogActions>
        <material_1.Button onClick={() => setIsScheduleDialogOpen(false)}>Cancel</material_1.Button>
        <material_1.Button
          variant="contained"
          onClick={() =>
            selectedTemplate && handleScheduleReport(selectedTemplate.id, scheduleData)
          }
        >
          Schedule Report
        </material_1.Button>
      </material_1.DialogActions>
    </material_1.Dialog>
  );
  return (
    <material_1.Box>
      <material_1.Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <material_1.Typography variant="h4">Reports</material_1.Typography>
        <material_1.Button
          variant="contained"
          startIcon={<icons_material_1.Add />}
          onClick={() => {
            setSelectedTemplate(null);
            setIsTemplateDialogOpen(true);
          }}
        >
          Create Template
        </material_1.Button>
      </material_1.Box>

      {loading ? (
        <material_1.Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <material_1.CircularProgress />
        </material_1.Box>
      ) : (
        <>
          <material_1.TableContainer component={material_1.Paper} sx={{ mb: 4 }}>
            <material_1.Table>
              <material_1.TableHead>
                <material_1.TableRow>
                  <material_1.TableCell>Name</material_1.TableCell>
                  <material_1.TableCell>Type</material_1.TableCell>
                  <material_1.TableCell>Format</material_1.TableCell>
                  <material_1.TableCell>Status</material_1.TableCell>
                  <material_1.TableCell align="right">Actions</material_1.TableCell>
                </material_1.TableRow>
              </material_1.TableHead>
              <material_1.TableBody>
                {templates.map((template) => (
                  <material_1.TableRow key={template.id}>
                    <material_1.TableCell>{template.name}</material_1.TableCell>
                    <material_1.TableCell>{template.type}</material_1.TableCell>
                    <material_1.TableCell>{template.format}</material_1.TableCell>
                    <material_1.TableCell>
                      <material_1.Chip
                        label={template.scheduling?.active ? "Active" : "Inactive"}
                        color={template.scheduling?.active ? "success" : "default"}
                        size="small"
                      />
                    </material_1.TableCell>
                    <material_1.TableCell align="right">
                      <material_1.Stack direction="row" spacing={1} justifyContent="flex-end">
                        <material_1.IconButton
                          size="small"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsScheduleDialogOpen(true);
                          }}
                        >
                          <icons_material_1.Schedule />
                        </material_1.IconButton>
                        <material_1.IconButton
                          size="small"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsTemplateDialogOpen(true);
                          }}
                        >
                          <icons_material_1.Edit />
                        </material_1.IconButton>
                        <material_1.IconButton size="small">
                          <icons_material_1.ContentCopy />
                        </material_1.IconButton>
                        <material_1.IconButton size="small" color="error">
                          <icons_material_1.Delete />
                        </material_1.IconButton>
                      </material_1.Stack>
                    </material_1.TableCell>
                  </material_1.TableRow>
                ))}
              </material_1.TableBody>
            </material_1.Table>
          </material_1.TableContainer>

          <material_1.Typography variant="h5" sx={{ mb: 2 }}>
            Scheduled Reports
          </material_1.Typography>
          <material_1.TableContainer component={material_1.Paper}>
            <material_1.Table>
              <material_1.TableHead>
                <material_1.TableRow>
                  <material_1.TableCell>Template</material_1.TableCell>
                  <material_1.TableCell>Status</material_1.TableCell>
                  <material_1.TableCell>Scheduled For</material_1.TableCell>
                  <material_1.TableCell>Completed At</material_1.TableCell>
                  <material_1.TableCell align="right">Actions</material_1.TableCell>
                </material_1.TableRow>
              </material_1.TableHead>
              <material_1.TableBody>
                {scheduledReports.map((report) => (
                  <material_1.TableRow key={report.id}>
                    <material_1.TableCell>{report.templateName}</material_1.TableCell>
                    <material_1.TableCell>
                      <material_1.Chip
                        label={report.status}
                        color={
                          report.status != null
                            ? "success"
                            : report.status != null
                              ? "error"
                              : report.status != null
                                ? "warning"
                                : "default"
                        }
                        size="small"
                      />
                    </material_1.TableCell>
                    <material_1.TableCell>
                      {new Date(report.scheduledFor).toLocaleString()}
                    </material_1.TableCell>
                    <material_1.TableCell>
                      {report.completedAt ? new Date(report.completedAt).toLocaleString() : "-"}
                    </material_1.TableCell>
                    <material_1.TableCell align="right">
                      <material_1.Stack direction="row" spacing={1} justifyContent="flex-end">
                        {report.downloadUrl && (
                          <material_1.IconButton
                            size="small"
                            onClick={() => handleDownloadReport(report.id)}
                          >
                            <icons_material_1.Download />
                          </material_1.IconButton>
                        )}
                      </material_1.Stack>
                    </material_1.TableCell>
                  </material_1.TableRow>
                ))}
              </material_1.TableBody>
            </material_1.Table>
          </material_1.TableContainer>
        </>
      )}

      <TemplateDialog />
      <ScheduleDialog />
    </material_1.Box>
  );
};
exports.Reports = Reports;
//# sourceMappingURL=Reports.js.map
