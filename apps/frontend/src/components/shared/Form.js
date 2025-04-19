"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Form = Form;
const material_1 = require("@mui/material");
const react_1 = require("react");
const Notification_1 = require("./Notification");
function Form({ fields, onSubmit, submitButtonText = 'Submit', children }) {
    const { showNotification } = (0, Notification_1.useNotification)();
    const [values, setValues] = (0, react_1.useState)(fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue || '';
        return acc;
    }, {}));
    const [errors, setErrors] = (0, react_1.useState)({});
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const validateField = (field, value) => {
        if (field.required && !value) {
            return `${field.label} is required`;
        }
        if (field.validation) {
            return field.validation(value);
        }
        return undefined;
    };
    const handleChange = (field) => (event) => {
        const { value } = event.target;
        setValues(prev => ({ ...prev, [field.name]: value }));
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field.name]: error || '' }));
    };
    const validateForm = () => {
        const newErrors = {};
        let isValid = true;
        fields.forEach(field => {
            const error = validateField(field, values[field.name]);
            if (error) {
                newErrors[field.name] = error;
                isValid = false;
            }
        });
        setErrors(newErrors);
        return isValid;
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) {
            showNotification('Please fix the errors in the form', 'error');
            return;
        }
        try {
            setIsSubmitting(true);
            await onSubmit(values);
            showNotification('Form submitted successfully', 'success');
        }
        catch (error) {
            showNotification(error instanceof Error ? error.message : 'An error occurred', 'error');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<material_1.Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {fields.map(field => (<material_1.TextField key={field.name} fullWidth margin="normal" name={field.name} label={field.label} type={field.type || 'text'} value={values[field.name]} onChange={handleChange(field)} error={!!errors[field.name]} helperText={errors[field.name]} required={field.required} disabled={isSubmitting}/>))}

      {children}

      <material_1.Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : submitButtonText}
      </material_1.Button>
    </material_1.Box>);
}
//# sourceMappingURL=Form.js.map