import { Email } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Link as MuiLink } from "@mui/material";
import { motion } from "framer-motion";
import type React from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      toast.success("Password reset instructions have been sent to your email");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to send reset instructions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.palette.background.default,
        backgroundImage: `radial-gradient(at 50% 0%, ${theme.palette.primary.dark}29 0%, transparent 50%), 
                         radial-gradient(at 100% 0%, ${theme.palette.secondary.dark}29 0%, transparent 50%)`,
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: 400 }}
      >
        <Card
          sx={{
            width: "100%",
            background: "rgba(26, 27, 30, 0.7)",
            backdropFilter: "blur(20px)",
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                mb: 3,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Reset Password
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                textAlign: "center",
                color: "text.secondary",
                opacity: 0.8,
              }}
            >
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: theme.palette.primary.main }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  mb: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  "&:hover": {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  },
                  "&:disabled": {
                    background: theme.palette.action.disabledBackground,
                  },
                }}
              >
                {isSubmitting ? "Sending..." : "Send Reset Instructions"}
              </Button>

              <Typography variant="body2" align="center">
                Remember your password?{" "}
                <MuiLink
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                      color: theme.palette.primary.light,
                    },
                  }}
                >
                  Back to Login
                </MuiLink>
              </Typography>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default ForgotPassword;
