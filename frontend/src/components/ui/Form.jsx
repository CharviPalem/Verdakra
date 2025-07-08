const FormGroup = ({ children, className = "", ...props }) => (
  <div className={`space-y-2 ${className}`} {...props}>
    {children}
  </div>
);

const FormLabel = ({ children, className = "", htmlFor, ...props }) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  >
    {children}
  </label>
);

const FormDescription = ({ children, className = "", ...props }) => (
  <p
    className={`text-sm text-gray-400 ${className}`}
    {...props}
  >
    {children}
  </p>
);

const FormField = ({ children, className = "", ...props }) => (
  <div className={`grid gap-2 ${className}`} {...props}>
    {children}
  </div>
);

const FormInput = ({ className = "", ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const FormTextarea = ({ className = "", ...props }) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const FormSelect = ({ children, className = "", ...props }) => (
  <select
    className={`flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </select>
);

const FormCheckbox = ({ className = "", ...props }) => (
  <input
    type="checkbox"
    className={`h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-600 ${className}`}
    {...props}
  />
);

const FormError = ({ children, className = "", ...props }) => (
  <p
    className={`text-sm font-medium text-red-500 ${className}`}
    {...props}
  >
    {children}
  </p>
);

export {
  FormGroup,
  FormLabel,
  FormDescription,
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormError
};
