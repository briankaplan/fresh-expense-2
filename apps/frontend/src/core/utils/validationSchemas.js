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
exports.profileSchema =
  exports.expenseSchema =
  exports.registerSchema =
  exports.loginSchema =
    void 0;
const yup = __importStar(require("yup"));
exports.loginSchema = yup.object({
  email: yup.string().email("Please enter a valid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});
exports.registerSchema = yup.object({
  email: yup.string().email("Please enter a valid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  firstName: yup
    .string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastName: yup
    .string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
});
exports.expenseSchema = yup.object({
  amount: yup.number().positive("Amount must be positive").required("Amount is required"),
  description: yup
    .string()
    .min(3, "Description must be at least 3 characters")
    .required("Description is required"),
  category: yup.string().required("Category is required"),
  date: yup.date().max(new Date(), "Date cannot be in the future").required("Date is required"),
  merchant: yup
    .string()
    .min(2, "Merchant name must be at least 2 characters")
    .required("Merchant is required"),
});
exports.profileSchema = yup.object({
  firstName: yup
    .string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastName: yup
    .string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  email: yup.string().email("Please enter a valid email").required("Email is required"),
  phone: yup.string().matches(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
  company: yup.string().min(2, "Company name must be at least 2 characters"),
});
//# sourceMappingURL=validationSchemas.js.map
