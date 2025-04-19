import * as yup from 'yup';
export declare const loginSchema: yup.ObjectSchema<{
    email: string;
    password: string;
}, yup.AnyObject, {
    email: undefined;
    password: undefined;
}, "">;
export declare const registerSchema: yup.ObjectSchema<{
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
}, yup.AnyObject, {
    email: undefined;
    password: undefined;
    confirmPassword: undefined;
    firstName: undefined;
    lastName: undefined;
}, "">;
export declare const expenseSchema: yup.ObjectSchema<{
    amount: number;
    description: string;
    category: string;
    date: Date;
    merchant: string;
}, yup.AnyObject, {
    amount: undefined;
    description: undefined;
    category: undefined;
    date: undefined;
    merchant: undefined;
}, "">;
export declare const profileSchema: yup.ObjectSchema<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string | undefined;
    company: string | undefined;
}, yup.AnyObject, {
    firstName: undefined;
    lastName: undefined;
    email: undefined;
    phone: undefined;
    company: undefined;
}, "">;
//# sourceMappingURL=validationSchemas.d.ts.map