import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  Slider,
  Switch,
  Typography,
} from "@mui/material";
import type React from "react";
import { useState } from "react";

interface MatchingPreferences {
  weights: {
    merchant: number;
    amount: number;
    date: number;
    location: number;
    category: number;
    paymentMethod: number;
    text: number;
  };
  amountTolerance: number;
  dateRangeDays: number;
  merchantMatchThreshold: number;
}

const defaultPreferences: MatchingPreferences = {
  weights: {
    merchant: 0.4,
    amount: 0.3,
    date: 0.2,
    location: 0.05,
    category: 0.05,
    paymentMethod: 0,
    text: 0,
  },
  amountTolerance: 0.1,
  dateRangeDays: 3,
  merchantMatchThreshold: 0.8,
};

interface ReceiptMatchingPreferencesProps {
  onSave: (preferences: MatchingPreferences) => void;
  initialPreferences?: MatchingPreferences;
}

export const ReceiptMatchingPreferences: React.FC<ReceiptMatchingPreferencesProps> = ({
  onSave,
  initialPreferences = defaultPreferences,
}) => {
  const [preferences, setPreferences] = useState<MatchingPreferences>(initialPreferences);
  const [isEditing, setIsEditing] = useState(false);

  const handleWeightChange =
    (key: keyof MatchingPreferences["weights"]) => (_: Event, value: number | number[]) => {
      setPreferences((prev) => ({
        ...prev,
        weights: {
          ...prev.weights,
          [key]: value as number,
        },
      }));
    };

  const handleThresholdChange =
    (key: keyof Omit<MatchingPreferences, "weights">) => (_: Event, value: number | number[]) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: value as number,
      }));
    };

  const handleSave = () => {
    onSave(preferences);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Receipt Matching Preferences</Typography>
          <FormControlLabel
            control={
              <Switch checked={isEditing} onChange={(e) => setIsEditing(e.target.checked)} />
            }
            label="Edit Preferences"
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography gutterBottom>Matching Weights</Typography>
            {Object.entries(preferences.weights).map(([key, value]) => (
              <Box key={key} mb={2}>
                <Typography variant="body2" gutterBottom>
                  {key.charAt(0).toUpperCase() + key.slice(1)} Weight
                </Typography>
                <Slider
                  value={value}
                  onChange={handleWeightChange(key as keyof MatchingPreferences["weights"])}
                  min={0}
                  max={1}
                  step={0.05}
                  disabled={!isEditing}
                  valueLabelDisplay="auto"
                />
              </Box>
            ))}
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Amount Tolerance</Typography>
            <Slider
              value={preferences.amountTolerance}
              onChange={handleThresholdChange("amountTolerance")}
              min={0}
              max={0.5}
              step={0.01}
              disabled={!isEditing}
              valueLabelDisplay="auto"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Date Range (Days)</Typography>
            <Slider
              value={preferences.dateRangeDays}
              onChange={handleThresholdChange("dateRangeDays")}
              min={1}
              max={7}
              step={1}
              disabled={!isEditing}
              valueLabelDisplay="auto"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Merchant Match Threshold</Typography>
            <Slider
              value={preferences.merchantMatchThreshold}
              onChange={handleThresholdChange("merchantMatchThreshold")}
              min={0.5}
              max={1}
              step={0.05}
              disabled={!isEditing}
              valueLabelDisplay="auto"
            />
          </Grid>
        </Grid>

        {isEditing && (
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Preferences
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
