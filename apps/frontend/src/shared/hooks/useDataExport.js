Object.defineProperty(exports, "__esModule", { value: true });
exports.useDataExport = void 0;
const react_1 = require("react");
const useDataExport = () => {
  const [loading, setLoading] = (0, react_1.useState)(false);
  const [error, setError] = (0, react_1.useState)(null);
  const exportData = async (options) => {
    try {
      setLoading(true);
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });
      if (!response.ok) {
        throw new Error("Failed to export data");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expense-report.${options.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  return {
    loading,
    error,
    exportData,
  };
};
exports.useDataExport = useDataExport;
//# sourceMappingURL=useDataExport.js.map
