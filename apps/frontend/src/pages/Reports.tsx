import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  ContentCopy as DuplicateIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: "expense" | "receipt" | "custom";
  format: "pdf" | "csv" | "excel";
  filters: {
    dateRange: "day" | "week" | "month" | "quarter" | "year" | "custom";
    startDate?: Date;
    endDate?: Date;
    categories?: string[];
    tags?: string[];
    status?: string[];
  };
  scheduling?: {
    frequency: "daily" | "weekly" | "monthly" | "custom";
    nextRun: Date;
    recipients: string[];
    active: boolean;
  };
  customization?: {
    logo?: boolean;
    headers?: string[];
    groupBy?: string[];
    sortBy?: string[];
    summary?: boolean;
  };
}

interface ScheduledReport {
  id: string;
  templateId: string;
  templateName: string;
  status: "scheduled" | "running" | "completed" | "failed";
  createdAt: Date;
  scheduledFor: Date;
  completedAt?: Date;
  downloadUrl?: string;
  error?: string;
}

interface ScheduleFormData {
  frequency: "daily" | "weekly" | "monthly" | "custom";
  nextRun: Date;
  recipients: string[];
  active: boolean;
}

export const Reports: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleFormData>({
    frequency: "monthly",
    nextRun: new Date(),
    recipients: [],
    active: true,
  });
  const [templateForm, setTemplateForm] = useState<Partial<ReportTemplate>>({
    name: "",
    description: "",
    type: "expense",
    format: "pdf",
  });

  useEffect(() => {
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
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (template: Partial<ReportTemplate>) => {
    try {
      const response = await fetch("/api/reports/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });

      if (!response.ok) throw new Error("Failed to create template");

      const newTemplate = await response.json();
      setTemplates((prev) => [...prev, newTemplate]);
      toast.success("Template created successfully");
      setIsTemplateDialogOpen(false);
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    }
  };

  const handleScheduleReport = async (
    templateId: string,
    schedule: ReportTemplate["scheduling"],
  ) => {
    try {
      const response = await fetch(`/api/reports/templates/${templateId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });

      if (!response.ok) throw new Error("Failed to schedule report");

      await fetchTemplatesAndReports();
      toast.success("Report scheduled successfully");
      setIsScheduleDialogOpen(false);
    } catch (error) {
      console.error("Error scheduling report:", error);
      toast.error("Failed to schedule report");
    }
  };

  const handleDownloadReport = async (reportId: string) => {
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
      toast.error("Failed to download report");
    }
  };

  const handleScheduleFrequencyChange = (frequency: ScheduleFormData["frequency"]) => {
    setScheduleData((prev) => ({
      ...prev,
      frequency,
    }));
  };

  const handleRecipientsChange = (recipientsString: string) => {
    setScheduleData((prev) => ({
      ...prev,
      recipients: recipientsString
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean),
    }));
  };

  const handleTemplateFormChange = (field: keyof ReportTemplate, value: any) => {
    setTemplateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTemplateSubmit = () => {
    if (!templateForm.name || !templateForm.type || !templateForm.format) {
      toast.error("Please fill in all required fields");
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

  const TemplateDialog: React.FC = () => (
    <Dialog
      open={isTemplateDialogOpen}
      onClose={() => setIsTemplateDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {selectedTemplate ? "Edit Report Template" : "Create Report Template"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Template Name"
              required
              value={templateForm.name}
              onChange={(e) => handleTemplateFormChange("name", e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={templateForm.description}
              onChange={(e) => handleTemplateFormChange("description", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Report Type"
              required
              value={templateForm.type}
              onChange={(e) => handleTemplateFormChange("type", e.target.value)}
            >
              <MenuItem value="expense">Expense Report</MenuItem>
              <MenuItem value="receipt">Receipt Report</MenuItem>
              <MenuItem value="custom">Custom Report</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Output Format"
              required
              value={templateForm.format}
              onChange={(e) => handleTemplateFormChange("format", e.target.value)}
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsTemplateDialogOpen(false)}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleTemplateSubmit}>
          {selectedTemplate ? "Save Changes" : "Create Template"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const ScheduleDialog: React.FC = () => (
    <Dialog
      open={isScheduleDialogOpen}
      onClose={() => setIsScheduleDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Schedule Report</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Frequency"
              value={scheduleData.frequency}
              onChange={(e) =>
                handleScheduleFrequencyChange(e.target.value as ScheduleFormData["frequency"])
              }
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Recipients"
              placeholder="Enter email addresses (comma-separated)"
              value={scheduleData.recipients.join(", ")}
              onChange={(e) => handleRecipientsChange(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() =>
            selectedTemplate && handleScheduleReport(selectedTemplate.id, scheduleData)
          }
        >
          Schedule Report
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">Reports</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedTemplate(null);
            setIsTemplateDialogOpen(true);
          }}
        >
          Create Template
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Format</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>{template.type}</TableCell>
                    <TableCell>{template.format}</TableCell>
                    <TableCell>
                      <Chip
                        label={template.scheduling?.active ? "Active" : "Inactive"}
                        color={template.scheduling?.active ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsScheduleDialogOpen(true);
                          }}
                        >
                          <ScheduleIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsTemplateDialogOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <DuplicateIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" sx={{ mb: 2 }}>
            Scheduled Reports
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Template</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Scheduled For</TableCell>
                  <TableCell>Completed At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduledReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.templateName}</TableCell>
                    <TableCell>
                      <Chip
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
                    </TableCell>
                    <TableCell>{new Date(report.scheduledFor).toLocaleString()}</TableCell>
                    <TableCell>
                      {report.completedAt ? new Date(report.completedAt).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {report.downloadUrl && (
                          <IconButton size="small" onClick={() => handleDownloadReport(report.id)}>
                            <DownloadIcon />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <TemplateDialog />
      <ScheduleDialog />
    </Box>
  );
};
