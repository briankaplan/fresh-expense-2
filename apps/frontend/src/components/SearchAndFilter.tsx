import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';

export interface FilterOption {
  label: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { label: string; value: string }[];
}

interface SearchAndFilterProps {
  onSearch: (value: string) => void;
  onFilter: (filters: Record<string, any>) => void;
  filterOptions: FilterOption[];
  placeholder?: string;
}

export function SearchAndFilter({
  onSearch,
  onFilter,
  filterOptions,
  placeholder = 'Search...',
}: SearchAndFilterProps) {
  const [searchValue, setSearchValue] = useDebouncedSearch('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleSearchClear = () => {
    setSearchValue('');
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const handleRemoveFilter = (key: string) => {
    const { [key]: removed, ...remainingFilters } = activeFilters;
    setActiveFilters(remainingFilters);
    onFilter(remainingFilters);
  };

  React.useEffect(() => {
    onSearch(searchValue);
  }, [searchValue, onSearch]);

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          fullWidth
          variant="outlined"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <IconButton onClick={handleSearchClear} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <IconButton onClick={handleFilterClick}>
          <FilterIcon />
        </IconButton>
      </Stack>

      {Object.keys(activeFilters).length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {Object.entries(activeFilters).map(([key, value]) => {
              const option = filterOptions.find(opt => opt.value === key);
              return (
                <Chip
                  key={key}
                  label={`${option?.label}: ${value}`}
                  onDelete={() => handleRemoveFilter(key)}
                  sx={{ m: 0.5 }}
                />
              );
            })}
          </Stack>
        </Box>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleFilterClose}>
        {filterOptions.map(option => (
          <MenuItem key={option.value}>
            <Box sx={{ minWidth: 200 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {option.label}
              </Typography>
              {option.type === 'select' && option.options ? (
                <TextField
                  select
                  fullWidth
                  value={activeFilters[option.value] || ''}
                  onChange={e => handleFilterChange(option.value, e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">All</option>
                  {option.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </TextField>
              ) : (
                <TextField
                  fullWidth
                  type={option.type}
                  value={activeFilters[option.value] || ''}
                  onChange={e => handleFilterChange(option.value, e.target.value)}
                />
              )}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
