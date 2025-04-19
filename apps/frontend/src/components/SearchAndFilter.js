const __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        let desc = Object.getOwnPropertyDescriptor(m, k);
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
const __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o.default = v;
      });
const __importStar =
  (this && this.__importStar) ||
  (() => {
    let ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          const ar = [];
          for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod?.__esModule) return mod;
      const result = {};
      if (mod != null)
        for (let k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchAndFilter = SearchAndFilter;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const useDebouncedSearch_1 = require("@/hooks/useDebouncedSearch");
function SearchAndFilter({ onSearch, onFilter, filterOptions, placeholder = "Search..." }) {
  const [searchValue, setSearchValue] = (0, useDebouncedSearch_1.useDebouncedSearch)("");
  const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
  const [activeFilters, setActiveFilters] = (0, react_1.useState)({});
  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };
  const handleSearchClear = () => {
    setSearchValue("");
  };
  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleFilterClose = () => {
    setAnchorEl(null);
  };
  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };
  const handleRemoveFilter = (key) => {
    const { [key]: removed, ...remainingFilters } = activeFilters;
    setActiveFilters(remainingFilters);
    onFilter(remainingFilters);
  };
  react_1.default.useEffect(() => {
    onSearch(searchValue);
  }, [searchValue, onSearch]);
  return (
    <material_1.Box sx={{ mb: 2 }}>
      <material_1.Stack direction="row" spacing={1} alignItems="center">
        <material_1.TextField
          fullWidth
          variant="outlined"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <material_1.InputAdornment position="start">
                <icons_material_1.Search />
              </material_1.InputAdornment>
            ),
            endAdornment: searchValue && (
              <material_1.InputAdornment position="end">
                <material_1.IconButton onClick={handleSearchClear} size="small">
                  <icons_material_1.Clear />
                </material_1.IconButton>
              </material_1.InputAdornment>
            ),
          }}
        />
        <material_1.IconButton onClick={handleFilterClick}>
          <icons_material_1.FilterList />
        </material_1.IconButton>
      </material_1.Stack>

      {Object.keys(activeFilters).length > 0 && (
        <material_1.Box sx={{ mt: 1 }}>
          <material_1.Stack direction="row" spacing={1} flexWrap="wrap">
            {Object.entries(activeFilters).map(([key, value]) => {
              const option = filterOptions.find((opt) => opt.value === key);
              return (
                <material_1.Chip
                  key={key}
                  label={`${option?.label}: ${value}`}
                  onDelete={() => handleRemoveFilter(key)}
                  sx={{ m: 0.5 }}
                />
              );
            })}
          </material_1.Stack>
        </material_1.Box>
      )}

      <material_1.Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleFilterClose}>
        {filterOptions.map((option) => (
          <material_1.MenuItem key={option.value}>
            <material_1.Box sx={{ minWidth: 200 }}>
              <material_1.Typography variant="subtitle2" sx={{ mb: 1 }}>
                {option.label}
              </material_1.Typography>
              {option.type === "select" && option.options ? (
                <material_1.TextField
                  select
                  fullWidth
                  value={activeFilters[option.value] || ""}
                  onChange={(e) => handleFilterChange(option.value, e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">All</option>
                  {option.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </material_1.TextField>
              ) : (
                <material_1.TextField
                  fullWidth
                  type={option.type}
                  value={activeFilters[option.value] || ""}
                  onChange={(e) => handleFilterChange(option.value, e.target.value)}
                />
              )}
            </material_1.Box>
          </material_1.MenuItem>
        ))}
      </material_1.Menu>
    </material_1.Box>
  );
}
//# sourceMappingURL=SearchAndFilter.js.map
